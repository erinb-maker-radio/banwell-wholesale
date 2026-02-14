import Image from 'next/image';
import Link from 'next/link';
import characters from '@/data/plague-doctor-characters.json';
import accessories from '@/data/plague-doctor-accessories.json';

export const metadata = {
  title: 'Plague Doctor Masks - Banwell Designs',
  description: 'The original maker of modern, handmade leather plague doctor masks. 13 unique characters created since 2010.',
};

export default function PlagueDoctorPage() {
  return (
    <div className="bg-black">
      {/* Section 1: Intro - 2 column (text left, image right) */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-[36px] md:text-[65px] font-semibold text-white leading-tight mb-6">
              Plague Doctor Masks
            </h1>
            <p className="text-[14px] md:text-[22px] font-light text-white leading-relaxed mb-6">
              In 2010, when most people had never heard the words &ldquo;plague doctor&rdquo;, Tom Banwell
              created his first plague doctor mask. He would go on to create 13 distinct characters
              including the world&rsquo;s first steampunk plague doctor character.
            </p>
            <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
              These characters and their accompanying accessories have been featured in international
              museum exhibitions, film, and commercials, in music videos and on stage by Grammy
              award winning artists, used as company logos, beer labels and more.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[3/4]">
              <Image
                src="/images/brand/plague-doctor/plague-doctor-costume-parts-poster-1.jpg"
                alt="Plague Doctor Costume"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 2: Characters heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-8 pb-4 text-center">
        <h2 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          The Characters
        </h2>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          13 unique plague doctor characters, each handcrafted from premium leather
        </p>
      </section>

      {/* Section 3: Character gallery - 3 column grid with captions */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
          {characters.map((char) => (
            <Link
              key={char.slug}
              href={`/leather/plague-doctor/${char.slug}`}
              className="group text-center"
            >
              <div className="relative aspect-square rounded-[8px] overflow-hidden">
                <Image
                  src={char.heroImage}
                  alt={char.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="mt-3 text-[18px] md:text-[22px] font-semibold text-white capitalize">
                {char.name}
              </p>
              <p className="text-[14px] font-light text-white/70">
                {char.year} &middot; {char.type}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 4: Accessories heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-8 pb-4 text-center">
        <h2 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          Accessories
        </h2>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          Complete the costume with handcrafted leather accessories
        </p>
      </section>

      {/* Section 5: Accessories grid */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
          {accessories.map((acc) => (
            <a
              key={acc.slug}
              href={acc.etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center"
            >
              <div className="relative aspect-square rounded-[8px] overflow-hidden">
                <Image
                  src={acc.heroImage}
                  alt={acc.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="mt-3 text-[18px] md:text-[22px] font-semibold text-white capitalize">
                {acc.name}
              </p>
              <p className="text-[14px] font-light text-white/70">{acc.year}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 6: Shop CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <a
          href="https://www.etsy.com/shop/BanwellDesigns"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Shop Plague Doctor Collection
        </a>
      </section>
    </div>
  );
}
