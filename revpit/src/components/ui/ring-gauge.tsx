'use client';

import { useEffect, useRef } from 'react';

interface RingGaugeProps {
  /** 0–100 percent value */
  value:  number;
  /** Outer diameter in px (default 86) */
  size?:  number;
  /** Stroke thickness in px (default 6) */
  stroke?: number;
}

/**
 * RingGauge — animated SVG ring that draws from 0 to `value` on mount.
 * Uses a spring-like cubic-bezier transition on stroke-dashoffset.
 * Replaces the static ProfileGauge in the dashboard.
 */
export function RingGauge({ value, size = 86, stroke = 6 }: RingGaugeProps) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fillRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;

    // Start hidden
    el.style.strokeDashoffset = String(circ);

    // Force a style recalc before transitioning so the initial state is applied
    void el.getBoundingClientRect();

    el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.strokeDashoffset = String(circ * (1 - value / 100));
  }, [value, circ]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`${value}% complete`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#3B3B37"
          strokeWidth={stroke}
        />
        {/* Animated fill */}
        <circle
          ref={fillRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C8FF00"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={String(circ)}
          strokeDashoffset={String(circ)}
        />
      </svg>

      {/* Lightning bolt icon centred inside ring */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M10.5 2L4 10h6l-2.5 6L16 8h-6l.5-6z" fill="#C8FF00" />
        </svg>
      </div>
    </div>
  );
}
