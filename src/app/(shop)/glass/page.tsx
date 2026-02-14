import Link from 'next/link';
import Image from 'next/image';
import glassData from '@/data/glass-products.json';

export const metadata = {
  title: 'Glass Suncatchers - Banwell Designs',
  description: glassData.subtitle,
};

export default function GlassHomePage() {
  return (
    <div>
      {/* Section 1: Banner / Title */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-12 text-center">
        <h1 className="text-[36px] md:text-[65px] font-semibold text-gray-900 leading-tight mb-4">
          Glass Suncatchers
        </h1>
        <p className="text-[14px] md:text-[22px] font-light text-gray-500 max-w-3xl mx-auto leading-relaxed">
          {glassData.subtitle}
        </p>
      </section>

      {/* Section 2: Recent Projects (moved to top) */}
      <section className="w-full py-8">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center mb-6">
          <h2 className="text-[36px] md:text-[65px] font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
          <p className="text-[16px] md:text-[22px] font-light text-gray-500">
            Our latest stained glass creations.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          {glassData.recentProjects.map((item: { type: string; src: string; alt?: string }, i: number) => (
            <div key={i} className="relative aspect-square overflow-hidden">
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
                  alt={item.alt || `Recent glass project ${i + 1}`}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t border-gray-200 w-[82%] mx-auto" />
      </div>

      {/* Section 3: Three Category Circles */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {glassData.categories.map((cat) => (
            <Link key={cat.slug} href={`/glass/${cat.slug}`} className="group text-center">
              <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-full overflow-hidden border-4 border-blue-200 shadow-lg bg-gray-100 group-hover:border-blue-400 group-hover:shadow-xl transition-all duration-300">
                {cat.video ? (
                  <video
                    src={cat.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <p className="mt-4 text-gray-900 text-[22px] font-semibold capitalize">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t border-gray-200 w-[82%] mx-auto" />
      </div>

      {/* Section 4: Featured Work */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-8 pb-4 text-center">
        <h2 className="text-[36px] md:text-[65px] font-semibold text-gray-900 mb-4">
          {glassData.featuredWork.heading}
        </h2>
        <p className="text-[16px] md:text-[22px] font-light text-gray-500 max-w-3xl mx-auto leading-relaxed">
          {glassData.featuredWork.description}
        </p>
      </section>

      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          {glassData.featuredWork.images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              <Image
                src={img}
                alt={`Featured glass work ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t border-gray-200 w-[82%] mx-auto" />
      </div>

      {/* Section 5: Wholesale CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <h2 className="text-[36px] md:text-[65px] font-semibold text-gray-900 mb-4">
          Wholesale
        </h2>
        <p className="text-[16px] md:text-[22px] font-light text-gray-500 max-w-3xl mx-auto mb-8 leading-relaxed">
          Stained glass ornaments, sun catchers, and more. Wholesale pricing for retailers with discounts up to 55%.
        </p>
        <Link
          href="/catalog?line=glass"
          className="inline-block px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Wholesale Catalog
        </Link>
      </section>

      {/* Floating Etsy Button */}
      <a
        href={glassData.etsyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-[14px] font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        Shop Glass on Etsy
      </a>
    </div>
  );
}
