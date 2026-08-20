import type { Metadata } from 'next';
import PortraitPage, { buildJsonLd } from '../PortraitPage';
import { howItWorks, REVIEW_ROMMELYN, REVIEW_TREE, WEDDING_FAQ } from '../data';

// WEDDINGS — stainedglassportraits.com/weddings
// Wedding, engagement, and anniversary gifts. Rommelyn's verified review IS
// an engagement gift (balloon piece) — attribution confirmed, do not swap.

export const metadata: Metadata = {
  title: 'Stained Glass Wedding Gift — Custom Suncatcher From Your Photo | Banwell Designs',
  description:
    'Turn a wedding, engagement, or anniversary photo into a handmade stained glass style suncatcher — a keepsake made from your own story. Designed and made by my wife and I in Chico, California.',
  keywords: [
    'stained glass wedding gift',
    'anniversary suncatcher',
    'engagement gift from photo',
    'custom wedding photo gift',
    'stained glass style wedding portrait',
  ],
  alternates: { canonical: 'https://stainedglassportraits.com/weddings' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/weddings',
    title: 'Stained Glass Wedding Gift — Custom Suncatcher From Your Photo',
    description:
      'Turn a wedding, engagement, or anniversary photo into a handmade stained glass style suncatcher — a keepsake made from your own story.',
    siteName: 'Banwell Designs',
    images: [
      {
        url: '/images/vet/wedding-proposal.jpg',
        width: 1502,
        height: 2000,
        alt: 'Engagement proposal reimagined as a round stained glass style suncatcher hanging in a window',
      },
    ],
  },
};

const jsonLd = buildJsonLd({
  productName: 'Custom Wedding & Anniversary Suncatcher — Stained Glass Style Portrait',
  productDescription:
    'A handmade stained glass style portrait made from your wedding, engagement, or anniversary photo and printed on real glass. Designed and made in Chico, California.',
  image: '/images/vet/wedding-proposal.jpg',
  url: 'https://stainedglassportraits.com/weddings',
  reviews: [REVIEW_ROMMELYN, REVIEW_TREE],
  faq: WEDDING_FAQ,
});

export default function WeddingsPage() {
  return (
    <PortraitPage
      h1={
        <>
          A Stained Glass Style Portrait
          <br className="hidden md:block" /> of Your Favorite Day
        </>
      }
      subhead="Your wedding, engagement, or anniversary photo, reimagined as a handmade suncatcher — designed and made by my wife and I in Chico, California."
      heroImage="/images/vet/wedding-proposal.jpg"
      heroAlt="Engagement proposal reimagined as a round stained glass style suncatcher hanging in a window"
      secondaryImage="/images/vet/wedding-couple.jpg"
      secondaryAlt="Wedding couple photo reimagined as a round stained glass style suncatcher"
      secondaryCaption="A wedding portrait, kept in the light"
      steps={howItWorks(
        'Any clear photo from your story works — the proposal, the first dance, the venue. We handle all the design work from there.',
      )}
      reviews={[REVIEW_ROMMELYN, REVIEW_TREE]}
      faq={WEDDING_FAQ}
      jsonLd={jsonLd}
      hubLink
    />
  );
}
