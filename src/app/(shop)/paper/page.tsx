import Link from 'next/link';
import Image from 'next/image';
import paperData from '@/data/paper-products.json';

export const metadata = {
  title: 'Paper Art - Banwell Designs',
  description: paperData.subtitle,
};

export default function PaperHomePage() {
  return (
    <div>
      {/* Section 1: Banner / Title */}
      <section className="pt-6 pb-4">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center">
          <h1 className="text-[28px] md:text-[42px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-4">
            {paperData.title}
          </h1>
          <p className="text-[16px] md:text-[20px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] max-w-3xl mx-auto leading-relaxed">
            {paperData.subtitle}
          </p>
        </div>
      </section>

      {/* Section 2: Three Item Circles */}
      <section className="py-12">
        <div className="max-w-[1140px] mx-auto px-[8%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            {paperData.items.map((item) => (
              <Link key={item.slug} href={`/paper/${item.slug}`} className="group text-center">
                <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-full overflow-hidden border-4 border-white/60 shadow-lg bg-gray-100 group-hover:border-white group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] text-[22px] font-semibold capitalize">{item.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Featured Work */}
      <section className="py-12">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center mb-8">
          <h2 className="text-[36px] md:text-[65px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-4">
            {paperData.featuredWork.heading}
          </h2>
          <p className="text-[16px] md:text-[22px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] max-w-3xl mx-auto leading-relaxed">
            {paperData.featuredWork.description}
          </p>
        </div>
        <div className="max-w-[1140px] mx-auto px-[8%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
            {paperData.featuredWork.items.map((item: { type: string; src: string }, i: number) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg border-4 border-white/60">
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={`Featured paper art ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Recent Projects */}
      <section className="py-12">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center mb-6">
          <h2 className="text-[36px] md:text-[65px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-4">
            Recent Projects
          </h2>
          <p className="text-[16px] md:text-[22px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)]">
            Our latest paper art creations.
          </p>
        </div>
        <div className="max-w-[1140px] mx-auto px-[8%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
            {paperData.recentProjects.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-white/60">
                <Image
                  src={img}
                  alt={`Recent paper project ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Wholesale CTA */}
      <section className="py-16">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center">
          <h2 className="text-[36px] md:text-[65px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-4">
            Wholesale
          </h2>
          <p className="text-[16px] md:text-[22px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] max-w-3xl mx-auto mb-8 leading-relaxed">
            Paper art pieces available for wholesale. Contact us for pricing and availability.
          </p>
          <Link
            href="/catalog?line=paper"
            className="inline-block px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Wholesale Catalog
          </Link>
        </div>
      </section>

      {/* Floating Etsy Button */}
      <a
        href={paperData.etsyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-[14px] font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        Shop Paper Art on Etsy
      </a>
    </div>
  );
}
