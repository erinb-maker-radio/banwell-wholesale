import Image from 'next/image';
import galleryItems from '@/data/gallery-items.json';

export const metadata = {
  title: 'Out in the Wild - Gallery - Banwell Designs',
  description: 'A showcase of features, partners, clients, celebrity name-drops, and places our work has been found.',
};

export default function GalleryPage() {
  return (
    <div className="bg-black">
      {/* Section 1: Heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-8 pb-4 text-center">
        <h1 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          Out In The Wild...
        </h1>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto leading-relaxed">
          A showcase of features, partners, clients, celebrity name-drops, and places our work
          has been found... Out In The Wild!
        </p>
      </section>

      {/* Gallery Sections */}
      {galleryItems.map((section, sectionIndex) => (
        <div key={section.category}>
          {/* Divider between sections */}
          {sectionIndex > 0 && (
            <div className="max-w-[1140px] mx-auto px-[8%] py-4">
              <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
            </div>
          )}

          {/* Category Heading */}
          <section className="max-w-[1140px] mx-auto px-[8%] pt-8 pb-4 text-center">
            <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize">
              {section.category}
            </h2>
          </section>

          {/* Items - 2 column blog-style layout */}
          <section className="max-w-[1140px] mx-auto px-[8%] py-4">
            <div className="space-y-10">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
                >
                  {/* Text side */}
                  <div className={i % 2 === 0 ? 'order-1' : 'order-1 md:order-2'}>
                    <h3 className="text-[18px] md:text-[22px] font-semibold text-white capitalize mb-2">
                      {item.title}
                    </h3>
                    {'subtitle' in item && item.subtitle && (
                      <p className="text-[14px] font-light text-white/70 mb-3">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {/* Image side */}
                  <div className={`relative aspect-video rounded-[8px] overflow-hidden ${i % 2 === 0 ? 'order-2' : 'order-2 md:order-1'}`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain bg-black p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ))}

      {/* Final Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <a
          href="https://www.etsy.com/shop/BanwellDesigns"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Shop Banwell Designs
        </a>
      </section>
    </div>
  );
}
