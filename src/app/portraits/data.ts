// Shared content for the direct-to-consumer stained glass style portrait
// pages at stainedglassportraits.com. Site structure (see middleware.ts for
// the host rewrites):
//
//   /            hub    — all portrait categories
//   /pets        pets   — the original pet portrait page (locked headline)
//   /pet-memorial       — memorial pieces
//   /weddings           — wedding / engagement / anniversary gifts
//
// The vet per-clinic pages keep their own copy under /portrait/[clinic] so
// this data can evolve for SEO without touching the referral flow.

export const SIZES = [
  { key: '3"',  price: 135, description: 'Ornament size — hangs in a window or on a tree' },
  { key: '6"',  price: 172, description: 'Small suncatcher — perfect for a desk or bedside window' },
  { key: '10"', price: 198, description: 'Our most popular size — fills a window beautifully' },
  { key: '12"', price: 229, description: 'Large statement piece' },
  { key: '15"', price: 253, description: 'Gallery size — maximum impact' },
] as const;

export type SizeKey = (typeof SIZES)[number]['key'];

// The four steps are identical for every category — only the "what photo"
// line changes. Keep it a factory so each page reads naturally.
export function howItWorks(photoLine: string) {
  return [
    {
      step: '1',
      title: 'Order your portrait',
      body: 'Choose the size you want and complete your purchase. We follow up by email to collect your photo.',
    },
    {
      step: '2',
      title: 'Send us your favorite photo',
      body: photoLine,
    },
    {
      step: '3',
      title: 'Approve your artwork',
      body: 'We send you a digital proof before anything is made. You approve it, we print it.',
    },
    {
      step: '4',
      title: 'We make it and ship it',
      body: 'Printed on real glass and sealed. Ships within 1–2 weeks of artwork approval.',
    },
  ];
}

export const HOW_IT_WORKS = howItWorks(
  'Any clear photo of your pet works — we handle all the design work from there.',
);

// ── Verified Etsy reviews. Photo attributions confirmed from the original
// review screenshots — do not swap photos between reviewers.
export const REVIEW_ALICIA = {
  quote: 'We had a custom made sun catcher of our beloved dog who recently passed. It came out so beautiful and looked just like the picture I sent in. This is something we will cherish!',
  author: 'Alicia',
  meta: '12″ memorial portrait · verified Etsy purchase',
  photo: '/images/vet/bulldog-window.jpg',
};

export const REVIEW_ROMMELYN = {
  quote: 'The owner worked with me to create a custom design to replicate the picture I sent, was responsive, and shipped on time. The item itself looks and feels high quality.',
  author: 'Rommelyn',
  meta: 'Engagement gift · verified Etsy purchase',
  photo: '/images/vet/balloon-window.jpg',
};

export const REVIEW_TREE = {
  quote: 'Was blown away by the details and incredible work. Such great quality and such a pleasure to work with. Definitely recommend!',
  author: 'Etsy buyer',
  meta: 'Custom order · verified Etsy purchase',
  photo: '/images/vet/tree-213.jpg',
};

// Emily's family — memorial portrait of her late mother, made from a photo of
// her mom holding the family dog, Buster. Shared with Emily's explicit consent
// (website, social, Etsy). The quote is her father's, relayed by Emily.
export const REVIEW_EMILY = {
  quote: 'I love being able to get up each morning and see Mom\u2019s smiling face at the kitchen window, holding Buster. It is his stunning creation \u2014 it is perfect.',
  author: 'Emily\u2019s father',
  meta: 'Memorial portrait of her mother \u00b7 verified Etsy purchase',
  photo: '/images/vet/memorial-mom-window.jpg',
};

export const REVIEWS = [REVIEW_ALICIA, REVIEW_ROMMELYN, REVIEW_TREE];

// ── Shared FAQ answers reused across pages
const FAQ_REAL_GLASS = {
  q: 'Is this real stained glass?',
  a: 'It is a stained glass style portrait. Your photo is reimagined as a stained-glass-style design and printed on real glass, then sealed and hand-finished. It catches the light like traditional stained glass without the fragility or cost of leaded glass.',
};

const FAQ_SIZES = {
  q: 'What sizes and prices are available?',
  a: 'Five sizes, from 3 inches to 15 inches, ranging from $135 to $253. The 10 inch is our most popular size and fills a window beautifully.',
};

const FAQ_TIMING = {
  q: 'How long does it take?',
  a: 'We ship within one to two weeks after you approve your proof. The overall timing depends a little on how quickly you send your photo and approve the design.',
};

const FAQ_MADE = {
  q: 'Where are they made?',
  a: 'Designed and made by my wife and I in Chico, California. Each piece is printed on real glass and hand-finished — not mass produced.',
};

