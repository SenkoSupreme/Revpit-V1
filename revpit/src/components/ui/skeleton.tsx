import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?:     string | number;
  height?:    number;
  style?:     CSSProperties;
  className?: string;
  /** Use circular shape (for avatars) */
  circle?:    boolean;
}

/**
 * Skeleton — shimmer placeholder block.
 * Uses the global `.skeleton` keyframe from globals.css.
 *
 * @example
 * <Skeleton width={120} height={14} />
 * <Skeleton circle height={32} width={32} />
 */
export function Skeleton({ width, height = 16, style, className, circle }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className ?? ''}`}
      aria-hidden="true"
      style={{
        width:        width ?? '100%',
        height,
        borderRadius: circle ? '50%' : 0,
        flexShrink:   0,
        ...style,
      }}
    />
  );
}

/**
 * SkeletonText — multi-line text block placeholder.
 */
export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}
