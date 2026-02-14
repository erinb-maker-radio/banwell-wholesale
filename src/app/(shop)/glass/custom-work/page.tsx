'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import glassData from '@/data/glass-products.json';

const category = glassData.categories.find((c) => c.slug === 'custom-work')!;

export default function CustomWorkPage() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          {category.images.map((item, i) => (
            <button
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="relative aspect-square rounded-[8px] overflow-hidden bg-black cursor-zoom-in group"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl z-10 w-12 h-12 flex items-center justify-center"
          >
            &times;
          </button>

          {/* Prev arrow */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
              className="absolute left-4 text-white/70 hover:text-white text-5xl z-10"
            >
              &#8249;
            </button>
          )}

          {/* Next arrow */}
          {lightboxIdx < category.images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
              className="absolute right-4 text-white/70 hover:text-white text-5xl z-10"
            >
              &#8250;
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-4xl max-h-[85vh] aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={category.images[lightboxIdx].src}
              alt={category.images[lightboxIdx].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <a
          href="https://www.etsy.com/listing/1897620011/custom-photo-suncatcher-stained-glass"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Shop Custom Glass on Etsy
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
