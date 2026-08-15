import type { Metadata } from 'next';
import PortraitPage, { buildJsonLd } from '../PortraitPage';
import { howItWorks, REVIEW_ALICIA, REVIEW_TREE, MEMORIAL_FAQ } from '../data';

// PET MEMORIAL — stainedglassportraits.com/pet-memorial
// Memorial and sympathy pieces. Alicia's verified memorial review anchors
// this page — her photo attribution is confirmed, do not swap it.

export const metadata: Metadata = {
  title: 'Pet Memorial Suncatcher — Stained Glass Style Portrait From Your Photo | Banwell Designs',
  description:
    'A handmade pet memorial suncatcher made from your favorite photo — a stained glass style portrait you can keep in the light. Designed and made by my wife and I in Chico, California.',
  keywords: [
    'pet memorial suncatcher',
    'pet memorial stained glass',
    'dog memorial gift',
    'cat memorial gift',
    'pet loss sympathy gift',
    'pet memorial portrait from photo',
  ],
  alternates: { canonical: 'https://stainedglassportraits.com/pet-memorial' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/pet-memorial',
    title: 'Pet Memorial Suncatcher — Stained Glass Style Portrait From Your Photo',
    description:
      'A handmade pet memorial suncatcher made from your favorite photo — a stained glass style portrait you can keep in the light.',
    siteName: 'Banwell Designs',
    images: [
      {
        url: '/images/vet/bulldog-window.jpg',
        width: 1600,
        height: 1365,
        alt: 'Stained glass style memorial dog portrait glowing in a window',
      },
    ],
  },
};

const jsonLd = buildJsonLd({
  productName: 'Custom Pet Memorial Suncatcher — Stained Glass Style Portrait',
  productDescription:
    'A handmade stained glass style memorial portrait of your pet, made from your favorite photo and printed on real glass. Designed and made in Chico, California.',
  image: '/images/vet/bulldog-window.jpg',
  url: 'https://stainedglassportraits.com/pet-memorial',
  reviews: [REVIEW_ALICIA, REVIEW_TREE],
  faq: MEMORIAL_FAQ,
});

export default function PetMemorialPage() {
  return (
    <PortraitPage
      h1={
        <>
          A Stained Glass Style Memorial
          <br className="hidden md:block" /> of Your Pet
        </>
      }
      subhead="We turn your favorite photo into a handmade suncatcher you can keep in the light — designed and made by my wife and I in Chico, California."
      heroImage="/images/vet/bulldog-window.jpg"
      heroAlt="Stained glass style memorial dog portrait suncatcher glowing in a customer's window"
      steps={howItWorks(
        'Any clear photo of your pet works — an old favorite is fine. We handle all the design work, and you approve the artwork before anything is made.',
      )}
      reviews={[REVIEW_ALICIA, REVIEW_TREE]}
      faq={MEMORIAL_FAQ}
      jsonLd={jsonLd}
      hubLink
    />
  );
}
