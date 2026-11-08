'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export type PaperItem = {
  name: string;
  slug: string;
  category: string;
  price: string;
  image: string;
  etsyUrl: string;
  description: string;
  video?: string;
};

export default function ProductCard({ item }: { item: PaperItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const hasVideo = Boolean(item.video);

  const handleEnter = () => {
    if (!hasVideo || !videoRef.current) return;
    setShowVideo(true);
    videoRef.current.play().catch(() => {});
  };

  const handleLeave = () => {
    if (!hasVideo || !videoRef.current) return;
    setShowVideo(false);
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div
      className="flex flex-col bg-white/95 rounded-xl overflow-hidden shadow-lg border-4 border-white/60"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <a
        href={item.etsyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-square block bg-gray-100 overflow-hidden"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={`object-cover transition-opacity duration-300 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 50vw, 300px"
        />
        {hasVideo && (
          <video
            ref={videoRef}
            src={item.video}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </a>
      <div className="flex flex-col flex-1 p-4 text-center">
        <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 leading-tight">{item.name}</h3>
        <p className="text-[13px] md:text-[14px] text-gray-600 mt-1 mb-2 leading-snug flex-1">{item.description}</p>
        <p className="text-[18px] font-semibold text-gray-900 mb-3">${item.price}</p>
        <a
          href={item.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full px-4 py-2.5 text-[14px] font-medium text-white bg-[#F56400] rounded-lg hover:bg-[#d95800] transition-colors"
        >
          Shop on Etsy
        </a>
      </div>
    </div>
  );
}
