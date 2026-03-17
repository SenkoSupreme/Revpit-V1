'use client';

import type { CSSProperties } from 'react';
import { useCountUp } from '@/hooks/use-count-up';

interface StatNumberProps {
  value:     number;
  style?:    CSSProperties;
  className?: string;
  /** Animation duration in ms (default 1200) */
  duration?: number;
  /** Delay before animation starts in ms (default 0) */
  delay?:    number;
}

/**
 * StatNumber — renders an animated count-up number using useCountUp.
 * Replaces static number spans in stat widgets on the dashboard.
 *
 * @example
 * <StatNumber value={14280} style={{ fontFamily: mono, fontSize: 38, color: accent }} />
 */
export function StatNumber({ value, style, className, duration, delay }: StatNumberProps) {
  const displayed = useCountUp({ end: value, duration, delay });
  return (
    <span style={style} className={className}>
      {displayed.toLocaleString()}
    </span>
  );
}
