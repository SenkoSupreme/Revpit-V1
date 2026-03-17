'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * HeroImage — full-bleed parallax background for the landing page hero.
 * Uses a free Unsplash automotive image with a dark gradient overlay.
 * Scroll listener moves the image at 0.3× speed for a subtle depth effect.
 */
export function HeroImage() {
  const imgWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (imgWrapRef.current) {
        imgWrapRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        zIndex:        0,
        overflow:      'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Parallax image — oversized vertically so translateY has headroom */}
      <div
        ref={imgWrapRef}
        style={{ position: 'absolute', inset: '-25%', willChange: 'transform' }}
      >
        <Image
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
          alt=""
          fill
          unoptimized
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
        />
      </div>

      {/* Primary dark overlay */}
      <div
        style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(to bottom, rgba(14,13,12,0.82) 0%, rgba(14,13,12,0.96) 100%)',
        }}
      />
    </div>
  );
}