// ── Hub (all categories)
export const HUB_FAQ = [
  {
    q: 'How does a custom photo suncatcher work?',
    a: 'You choose a size and order. After checkout we email you to collect your favorite photo. We design a stained glass style portrait from that photo, send you a digital proof to approve, and then print it on real glass and ship it to you.',
  },
  {
    q: 'What can you make a portrait of?',
    a: 'Almost anything you love. Pets, wedding and engagement photos, memorial pieces, family moments — if you have a clear photo of it, we can design a stained glass style portrait from it.',
  },
  FAQ_REAL_GLASS,
  {
    q: 'What photo works best?',
    a: 'Any clear, well-lit photo where the subject is easy to see. You do not need a professional photo — we handle all of the design work.',
  },
  FAQ_SIZES,
  FAQ_TIMING,
  FAQ_MADE,
];

// ── Pets (original page content, unchanged)
export const FAQ = [
  {
    q: 'How does a custom pet portrait suncatcher work?',
    a: 'You choose a size and order. After checkout we email you to collect your favorite photo of your pet. We design a stained glass style portrait from that photo, send you a digital proof to approve, and then print it on real glass and ship it to you.',
  },
  {
    q: 'What photo works best?',
    a: 'Any clear, well-lit photo where your pet\u2019s face is easy to see. A straight-on or slight-angle shot works best. You do not need a professional photo — we handle all of the design work.',
  },
  FAQ_REAL_GLASS,
  {
    q: 'Can you make a memorial piece for a pet who has passed?',
    a: 'Yes. Many of our portraits are memorial pieces. Send us your favorite photo and we will design something you can keep in the light for years to come.',
  },
  FAQ_SIZES,
  FAQ_TIMING,
  {
    q: 'What pets can you do?',
    a: 'Any pet. Dogs, cats, horses, birds — if you have a clear photo of them, we can make a stained glass style portrait.',
  },
  FAQ_MADE,
];

// ── Pet memorial
export const MEMORIAL_FAQ = [
  {
    q: 'How does a pet memorial suncatcher work?',
    a: 'You choose a size and order. After checkout we email you to collect your favorite photo of your pet. We design a stained glass style portrait from that photo, send you a digital proof to approve before anything is made, and then print it on real glass and ship it to you.',
  },
  {
    q: 'I only have older or low-quality photos. Can you still make one?',
    a: 'Usually, yes. We work from the photos you have. Send us your best one and we will tell you honestly whether it will make a good portrait before you commit to anything — you approve the artwork before we make it.',
  },
  {
    q: 'Is this a good sympathy gift for someone who lost a pet?',
    a: 'Yes. A memorial suncatcher is a gift they can keep in the light for years — many of our customers order one for a friend or family member after a loss. We can email the artwork proof to you and ship the finished piece to them.',
  },
  FAQ_REAL_GLASS,
  {
    q: 'Do you make memorial pieces for people as well?',
    a: 'Yes. If you have a clear photo of someone you love, we can design a stained glass style memorial portrait from it. Everything works the same way — order, send the photo, approve the proof.',
  },
  FAQ_SIZES,
  FAQ_TIMING,
  FAQ_MADE,
];

// ── Weddings / engagements / anniversaries
export const WEDDING_FAQ = [
  {
    q: 'Can you turn our wedding photo into a stained glass style portrait?',
    a: 'Yes. Send us your favorite photo from the day — the first dance, the kiss, the venue — and we design a stained glass style portrait from it, printed on real glass. You approve a digital proof before anything is made.',
  },
  {
    q: 'Is this a good engagement or anniversary gift?',
    a: 'Yes — engagement and anniversary pieces are some of our favorite commissions. One of our verified reviews is an engagement gift made from the photo of the proposal. A photo from your own story, hanging in the light, is hard to beat.',
  },
  {
    q: 'What photo works best?',
    a: 'Any clear, well-lit photo. Professional wedding photos work beautifully, but a good phone photo works too — we handle all of the design work.',
  },
  FAQ_REAL_GLASS,
  {
    q: 'Can you ship it as a gift?',
    a: 'Yes. We can email the artwork proof to you and ship the finished piece directly to the couple.',
  },
  FAQ_SIZES,
  FAQ_TIMING,
  FAQ_MADE,
];

// ── Memorials (people) — a stained glass style portrait of someone you loved
export const PEOPLE_MEMORIAL_FAQ = [
  {
    q: 'How does a memorial portrait work?',
    a: 'You choose a size and order. After checkout we email you to collect your favorite photo of the person you love. We design a stained glass style portrait from that photo, send you a digital proof to approve before anything is made, and then print it on real glass and ship it to you.',
  },
  {
    q: 'I only have an older or low-quality photo. Can you still make one?',
    a: 'Usually, yes. We work from the photos you have. Send us your best one and we will tell you honestly whether it will make a good portrait before you commit to anything — you approve the artwork before we make it.',
  },
  {
    q: 'Is this a good sympathy gift for someone grieving?',
    a: 'Yes. A memorial suncatcher is a gift they can keep in the light for years. We can email the artwork proof to you and ship the finished piece directly to them.',
  },
  {
    q: 'Can the portrait include more than one person, or a pet?',
    a: 'Yes. Many of our memorial pieces show someone with a beloved pet or another family member. If it is clear in the photo, we can design it into the portrait.',
  },
  FAQ_REAL_GLASS,
  FAQ_SIZES,
  FAQ_TIMING,
  FAQ_MADE,
];
