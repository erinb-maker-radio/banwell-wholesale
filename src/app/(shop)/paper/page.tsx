import Link from 'next/link';
import Image from 'next/image';
import paperData from '@/data/paper-products.json';

export const metadata = {
  title: 'Paper Art - Banwell Designs',
  description: paperData.subtitle,
};

type PaperItem = {
  name: string;
  slug: string;
  category: string;
  price: string;
  image: string;
  etsyUrl: string;
  description: string;
};

function ProductCard({ item }: { item: PaperItem }) {
  return (
    <div className="flex flex-col bg-white/95 rounded-xl overflow-hidden shadow-lg border-4 border-white/60">
      <a href={item.etsyUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square block bg-gray-100">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 300px" />
      </a>
      <div className="flex flex-col flex-1 p-4 text-center">
        <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 leading-tight">{item.name}</h3>
        <p className="text-[13px] md:text-[14px] text-gray-600 mt-1 mb-2 leading-snug flex-1">{item.description}</p>
        <p className="text-[18px] font-semibold text-gray-900 mb-3">${item.price}</p>
        <a
          href={item.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full px-4 py-2.5 text-[14px] font-medium text-white bg-[#F56400] rounded-lg hover:bg-[#d95800] transition-colors"
        >
          Shop on Etsy
        </a>
      </div>
    </div>
  );
}

export default function PaperHomePage() {
  const ornaments = (paperData.items as PaperItem[]).filter((i) => i.category === 'ornament');
  const shadowboxes = (paperData.items as PaperItem[]).filter((i) => i.category === 'shadowbox');

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

      {/* Section 2: Ornaments */}
      <section className="py-10">
        <div className="max-w-[1140px] mx-auto px-[8%]">
          <div className="text-center mb-8">
            <h2 className="text-[30px] md:text-[48px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-2">
              Paper Cut Ornaments
            </h2>
            <p className="text-[15px] md:text-[20px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)]">
              Personalize with a name and year. $18 each.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {ornaments.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Shadowboxes */}
      <section className="py-10">
        <div className="max-w-[1140px] mx-auto px-[8%]">
          <div className="text-center mb-8">
            <h2 className="text-[30px] md:text-[48px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-2">
              Paper Cut Shadowboxes
            </h2>
            <p className="text-[15px] md:text-[20px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)]">
              Layered, framed, ready to hang. $21.50 each.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {shadowboxes.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Shop-all CTA */}
      <section className="py-12">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center">
          <a
            href={paperData.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 text-base font-medium text-white bg-[#F56400] rounded-lg hover:bg-[#d95800] transition-colors"
          >
            Shop the full paper collection on Etsy
          </a>
        </div>
      </section>

      {/* Section 5: Wholesale CTA */}
      <section className="pt-4 pb-16">
        <div className="max-w-[1140px] mx-auto px-[8%] text-center">
          <h2 className="text-[30px] md:text-[48px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] mb-4">
            Wholesale
          </h2>
          <p className="text-[16px] md:text-[20px] font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0px_3px_rgba(0,0,0,0.9)] max-w-3xl mx-auto mb-8 leading-relaxed">
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

      {/* Floating Wholesale Catalog Button */}
      <Link
        href="/catalog"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-[14px] font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        Browse Wholesale Catalog
      </Link>
    </div>
  );
}
