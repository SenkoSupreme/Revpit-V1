'use client';

import type { LucideIcon } from 'lucide-react';
import { StatNumber } from '@/components/stat-number';

interface StatCardProps {
  /** Card heading label (mono, uppercase) */
  label:    string;
  /** Numeric value — animated count-up on mount */
  value:    number;
  /** Optional prefix rendered before the number (e.g. "#") */
  prefix?:  string;
  /** Optional suffix rendered after the number (e.g. "%") */
  suffix?:  string;
  /** Lucide icon component */
  icon?:    LucideIcon;
  /** Colour for the value text (defaults to --text-primary) */
  valueColor?: string;
  /** Sub-label below the value */
  subLabel?:   string;
  /** Count-up delay in ms (for stagger) */
  delay?:      number;
  /** Slot for extra content below the number row (e.g. TierBadge) */
  children?:   React.ReactNode;
}

/**
 * StatCard — animated dashboard metric widget.
 * Uses `useCountUp` via StatNumber, with mount-scale entrance animation.
 */
export function StatCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  valueColor = 'var(--text-primary, #F5F4F0)',
  subLabel,
  delay = 0,
  children,
}: StatCardProps) {
  return (
    <div
      className="rp-card stat-card-enter"
      style={{
        padding:         '22px 24px 20px',
        position:        'relative',
        overflow:        'hidden',
        animationDelay:  `${delay}ms`,
        display:         'flex',
        flexDirection:   'column',
        gap:             0,
      }}
    >
      {/* Top row: label + icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      9,
            fontWeight:    700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color:         'var(--text-muted, #6B6860)',
            margin:        0,
          }}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.5}
            style={{ color: 'var(--accent, #C8FF00)', opacity: 0.8, flexShrink: 0 }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, lineHeight: 1 }}>
        {prefix && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   44,
              color:      valueColor,
              lineHeight: 1,
            }}
          >
            {prefix}
          </span>
        )}
        <StatNumber
          value={value}
          delay={delay + 80}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize:   52,
            color:      valueColor,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        {suffix && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   44,
              color:      valueColor,
              lineHeight: 1,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {/* Sub-label */}
      {subLabel && (
        <p
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         'var(--text-muted, #6B6860)',
            marginTop:     8,
          }}
        >
          {subLabel}
        </p>
      )}

      {/* Extra slot (tier badge, ring gauge, etc.) */}
      {children && <div style={{ marginTop: 10 }}>{children}</div>}

      {/* Bottom accent bar — grows in on hover via CSS */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          bottom:          0,
          left:            0,
          height:          2,
          width:           '100%',
          background:      'linear-gradient(90deg, var(--accent, #C8FF00) 0%, transparent 100%)',
          opacity:         0,
          transition:      'opacity 200ms ease',
          pointerEvents:   'none',
        }}
        className="stat-card-bar"
      />
    </div>
  );
}
