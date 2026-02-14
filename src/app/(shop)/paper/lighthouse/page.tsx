import Image from 'next/image';
import Link from 'next/link';
import paperData from '@/data/paper-products.json';

const item = paperData.items.find((i) => i.slug === 'lighthouse')!;

export const metadata = {
  title: 'Lighthouse - Paper Art - Banwell Designs',
  description: item.description,
};

export default function LighthousePage() {
  return (
    <div className="bg-black">
      {/* Heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-12 pb-4 text-center">
        <h1 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          {item.name}
        </h1>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          {item.description}
        </p>
      </section>

      {/* Gallery */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
          {item.images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden bg-black">
              <Image
                src={img.src}
                alt={img.alt}
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
          href={paperData.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Shop Lighthouse Art on Etsy
        </a>
      </section>

      {/* Back link */}
      <section className="max-w-[1140px] mx-auto px-[8%] pb-12 text-center">
        <Link
          href="/paper"
          className="text-[14px] font-normal text-white/60 hover:text-[#F74646] transition-colors"
        >
          &larr; Back to Paper Art
        </Link>
      </section>
    </div>
  );
}
