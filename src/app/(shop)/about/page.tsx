import Image from 'next/image';
import Link from 'next/link';
import aboutContent from '@/data/about-content.json';

export const metadata = {
  title: 'About Us - Banwell Designs',
  description: aboutContent.intro,
};

export default function AboutPage() {
  return (
    <div className="bg-black">
      {/* Section 1: Tom Banwell - 2 column (text left, image right) */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-[36px] md:text-[65px] font-semibold text-white leading-tight mb-2">
              Tom Banwell
            </h1>
            <p className="text-[14px] md:text-[22px] font-light text-white mb-6">
              Leather, Stained Glass &amp; Paper Art
            </p>
            <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
              {aboutContent.intro}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[4/5]">
              <Image
                src={aboutContent.founderImage}
                alt="Tom Banwell"
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

      {/* Section 2: The Original Maker - 2 column */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize mb-6">
              {aboutContent.originStory}
            </h2>
            {aboutContent.history.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-[14px] md:text-[16px] font-light text-white leading-relaxed mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[4/5]">
              <Image
                src="/images/brand/plague-doctor/plague-doctor-costume-parts-poster-1.jpg"
                alt="Plague Doctor Costume Parts"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 3: Social Icons */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-12 text-center">
        <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize mb-8">
          Connect With Us
        </h2>
        <div className="flex justify-center gap-8">
          <a
            href={aboutContent.socialMedia.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#3b5998] flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="Facebook"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href={aboutContent.socialMedia.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="YouTube"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a
            href={aboutContent.socialMedia.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="Instagram"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 4: Shop CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize mb-4">
          Shop Our Creations
        </h2>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto mb-8 leading-relaxed">
          Explore our leather masks, stained glass, and paper art on Etsy, or browse our wholesale catalog for retailers.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href={aboutContent.etsyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
          >
            Shop on Etsy
          </a>
          <Link
            href="/catalog"
            className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white border border-white rounded-full hover:text-[#F74646] transition-colors"
          >
            Wholesale Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
