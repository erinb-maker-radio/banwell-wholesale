import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import characters from '@/data/plague-doctor-characters.json';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return characters.map((char) => ({ slug: char.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const character = characters.find((c) => c.slug === slug);
  if (!character) return { title: 'Not Found' };
  return {
    title: `${character.name} - Plague Doctor - Banwell Designs`,
    description: character.description,
  };
}

export default async function CharacterPage({ params }: Props) {
  const { slug } = await params;
  const character = characters.find((c) => c.slug === slug);

  if (!character) {
    notFound();
  }

  // Find related characters (same type or adjacent by number)
  const related = characters
    .filter((c) => c.slug !== character.slug)
    .filter((c) => c.type === character.type || Math.abs(c.number - character.number) <= 2)
    .slice(0, 4);

  return (
    <div className="bg-black">
      {/* Section 1: Character hero - 2 column (image left ~66%, text + buy right ~33%) */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          {/* Left: Hero Image */}
          <div className="md:col-span-3">
            <div className="relative w-full max-w-[64%] mx-auto aspect-[3/4]">
              <Image
                src={character.heroImage}
                alt={character.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Title + Buy button + Description */}
          <div className="md:col-span-2">
            <h1 className="text-[36px] md:text-[65px] font-semibold text-white leading-tight mb-2">
              {character.name}
            </h1>
            <p className="text-[14px] md:text-[22px] font-light text-white mb-2">
              #{character.number} &middot; {character.year} &middot; {character.type}
            </p>
            <p className="text-[14px] font-light text-white/70 italic mb-8">
              {character.tagline}
            </p>

            {/* Buy button */}
            <a
              href={character.etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[60px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors mb-8"
            >
              Buy This Mask
            </a>

            {/* Description */}
            <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed text-center">
              {character.description}
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 2: Extended Description (if available) */}
      {'extendedDescription' in character && character.extendedDescription && (
        <>
          <section className="max-w-[1140px] mx-auto px-[8%] py-8">
            <div className="max-w-3xl mx-auto">
              {(character.extendedDescription as string).split('\n\n').map((p, i) => (
                <p key={i} className="text-[14px] md:text-[16px] font-light text-white leading-relaxed mb-6 last:mb-0">
                  {p}
                </p>
              ))}
              <p className="text-[14px] font-light text-white/50 mt-4 italic">&mdash; Tom Banwell</p>
            </div>
          </section>

          {/* Divider */}
          <div className="max-w-[1140px] mx-auto px-[8%] py-4">
            <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
          </div>
        </>
      )}

      {/* Section 3: Features */}
      {character.features.length > 0 && (
        <>
          <section className="max-w-[1140px] mx-auto px-[8%] py-8 text-center">
            <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize mb-6">
              Features
            </h2>
            <ul className="max-w-xl mx-auto space-y-2">
              {character.features.map((feature, i) => (
                <li key={i} className="text-[14px] md:text-[16px] font-light text-white">
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {/* Divider */}
          <div className="max-w-[1140px] mx-auto px-[8%] py-4">
            <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
          </div>
        </>
      )}

      {/* Section 4: Out in the Wild */}
      {'outInTheWild' in character && character.outInTheWild && (
        <>
          <section className="max-w-[1140px] mx-auto px-[8%] py-8 text-center">
            <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize mb-6">
              Out In The Wild
            </h2>
            <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed max-w-3xl mx-auto">
              {character.outInTheWild as string}
            </p>
          </section>

          {/* Divider */}
          <div className="max-w-[1140px] mx-auto px-[8%] py-4">
            <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
          </div>
        </>
      )}

      {/* Section 5: Photo Gallery */}
      {character.images.length > 1 && (
        <>
          <section className="max-w-[1140px] mx-auto px-[8%] py-8">
            <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize text-center mb-8">
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[18px]">
              {character.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-[25px] overflow-hidden">
                  <Image
                    src={img}
                    alt={`${character.name} - Photo ${i + 1}`}
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
        </>
      )}

      {/* Section 6: Process Images */}
      {'processImages' in character && (character.processImages as string[])?.length > 0 && (
        <>
          <section className="max-w-[1140px] mx-auto px-[8%] py-8">
            <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize text-center mb-8">
              How It Was Made
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[15px] mx-auto" style={{ maxWidth: '70%' }}>
              {(character.processImages as string[]).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-[25px] overflow-hidden">
                  <Image
                    src={img}
                    alt={`${character.name} - Process ${i + 1}`}
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
        </>
      )}

      {/* Section 7: Related Characters */}
      {related.length > 0 && (
        <section className="max-w-[1140px] mx-auto px-[8%] py-8">
          <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize text-center mb-8">
            Related Characters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/leather/plague-doctor/${rel.slug}`}
                className="group text-center"
              >
                <div className="relative aspect-square rounded-[8px] overflow-hidden">
                  <Image
                    src={rel.heroImage}
                    alt={rel.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-3 text-[18px] md:text-[22px] font-semibold text-white capitalize">
                  {rel.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Buy CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <a
          href={character.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-[60px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
        >
          Buy {character.name} on Etsy
        </a>
      </section>

      {/* Back to collection */}
      <section className="max-w-[1140px] mx-auto px-[8%] pb-12 text-center">
        <Link
          href="/leather/plague-doctor"
          className="text-[14px] font-normal text-white/60 hover:text-[#F74646] transition-colors"
        >
          &larr; Back to Plague Doctor Collection
        </Link>
      </section>
    </div>
  );
}
