import type { Metadata } from 'next';
import PortraitPage, { buildJsonLd } from './PortraitPage';
import { howItWorks, REVIEWS, HUB_FAQ } from './data';

// HUB — stainedglassportraits.com/
// Server-rendered overview of every portrait category. Served at the root of
// the portraits domain via a host-based rewrite in middleware.

export const metadata: Metadata = {
  title: 'Stained Glass Portraits — Custom Suncatchers From Your Photo | Banwell Designs',
  description:
    'Turn your favorite photo into a handmade stained glass style suncatcher portrait. Pets, weddings, memorials, and more. Designed and made by my wife and I in Chico, California.',
  keywords: [
    'stained glass portrait',
    'custom stained glass from photo',
    'custom photo suncatcher',
    'stained glass style portrait',
    'personalized suncatcher',
  ],
  alternates: { canonical: 'https://stainedglassportraits.com/' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/',
    title: 'Stained Glass Portraits — Custom Suncatchers From Your Photo',
    description:
      'Turn your favorite photo into a handmade stained glass style suncatcher portrait. Pets, weddings, memorials, and more.',
    siteName: 'Banwell Designs',
    images: [
      {
        url: '/images/vet/bulldog-window.jpg',
        width: 1600,
        height: 1365,
        alt: 'Stained glass style portrait suncatcher glowing in a window',
      },
    ],
  },
};

const jsonLd = buildJsonLd({
  productName: 'Custom Stained Glass Style Portrait Suncatcher',
  productDescription:
    'A handmade stained glass style portrait made from your favorite photo and printed on real glass. Pets, weddings, memorials, and more. Designed and made in Chico, California.',
  image: '/images/vet/bulldog-window.jpg',
  url: 'https://stainedglassportraits.com/',
  reviews: REVIEWS,
  faq: HUB_FAQ,
});

const TILES = [
  {
    href: '/pets',
    title: 'Pet Portraits',
    blurb: 'Dogs, cats, horses, birds — your pet in glowing glass, from any clear photo.',
    photo: '/images/vet/hero-cat.jpg',
    alt: 'Stained glass style cat portrait suncatcher',
  },
  {
    href: '/pet-memorial',
    title: 'Pet Memorials',
    blurb: 'A piece you can keep in the light — made from your favorite photo of them.',
    photo: '/images/vet/bulldog-window.jpg',
    alt: 'Stained glass style memorial dog portrait glowing in a window',
  },
  {
    href: '/weddings',
    title: 'Weddings & Anniversaries',
    blurb: 'Your wedding, engagement, or anniversary photo as a handmade keepsake.',
    photo: '/images/vet/balloon-window.jpg',
    alt: 'Stained glass style engagement gift suncatcher in a window',
  },
];

export default function HubPage() {
  return (
    <PortraitPage
      h1={
        <>
          A Stained Glass Style Portrait
          <br className="hidden md:block" /> of Anything You Love
        </>
      }
      subhead="We turn your favorite photo into a handmade suncatcher — pets, weddings, memorials, and more. Designed and made by my wife and I in Chico, California."
      heroImage="/images/vet/bulldog-window.jpg"
      heroAlt="Stained glass style portrait suncatcher glowing in a customer's window"
      tiles={TILES}
      steps={howItWorks(
        'Any clear photo works — your pet, your wedding day, or the person or place you love. We handle all the design work from there.',
      )}
      reviews={REVIEWS}
      faq={HUB_FAQ}
      jsonLd={jsonLd}
    />
  );
}
