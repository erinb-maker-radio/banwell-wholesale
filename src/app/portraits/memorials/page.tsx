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
