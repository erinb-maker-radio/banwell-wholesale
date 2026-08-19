import type { Metadata } from 'next';
import PortraitPage, { buildJsonLd } from '../PortraitPage';
import { howItWorks, REVIEW_EMILY, REVIEW_ALICIA, PEOPLE_MEMORIAL_FAQ } from '../data';

// MEMORIALS (people) — stainedglassportraits.com/memorials
// Memorial portraits of a person you loved. Emily's family piece — a portrait
// of her late mother holding the family dog — anchors this page, shared with
// Emily's explicit consent (website, social, Etsy). Do not swap her photo.

export const metadata: Metadata = {
  title: 'Memorial Portrait Suncatcher — Stained Glass Style From Your Photo | Banwell Designs',
  description:
    'A handmade memorial suncatcher of someone you love, made from your favorite photo — a stained glass style portrait you can keep in the light. Designed and made by my wife and I in Chico, California.',
  keywords: [
    'memorial portrait suncatcher',
    'memorial stained glass portrait',
    'in memory gift from photo',
    'sympathy gift stained glass',
    'memorial gift for loss of loved one',
    'custom photo memorial suncatcher',
  ],
  alternates: { canonical: 'https://stainedglassportraits.com/memorials' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/memorials',
    title: 'Memorial Portrait Suncatcher — Stained Glass Style From Your Photo',
    description:
      'A handmade memorial suncatcher of someone you love, made from your favorite photo — a stained glass style portrait you can keep in the light.',
    siteName: 'Banwell Designs',
    images: [
      {
        url: '/images/vet/memorial-mom-window.jpg',
        width: 1600,
        height: 1600,
        alt: 'Stained glass style memorial portrait of a woman holding her dog, glowing in a window',
      },
    ],
  },
};

const jsonLd = buildJsonLd({
  productName: 'Custom Memorial Suncatcher — Stained Glass Style Portrait',
  productDescription:
    'A handmade stained glass style memorial portrait of someone you love, made from your favorite photo and printed on real glass. Designed and made in Chico, California.',
  image: '/images/vet/memorial-mom-window.jpg',
  url: 'https://stainedglassportraits.com/memorials',
  reviews: [REVIEW_EMILY, REVIEW_ALICIA],
  faq: PEOPLE_MEMORIAL_FAQ,
});

const EMILY_CASE_STUDY = {
  eyebrow: 'A true story \u00b7 shared with the family\u2019s blessing',
  title: (
    <>
      Her mom&rsquo;s smiling face,
      <br className="hidden md:block" /> at the kitchen window every morning
    </>
  ),
  intro:
    'Emily wanted to give her dad something special \u2014 her mom had passed away ten years before, and she missed her every day. She sent us one favorite photo of her mother holding Buster, the family dog, and we reimagined it as a stained glass style portrait printed on real glass. It now hangs in her dad\u2019s kitchen window, where he sees her smiling face every morning.',
  beforeImage: '/images/vet/memorial-mom-original.jpg',
  beforeAlt: 'The original family photo Emily sent \u2014 her mother holding Buster the dog on a walk',
  afterImage: '/images/vet/memorial-mom-window.jpg',
  afterAlt:
    'The finished stained glass style memorial portrait of Emily\u2019s mother holding Buster, glowing in a window',
  makerImage: '/images/vet/memorial-mom-dad.jpg',
  makerAlt:
    'Emily\u2019s father holding the finished stained glass style memorial portrait of her mother',
  quote:
    'I love being able to get up each morning and see Mom\u2019s smiling face at the kitchen window, holding Buster\u2026 do you think she might be doing that now? It is his stunning creation \u2014 it is perfect.',
  attribution: 'Emily\u2019s father \u00b7 memorial portrait of her mother',
};

export default function MemorialsPage() {
  return (
    <PortraitPage
      h1={
        <>
          A Stained Glass Style Memorial
          <br className="hidden md:block" /> of Someone You Love
        </>
      }
      subhead="We turn your favorite photo into a handmade suncatcher you can keep in the light — designed and made by my wife and I in Chico, California."
      heroImage="/images/vet/memorial-mom-window.jpg"
      heroAlt="Stained glass style memorial portrait of a woman holding her dog, glowing in a window"
      caseStudy={EMILY_CASE_STUDY}
      steps={howItWorks(
        'Any clear photo works — an old favorite is perfectly fine. We handle all the design work, and you approve the artwork before anything is made.',
      )}
      reviews={[REVIEW_EMILY, REVIEW_ALICIA]}
      faq={PEOPLE_MEMORIAL_FAQ}
      jsonLd={jsonLd}
      hubLink
    />
  );
}
