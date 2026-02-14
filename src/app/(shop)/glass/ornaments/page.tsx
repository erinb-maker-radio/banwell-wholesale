import Image from 'next/image';
import Link from 'next/link';
import glassData from '@/data/glass-products.json';

const category = glassData.categories.find((c) => c.slug === 'ornaments')!;

export const metadata = {
  title: 'Ornaments - Stained Glass - Banwell Designs',
  description: category.description,
};

export default function OrnamentsPage() {
  return (
    <div className="bg-black">
      {/* Heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-12 pb-4 text-center">
        <h1 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          {category.name}
        </h1>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          {category.description}
        </p>
      </section>

      {/* Gallery */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
          {category.images.map((item, i) => (
            <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden bg-black">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <a
          href={glassData.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Shop Ornaments on Etsy
        </a>
      </section>

      {/* Back link */}
      <section className="max-w-[1140px] mx-auto px-[8%] pb-12 text-center">
        <Link
          href="/glass"
          className="text-[14px] font-normal text-white/60 hover:text-[#F74646] transition-colors"
        >
          &larr; Back to Stained Glass
        </Link>
      </section>
    </div>
  );
}
