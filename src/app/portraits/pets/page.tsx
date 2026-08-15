import type { Metadata } from 'next';
import PortraitPage, { buildJsonLd } from '../PortraitPage';
import { HOW_IT_WORKS, REVIEWS, FAQ } from '../data';

// PETS — stainedglassportraits.com/pets
// The original pet portrait page (locked headline), moved from the domain
// root when the hub launched. Served via host rewrite in middleware.

export const metadata: Metadata = {
  title: 'Stained Glass Pet Portraits — Custom Suncatcher From Your Photo | Banwell Designs',
  description:
    'Turn your favorite photo of your pet into a handmade stained glass style suncatcher portrait. Dogs, cats, and memorial pieces. Designed and made by my wife and I in Chico, California.',
  keywords: [
    'stained glass pet portrait',
    'custom pet suncatcher',
    'pet portrait from photo',
    'stained glass style dog portrait',
    'custom dog suncatcher',
    'custom cat suncatcher',
  ],
  alternates: { canonical: 'https://stainedglassportraits.com/pets' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/pets',
    title: 'Stained Glass Pet Portraits — Custom Suncatcher From Your Photo',
    description:
      'Turn your favorite photo of your pet into a handmade stained glass style suncatcher portrait. Dogs, cats, and memorial pieces.',
    siteName: 'Banwell Designs',
    images: [
      {
        url: '/images/vet/bulldog-window.jpg',
        width: 1600,
        height: 1365,
        alt: 'Stained glass style dog portrait suncatcher glowing in a window',
      },
    ],
  },
};

const jsonLd = buildJsonLd({
  productName: 'Custom Stained Glass Style Pet Portrait Suncatcher',
  productDescription:
    'A handmade stained glass style portrait of your pet, made from your favorite photo and printed on real glass. Designed and made in Chico, California.',
  image: '/images/vet/bulldog-window.jpg',
  url: 'https://stainedglassportraits.com/pets',
  reviews: REVIEWS,
  faq: FAQ,
});

export default function PetsPage() {
  return (
    <PortraitPage
      h1={
        <>
          A Stained Glass Style Portrait
          <br className="hidden md:block" /> of Your Pet
        </>
      }
      subhead="We turn your favorite photo into a handmade suncatcher — designed and made by my wife and I in Chico, California."
      heroImage="/images/vet/bulldog-window.jpg"
      heroAlt="Stained glass style dog portrait suncatcher glowing in a customer's window"
      steps={HOW_IT_WORKS}
      reviews={REVIEWS}
      faq={FAQ}
      jsonLd={jsonLd}
      hubLink
    />
  );
}
