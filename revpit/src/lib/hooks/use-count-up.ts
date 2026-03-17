'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp — animates a number from 0 (or a previous value) to `target`.
 *
 * @param target   - The final number to count to.
 * @param duration - Animation duration in ms (default 1200).
 * @param delay    - Delay before animation starts in ms (default 0).
 * @returns        The current animated value (integer).
 *
 * @example
 * const score = useCountUp(4250, 1000);
 * // renders: 0 → ... → 4250 over 1 second
 */
export function useCountUp(target: number, duration = 1200, delay = 0): number {
  const [value, setValue] = useState(0);
  const rafRef            = useRef<number | null>(null);
  const timeoutRef        = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (rafRef.current    != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, [target, duration, delay]);

  return value;
}
