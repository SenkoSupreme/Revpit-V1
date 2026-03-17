'use client';

import { useState, useEffect, useRef } from 'react';

interface CountUpOptions {
  /** Starting value (default 0) */
  start?: number;
  /** Target value */
  end: number;
  /** Animation duration in ms (default 1200) */
  duration?: number;
  /** Delay before starting in ms (default 0) */
  delay?: number;
}

/**
 * useCountUp — animates a number from `start` to `end` on mount.
 * Uses a cubic ease-out curve for a natural deceleration feel.
 *
 * @example
 * const score = useCountUp({ end: 14280, duration: 1200 });
 * return <span>{score.toLocaleString()}</span>;
 */
export function useCountUp({
  start    = 0,
  end,
  duration = 1200,
  delay    = 0,
}: CountUpOptions): number {
  const [value, setValue] = useState(start);
  const frameRef           = useRef<number>(0);

  useEffect(() => {
    let startTime: number | null = null;

    function animate(now: number) {
      if (!startTime) startTime = now;
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // cubic ease-out: decelerates as it approaches the target
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    const timeoutId = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameRef.current);
    };
  }, [start, end, duration, delay]);

  return value;
}
