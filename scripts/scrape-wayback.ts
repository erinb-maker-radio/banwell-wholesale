/**
 * Wayback Machine Scraper for banwelldesigns.com
 *
 * Queries the CDX API, downloads archived pages, parses content,
 * downloads images, and outputs structured JSON.
 *
 * Usage: npx tsx scripts/scrape-wayback.ts
 */

import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

const DOMAIN = 'banwelldesigns.com'
const CDX_API = `https://web.archive.org/cdx/search/cdx`
const OUTPUT_DIR = path.join(__dirname, 'wayback-data')
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images', 'brand')

// Rate limiting
const DELAY_MS = 1200 // 1.2 seconds between requests

// Known content pages we want to scrape
const TARGET_PAGES = [
  '/',
  '/about-us/',
  '/plague-doctor/',
  '/plague-doctor-costume/',
  '/plague-doctor-hood/',
  '/plague-doctor-top-hat/',
  '/the-furst/',
  '/dr-beulenpest/',
  '/the-ichabod/',
  '/the-krankheit/',
  '/the-maximus/',
  '/the-schnabel/',
  '/the-stiltzkin/',
  '/the-corax/',
  '/the-icarus/',
  '/the-bubonis/',
  '/the-jackdaw/',
  '/the-pestis/',
  '/the-miasma/',
  '/the-mantle/',
  '/the-galileo-pouch/',
  '/winged-staff-topper/',
  '/gas-mask-66/',
  '/fashion-masks/',
  '/steam-punk/',
  '/out-in-the-wild/',
  '/copyright-licensing/',
  '/muzeo-2/',
  '/trapholt-2/',
]

interface PageContent {
  url: string
  slug: string
  title: string
  headings: { level: number; text: string }[]
  paragraphs: string[]
  images: { src: string; alt: string; localPath?: string }[]
  links: { href: string; text: string }[]
  rawHtml: string
  sections: ContentSection[]
}

interface ContentSection {
  heading?: string
  content: string[]
  images: { src: string; alt: string }[]
}

interface CdxEntry {
  urlkey: string
  timestamp: string
  original: string
  mimetype: string
  statuscode: string
  digest: string
  length: string
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'BanwellDesigns-Archiver/1.0 (site restoration project)'
        }
      })
      if (resp.ok) return resp
      if (resp.status === 429) {
        console.log(`  Rate limited, waiting ${(i + 1) * 5}s...`)
        await sleep((i + 1) * 5000)
        continue
      }
      if (resp.status === 404) {
        console.log(`  404 - Not found`)
        return null
      }
      console.log(`  HTTP ${resp.status}, retry ${i + 1}/${retries}`)
      await sleep(2000)
    } catch (err: any) {
      console.log(`  Fetch error: ${err.message}, retry ${i + 1}/${retries}`)
      await sleep(3000)
    }
  }
  return null
}

/**
 * Query CDX API to find the best snapshot timestamp for each page
 */
async function getCdxEntries(): Promise<Map<string, string>> {
  console.log('Querying CDX API for archived pages...')

  const params = new URLSearchParams({
    url: `${DOMAIN}/*`,
    output: 'json',
    'filter': 'statuscode:200',
    'collapse': 'urlkey',
    'fl': 'urlkey,timestamp,original,mimetype,statuscode',
  })

  const resp = await fetchWithRetry(`${CDX_API}?${params}`)
  if (!resp) {
    console.error('Failed to query CDX API')
    process.exit(1)
  }

  const data = await resp.json() as string[][]
  // First row is headers
  const headers = data[0]
  const entries = data.slice(1)

  console.log(`Found ${entries.length} total archived URLs`)

  // Build a map of URL path -> best timestamp
  const pageTimestamps = new Map<string, string>()

  for (const entry of entries) {
    const original = entry[2] // original URL
    const timestamp = entry[1]
    const mimetype = entry[3]

    // Only HTML pages
    if (mimetype && !mimetype.includes('text/html')) continue

    // Extract path from URL
    let urlPath = original.replace(/^https?:\/\/[^/]+/, '')
    if (!urlPath.startsWith('/')) urlPath = '/' + urlPath

    // Check if this is one of our target pages
    const normalizedPath = urlPath.endsWith('/') ? urlPath : urlPath + '/'
    const normalizedNoSlash = urlPath.replace(/\/$/, '') || '/'

    if (TARGET_PAGES.includes(normalizedPath) || TARGET_PAGES.includes(normalizedNoSlash) || normalizedNoSlash === '') {
      // Keep the latest timestamp for each page
      const key = normalizedNoSlash === '' ? '/' : normalizedNoSlash
      const existing = pageTimestamps.get(key)
      if (!existing || timestamp > existing) {
        pageTimestamps.set(key, timestamp)
      }
    }
  }

  console.log(`Found timestamps for ${pageTimestamps.size} target pages`)
  return pageTimestamps
}

