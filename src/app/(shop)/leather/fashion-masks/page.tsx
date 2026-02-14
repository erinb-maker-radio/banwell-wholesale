import Image from 'next/image';
import fashionData from '@/data/fashion-masks.json';

export const metadata = {
  title: 'Fashion Masks - Banwell Designs',
  description: fashionData.subtitle,
};

export default function FashionMasksPage() {
  return (
    <div className="bg-black">
      {/* Section 1: Heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-12 pb-4 text-center">
        <h1 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          {fashionData.title}
        </h1>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          {fashionData.subtitle}
        </p>
      </section>

      {/* Section 2: Gallery - 3 column grid */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {fashionData.images.map((item, i) => (
            <div key={i} className="relative aspect-square">
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

      {/* Section 3: CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <a
          href={fashionData.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          View Fashion Masks
        </a>
      </section>
    </div>
  );
}
