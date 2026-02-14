import Link from 'next/link';
import Image from 'next/image';
import clientLogos from '@/data/client-logos.json';

export default function LeatherHomePage() {
  const categories = [
    { name: 'Plague Doctor', image: '/images/brand/general/Maximus-1.jpg', href: '/leather/plague-doctor' },
    { name: 'Fashion Masks', image: '/images/brand/general/snowflake-smaller.jpg', href: '/leather/fashion-masks' },
    { name: 'Steampunk', image: '/images/brand/general/Sentinel.jpg', href: '/leather/steampunk' },
  ];

  // Out in the Wild grid - 4 columns, matching original layout
  const wildRows = [
    [
      { name: 'Vice', image: '/images/brand/general/vice-1.png' },
      { name: 'Monterey Bay Aquarium', image: '/images/brand/general/Monterey-Bay-Aquarium-1.png' },
      { name: 'History of Science Museum', image: '/images/brand/gallery/History-of-Science-Museum-1.png' },
      { name: 'Make Magazine', image: '/images/brand/general/Make-transparent.png' },
    ],
    [
      { name: '30 Seconds to Mars', image: '/images/brand/general/30-Second-to-Mars.png' },
      { name: 'Forbes', image: '/images/brand/general/Forbes-1.png' },
      { name: 'Rolling Stone', image: '/images/brand/general/rollling-stone.jpg' },
      { name: 'Nissan', image: '/images/brand/general/Nissan-1.png' },
    ],
    [
      { name: 'LA Opera', image: '/images/brand/general/LA-Opera-1.png' },
      { name: 'Chevelle', image: '/images/brand/general/Chevelle-1.png' },
      { name: 'Muzeo', image: '/images/brand/gallery/Muzeo-1.png' },
      { name: 'Black Plague Brewing', image: '/images/brand/plague-doctor/Black-Plague-Brewing.jpg' },
    ],
    [
      { name: 'Trapholt', image: '/images/brand/gallery/Trapholt-1.png' },
      { name: 'Revolution Brewing', image: '/images/brand/general/revolution-brewing.png' },
      { name: 'Tony Hawk', image: '/images/brand/general/tony-hawk-headshot-1.png' },
      { name: 'Paris Hilton', image: '/images/brand/general/Paris.png' },
    ],
    [
      { name: 'Jared Leto', image: '/images/brand/general/Jared-Leto.png' },
      { name: 'Giancarlo Esposito', image: '/images/brand/general/Giancarlo-Esposito.png' },
      { name: 'Renata Gonzalez', image: '/images/brand/general/Renata-Gonzalez.png' },
      { name: 'Miss Mosh', image: '/images/brand/general/Miss-Mosh.png' },
    ],
    [
      { name: 'Skrillex', image: '/images/brand/general/skrillex-2.png' },
      { name: 'Vogue', image: '/images/brand/general/vogue-black-on-white-circle-black-writing.png' },
    ],
  ];

  return (
    <div className="bg-black">
      {/* Section 1: "Fantastic Handmade Goods" Banner */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="flex justify-center">
          <Image
            src="/images/brand/general/fantastic-handmade-goods-6-prarrfzowc3em0yhfo9dajc7tjag6y7i7e8a0trgmu.png"
            alt="Fantastic Handmade Goods"
            width={600}
            height={200}
            className="w-auto max-w-full"
            priority
          />
        </div>
      </section>

      {/* Section 2: Three Category Cards - circular images with red borders */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group text-center">
              <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-full overflow-hidden border-[5px] border-[#C30000] shadow-[10px_10px_2px_0px_rgba(0,0,0,0.5)]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="mt-4 text-white text-[22px] font-semibold capitalize">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 4: "Out In The Wild" Header */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-8 pb-4 text-center">
        <h2 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          Out In The Wild...
        </h2>
        <p className="text-[16px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          A showcase of features, partners, clients, celebrity name-drops, and places our work has been found... Out In The Wild!
        </p>
      </section>

      {/* Section 5: Out In The Wild - 4-column logo grid */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        {wildRows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {row.map((item) => (
              <Link
                key={item.name}
                href="/leather/gallery"
                className="group relative aspect-square rounded-[8px] overflow-hidden bg-black border border-black"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            ))}
          </div>
        ))}
      </section>

      {/* Section 6: Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 7: Recent Projects Gallery */}
      <section className="w-full py-8">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center mb-6">
          <h2 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
            Recent Projects
          </h2>
          <p className="text-[16px] md:text-[22px] font-light text-white">
            Recent creations, projects, musings and sketches.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            '/images/brand/general/golden-eye-exterobot.jpg',
            '/images/brand/general/new-top-hats.jpg',
            '/images/brand/general/probiscus-exterobot.jpg',
          ].map((img, i) => (
            <div key={i} className="relative aspect-square">
              <Image
                src={img}
                alt={`Recent project ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Section 8: Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 9: Wholesale CTA (new addition, matching site style) */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <h2 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          Wholesale
        </h2>
        <p className="text-[16px] md:text-[22px] font-light text-white max-w-3xl mx-auto mb-8 leading-relaxed">
          Stained glass ornaments, sun catchers, and more. Wholesale pricing for retailers with discounts up to 55%.
        </p>
        <Link
          href="/catalog"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Browse Wholesale Catalog
        </Link>
      </section>

      {/* Floating Etsy Button */}
      <a
        href="https://www.etsy.com/shop/BanwellDesigns"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#9E0000] to-[#FCC1C1] text-white text-[14px] font-normal rounded-[7px] shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        Shop Banwell Designs on Etsy
      </a>
    </div>
  );
}