/**
 * Also get CDX entries for images to find timestamps
 */
async function getImageTimestamps(): Promise<Map<string, string>> {
  console.log('Querying CDX API for archived images...')

  const params = new URLSearchParams({
    url: `${DOMAIN}/wp-content/uploads/*`,
    output: 'json',
    'filter': 'statuscode:200',
    'collapse': 'urlkey',
    'fl': 'urlkey,timestamp,original,mimetype,statuscode',
  })

  const resp = await fetchWithRetry(`${CDX_API}?${params}`)
  if (!resp) {
    console.log('Could not get image timestamps from CDX')
    return new Map()
  }

  const data = await resp.json() as string[][]
  const entries = data.slice(1) // skip headers
  const timestamps = new Map<string, string>()

  for (const entry of entries) {
    const original = entry[2]
    const timestamp = entry[1]
    const mimetype = entry[3]

    if (mimetype && (mimetype.includes('image/') || mimetype.includes('application/octet-stream'))) {
      // Normalize to get base image URL (strip size variants)
      const existing = timestamps.get(original)
      if (!existing || timestamp > existing) {
        timestamps.set(original, timestamp)
      }
    }
  }

  console.log(`Found ${timestamps.size} archived image URLs`)
  return timestamps
}

/**
 * Download and parse a single page from Wayback Machine
 */
async function scrapePage(pagePath: string, timestamp: string): Promise<PageContent | null> {
  const originalUrl = `https://${DOMAIN}${pagePath}`
  // id_ suffix returns original HTML without Wayback toolbar
  const waybackUrl = `https://web.archive.org/web/${timestamp}id_/${originalUrl}`

  console.log(`Scraping: ${pagePath}`)

  const resp = await fetchWithRetry(waybackUrl)
  if (!resp) {
    console.log(`  Failed to fetch ${pagePath}`)
    return null
  }

  const html = await resp.text()
  const $ = cheerio.load(html)

  // Remove script tags, style tags, nav, header, footer boilerplate
  $('script').remove()
  $('style').remove()
  $('noscript').remove()

  // Extract page title
  const title = $('title').first().text().trim()
    .replace(/\s*[|–-]\s*Banwell Designs.*$/i, '')
    .replace(/\s*Banwell Designs.*$/i, '')
    .trim() || pagePath.replace(/\//g, '').replace(/-/g, ' ')

  // Extract headings
  const headings: { level: number; text: string }[] = []
  $('h1, h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim()
    if (text) {
      headings.push({
        level: parseInt(el.tagName.replace('h', '')),
        text,
      })
    }
  })

  // Extract paragraphs
  const paragraphs: string[] = []
  $('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text && text.length > 5) {
      paragraphs.push(text)
    }
  })

  // Extract images (from content area)
  const images: { src: string; alt: string }[] = []
  const seenSrcs = new Set<string>()
  $('img').each((_, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || ''
    const alt = $(el).attr('alt') || ''

    // Clean up Wayback URLs
    src = cleanWaybackUrl(src)

    // Only keep content images (wp-content/uploads)
    if (src && src.includes('wp-content/uploads') && !seenSrcs.has(src)) {
      seenSrcs.add(src)
      images.push({ src, alt })
    }
  })

  // Also check for background images in inline styles
  $('[style*="background"]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/)
    if (match) {
      let src = cleanWaybackUrl(match[1])
      if (src && src.includes('wp-content/uploads') && !seenSrcs.has(src)) {
        seenSrcs.add(src)
        images.push({ src, alt: '' })
      }
    }
  })

  // Extract links
  const links: { href: string; text: string }[] = []
  $('a').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    if (href && text && href.includes('banwelldesigns.com')) {
      links.push({ href: cleanWaybackUrl(href), text })
    }
  })

  // Build content sections (heading + following content)
  const sections = buildSections($)

  const slug = pagePath === '/' ? 'home' : pagePath.replace(/^\/|\/$/g, '')

  return {
    url: originalUrl,
    slug,
    title,
    headings,
    paragraphs,
    images,
    links,
    rawHtml: html,
    sections,
  }
}

