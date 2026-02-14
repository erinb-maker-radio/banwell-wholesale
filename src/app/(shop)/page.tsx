import Link from 'next/link';
import Image from 'next/image';
import landingData from '@/data/landing-page.json';

export default function LandingPage() {
  return (
    <div>

      {/* ───────────────── HERO WITH COLLECTION CARDS ───────────────── */}
      <section className="relative overflow-hidden py-4 md:py-6">
        {/* Warm watercolor gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(219,234,254,0.6) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(191,219,254,0.4) 0%, transparent 60%)',
              'radial-gradient(ellipse 90% 50% at 50% 90%, rgba(224,231,255,0.3) 0%, transparent 55%)',
              'radial-gradient(ellipse 40% 40% at 10% 80%, rgba(199,210,254,0.2) 0%, transparent 50%)',
              'radial-gradient(ellipse 50% 60% at 90% 70%, rgba(186,230,253,0.15) 0%, transparent 50%)',
              'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            ].join(', '),
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col items-center justify-center">
          {/* 3 Collection Cards */}
          <div className="animate-fade-up-delay-1 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full">
            {landingData.productLines.map((line) => (
              <Link
                key={line.name}
                href={line.href}
                className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-500 aspect-[4/5] md:aspect-[3/4]"
              >
                {/* Card background image */}
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />

                {/* Bottom gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 via-40% to-transparent" />

                {/* Blue accent line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                {/* Content overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 className="text-white text-2xl md:text-3xl font-semibold tracking-wide mb-2">
                    {line.name}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-[320px] transition-colors duration-300 group-hover:text-white/80">
                    {line.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-white/50 text-sm tracking-wide transition-all duration-300 group-hover:text-blue-300 group-hover:gap-3">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
