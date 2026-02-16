import Link from 'next/link';
import EmailSignup from '@/components/EmailSignup';

export default function Footer({ isDark = false }: { isDark?: boolean }) {
  const bg = isDark ? 'bg-black border-white/10' : 'bg-gray-50 border-gray-200';
  const linkColor = isDark
    ? 'text-white/40 hover:text-white/70'
    : 'text-gray-400 hover:text-gray-600';
  const copyColor = isDark ? 'text-white/25' : 'text-gray-300';

  return (
    <footer className={`${bg} border-t`}>
      <div className="max-w-[1140px] mx-auto px-[8%] py-6 text-center">
        <EmailSignup isDark={isDark} />
        <div className="flex flex-wrap justify-center gap-6 mb-3 mt-4">
          <Link href="/leather" className={`text-[13px] font-light transition-colors ${linkColor}`}>
            Leather
          </Link>
          <Link href="/glass" className={`text-[13px] font-light transition-colors ${linkColor}`}>
            Art Glass
          </Link>
          <Link href="/paper" className={`text-[13px] font-light transition-colors ${linkColor}`}>
            Paper Art
          </Link>
          <Link href="/licensing" className={`text-[13px] font-light transition-colors ${linkColor}`}>
            Copyright &amp; Licensing
          </Link>
          <Link href="/about" className={`text-[13px] font-light transition-colors ${linkColor}`}>
            About
          </Link>
          <Link href="/catalog" className={`text-[13px] font-light transition-colors ${linkColor}`}>
            Wholesale
          </Link>
        </div>
        <p className={`text-[12px] font-light ${copyColor}`}>
          &copy; {new Date().getFullYear()} Banwell Designs. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
