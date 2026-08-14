// Shared content for the general (direct-to-consumer) stained glass pet
// portrait page at stainedglassportraits.com. The vet per-clinic pages keep
// their own copy under /portrait/[clinic] so this data can evolve for SEO
// without touching the referral flow.

export const SIZES = [
  { key: '3"',  price: 135, description: 'Ornament size — hangs in a window or on a tree' },
  { key: '6"',  price: 172, description: 'Small suncatcher — perfect for a desk or bedside window' },
  { key: '10"', price: 198, description: 'Our most popular size — fills a window beautifully' },
  { key: '12"', price: 229, description: 'Large statement piece' },
  { key: '15"', price: 253, description: 'Gallery size — maximum impact' },
] as const;

export type SizeKey = (typeof SIZES)[number]['key'];

export const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Order your portrait',
    body: 'Choose the size you want and complete your purchase. We follow up by email to collect your photo.',
  },
  {
    step: '2',
    title: 'Send us your favorite photo',
    body: 'Any clear photo of your pet works — we handle all the design work from there.',
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

export const REVIEWS = [
  {
    quote: 'We had a custom made sun catcher of our beloved dog who recently passed. It came out so beautiful and looked just like the picture I sent in. This is something we will cherish!',
    author: 'Alicia',
    meta: '12″ portrait · verified Etsy purchase',
    photo: '/images/vet/bulldog-window.jpg',
  },
  {
    quote: 'The owner worked with me to create a custom design to replicate the picture I sent, was responsive, and shipped on time. The item itself looks and feels high quality.',
    author: 'Rommelyn',
    meta: 'Custom order · verified Etsy purchase',
    photo: '/images/vet/balloon-window.jpg',
  },
  {
    quote: 'Was blown away by the details and incredible work. Such great quality and such a pleasure to work with. Definitely recommend!',
    author: 'Etsy buyer',
    meta: 'Custom order · verified Etsy purchase',
    photo: '/images/vet/tree-213.jpg',
  },
];

export const FAQ = [
  {
    q: 'How does a custom pet portrait suncatcher work?',
    a: 'You choose a size and order. After checkout we email you to collect your favorite photo of your pet. We design a stained glass style portrait from that photo, send you a digital proof to approve, and then print it on real glass and ship it to you.',
  },
  {
    q: 'What photo works best?',
    a: 'Any clear, well-lit photo where your pet\u2019s face is easy to see. A straight-on or slight-angle shot works best. You do not need a professional photo — we handle all of the design work.',
  },
  {
    q: 'Is this real stained glass?',
    a: 'It is a stained glass style portrait. Your pet\u2019s photo is reimagined as a stained-glass-style design and printed on real glass, then sealed and hand-finished. It catches the light like traditional stained glass without the fragility or cost of leaded glass.',
  },
  {
    q: 'Can you make a memorial piece for a pet who has passed?',
    a: 'Yes. Many of our portraits are memorial pieces. Send us your favorite photo and we will design something you can keep in the light for years to come.',
  },
  {
    q: 'What sizes and prices are available?',
    a: 'Five sizes, from 3 inches to 15 inches, ranging from $135 to $253. The 10 inch is our most popular size and fills a window beautifully.',
  },
  {
    q: 'How long does it take?',
    a: 'We ship within one to two weeks after you approve your proof. The overall timing depends a little on how quickly you send your photo and approve the design.',
  },
  {
    q: 'What pets can you do?',
    a: 'Any pet. Dogs, cats, horses, birds — if you have a clear photo of them, we can make a stained glass style portrait.',
  },
  {
    q: 'Where are they made?',
    a: 'Designed and made by my wife and I in Chico, California. Each piece is printed on real glass and hand-finished — not mass produced.',
  },
];