/**
 * Clean Wayback Machine URL wrappers to get original URL
 */
function cleanWaybackUrl(url: string): string {
  if (!url) return ''

  // Remove Wayback Machine prefix
  // Pattern: /web/20230303085617/ or /web/20230303085617im_/ etc.
  const waybackPattern = /https?:\/\/web\.archive\.org\/web\/\d+(?:im_|id_|js_|cs_|if_)?\//
  url = url.replace(waybackPattern, '')

  // If it starts with // add https:
  if (url.startsWith('//')) url = 'https:' + url

  // Ensure it has protocol
  if (url.startsWith('http')) return url
  if (url.startsWith('/wp-content')) return `https://${DOMAIN}${url}`

  return url
}

/**
 * Build structured content sections from the page
 */
function buildSections($: cheerio.CheerioAPI): ContentSection[] {
  const sections: ContentSection[] = []
  let currentSection: ContentSection = { content: [], images: [] }

  // Look for main content area
  const contentSelectors = [
    '.elementor-widget-container',
    '.entry-content',
    'article',
    '.site-content',
    'main',
    'body',
  ]

  let $content: cheerio.Cheerio<cheerio.Element> | null = null
  for (const selector of contentSelectors) {
    const $el = $(selector)
    if ($el.length > 0) {
      $content = $el
      break
    }
  }

  if (!$content) return sections

  $content.children().each((_, el) => {
    const $el = $(el)
    const tagName = el.tagName?.toLowerCase()

    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
      // Start new section
      if (currentSection.content.length > 0 || currentSection.images.length > 0) {
        sections.push(currentSection)
      }
      currentSection = {
        heading: $el.text().trim(),
        content: [],
        images: [],
      }
    } else if (tagName === 'p') {
      const text = $el.text().trim()
      if (text && text.length > 5) {
        currentSection.content.push(text)
      }
    } else if (tagName === 'img' || $el.find('img').length > 0) {
      const $img = tagName === 'img' ? $el : $el.find('img').first()
      const src = cleanWaybackUrl($img.attr('src') || $img.attr('data-src') || '')
      if (src && src.includes('wp-content')) {
        currentSection.images.push({
          src,
          alt: $img.attr('alt') || '',
        })
      }
    }

    // Recurse into divs
    if (tagName === 'div' || tagName === 'section') {
      $el.find('p').each((_, p) => {
        const text = $(p).text().trim()
        if (text && text.length > 5) {
          currentSection.content.push(text)
        }
      })
      $el.find('img').each((_, img) => {
        const src = cleanWaybackUrl($(img).attr('src') || $(img).attr('data-src') || '')
        if (src && src.includes('wp-content')) {
          currentSection.images.push({
            src,
            alt: $(img).attr('alt') || '',
          })
        }
      })
    }
  })

  if (currentSection.content.length > 0 || currentSection.images.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Get the original (full-size) image URL from a potentially resized variant
 */
function getOriginalImageUrl(url: string): string {
  // WordPress size variants: image-300x300.jpg, image-1024x1024.jpg
  return url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
}

/**
 * Download an image from Wayback Machine
 */
async function downloadImage(
  imageUrl: string,
  imageTimestamps: Map<string, string>,
  category: string
): Promise<string | null> {
  const originalUrl = getOriginalImageUrl(imageUrl)

  // Get filename
  const urlObj = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${DOMAIN}${originalUrl}`)
  const filename = path.basename(urlObj.pathname)

  // Determine output directory
  const categoryDir = path.join(IMAGE_DIR, category)
  const outputPath = path.join(categoryDir, filename)

  // Skip if already downloaded
  if (fs.existsSync(outputPath)) {
    return path.relative(path.join(__dirname, '..', 'public'), outputPath).replace(/\\/g, '/')
  }

  // Find a timestamp for this image
  let timestamp = imageTimestamps.get(originalUrl) || imageTimestamps.get(imageUrl)

  // If no exact match, try finding any matching image
  if (!timestamp) {
    for (const [key, ts] of imageTimestamps) {
      if (key.includes(filename)) {
        timestamp = ts
        break
      }
    }
  }

  // Default to a known good snapshot date
  if (!timestamp) timestamp = '20230303085617'

  const fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${DOMAIN}${originalUrl}`
  const waybackUrl = `https://web.archive.org/web/${timestamp}id_/${fullUrl}`

  const resp = await fetchWithRetry(waybackUrl)
  if (!resp) {
    // Try without id_ suffix
    const altUrl = `https://web.archive.org/web/${timestamp}/${fullUrl}`
    const resp2 = await fetchWithRetry(altUrl)
    if (!resp2) return null

    const buffer = await resp2.arrayBuffer()
    fs.mkdirSync(categoryDir, { recursive: true })
    fs.writeFileSync(outputPath, Buffer.from(buffer))
  } else {
    const buffer = await resp.arrayBuffer()
    fs.mkdirSync(categoryDir, { recursive: true })
    fs.writeFileSync(outputPath, Buffer.from(buffer))
  }

  const relativePath = path.relative(path.join(__dirname, '..', 'public'), outputPath).replace(/\\/g, '/')
  console.log(`  Downloaded: ${filename} -> ${relativePath}`)
  return relativePath
}

/**
 * Categorize an image based on its URL path and the page it was found on
 */
function categorizeImage(imageUrl: string, pageSlug: string): string {
  const url = imageUrl.toLowerCase()

  if (url.includes('logo') || url.includes('client')) return 'logos'
  if (url.includes('plague') || url.includes('doctor')) return 'plague-doctor'
  if (url.includes('steam') || url.includes('punk')) return 'steampunk'
  if (url.includes('fashion') || url.includes('mask') || url.includes('masquerade')) return 'fashion'
  if (url.includes('wild') || url.includes('gallery')) return 'gallery'
  if (url.includes('muzeo') || url.includes('trapholt') || url.includes('museum')) return 'gallery'

  // Categorize by the page it was found on
  if (pageSlug.includes('plague') || pageSlug.includes('furst') || pageSlug.includes('beulenpest') ||
      pageSlug.includes('ichabod') || pageSlug.includes('krankheit') || pageSlug.includes('maximus') ||
      pageSlug.includes('schnabel') || pageSlug.includes('stiltzkin') || pageSlug.includes('corax') ||
      pageSlug.includes('icarus') || pageSlug.includes('bubonis') || pageSlug.includes('jackdaw') ||
      pageSlug.includes('pestis') || pageSlug.includes('miasma') || pageSlug.includes('mantle') ||
      pageSlug.includes('gas-mask')) return 'plague-doctor'
  if (pageSlug.includes('steam')) return 'steampunk'
  if (pageSlug.includes('fashion')) return 'fashion'
  if (pageSlug.includes('wild') || pageSlug.includes('muzeo') || pageSlug.includes('trapholt')) return 'gallery'
  if (pageSlug.includes('galileo') || pageSlug.includes('staff') || pageSlug.includes('hood') ||
      pageSlug.includes('hat') || pageSlug.includes('costume')) return 'accessories'
  if (pageSlug === 'home' || pageSlug === 'about-us') return 'general'

  return 'general'
}

async function main() {
  console.log('=== Banwell Designs Wayback Machine Scraper ===\n')

  // Create output directories
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.mkdirSync(IMAGE_DIR, { recursive: true })

  // Step 1: Get CDX entries
  const pageTimestamps = await getCdxEntries()
  await sleep(DELAY_MS)

  // Step 2: Get image timestamps
  const imageTimestamps = await getImageTimestamps()
  await sleep(DELAY_MS)

  // Step 3: Scrape each page
  const pages: PageContent[] = []
  const allImages: Map<string, { src: string; alt: string; category: string; localPath?: string }> = new Map()

  for (const pagePath of TARGET_PAGES) {
    const normalizedKey = pagePath === '/' ? '/' : pagePath.replace(/\/$/, '')
    let timestamp = pageTimestamps.get(normalizedKey) || pageTimestamps.get(pagePath)

    // Also try with trailing slash variations
    if (!timestamp) {
      timestamp = pageTimestamps.get(normalizedKey + '/') || '20230303085617'
    }

    const page = await scrapePage(pagePath, timestamp)
    if (page) {
      pages.push(page)

      // Collect all images
      for (const img of page.images) {
        const originalSrc = getOriginalImageUrl(img.src)
        if (!allImages.has(originalSrc)) {
          allImages.set(originalSrc, {
            ...img,
            src: originalSrc,
            category: categorizeImage(img.src, page.slug),
          })
        }
      }
    }

    await sleep(DELAY_MS)
  }

  console.log(`\nScraped ${pages.length} pages`)
  console.log(`Found ${allImages.size} unique images\n`)

  // Step 4: Download images
  console.log('Downloading images...')
  const imageManifest: Record<string, string> = {}
  let downloaded = 0
  let failed = 0

  for (const [src, img] of allImages) {
    const localPath = await downloadImage(src, imageTimestamps, img.category)
    if (localPath) {
      imageManifest[src] = '/' + localPath
      img.localPath = '/' + localPath
      downloaded++
    } else {
      failed++
    }
    await sleep(DELAY_MS)
  }

  console.log(`\nDownloaded ${downloaded} images, ${failed} failed`)

  // Step 5: Update page image references with local paths
  for (const page of pages) {
    for (const img of page.images) {
      const originalSrc = getOriginalImageUrl(img.src)
      if (imageManifest[originalSrc]) {
        img.localPath = imageManifest[originalSrc]
      }
    }
  }

  // Step 6: Build navigation structure
  const navigation = {
    brand: [
      { label: 'Home', href: '/' },
      { label: 'Plague Doctor', href: '/plague-doctor', children:
        pages.filter(p =>
          p.slug.startsWith('the-') || p.slug === 'dr-beulenpest'
        ).map(p => ({ label: p.title, href: `/${p.slug}` }))
      },
      { label: 'Steampunk', href: '/steampunk' },
      { label: 'Fashion Masks', href: '/fashion-masks' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'About', href: '/about' },
    ],
    wholesale: [
      { label: 'Catalog', href: '/catalog' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Sign In', href: '/login' },
    ]
  }

  // Step 7: Save output files
  // Pages JSON (without rawHtml to keep file size reasonable)
  const pagesOutput = pages.map(({ rawHtml, ...rest }) => rest)
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages.json'),
    JSON.stringify(pagesOutput, null, 2)
  )
  console.log(`Saved pages.json (${pages.length} pages)`)

  // Save raw HTML separately for reference
  const rawHtmlDir = path.join(OUTPUT_DIR, 'raw-html')
  fs.mkdirSync(rawHtmlDir, { recursive: true })
  for (const page of pages) {
    fs.writeFileSync(
      path.join(rawHtmlDir, `${page.slug}.html`),
      page.rawHtml
    )
  }
  console.log(`Saved raw HTML files`)

  // Navigation JSON
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'navigation.json'),
    JSON.stringify(navigation, null, 2)
  )
  console.log(`Saved navigation.json`)

  // Images manifest
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'images-manifest.json'),
    JSON.stringify(imageManifest, null, 2)
  )
  console.log(`Saved images-manifest.json (${Object.keys(imageManifest).length} images)`)

  console.log('\n=== Scraping complete! ===')
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log(`Images directory: ${IMAGE_DIR}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
