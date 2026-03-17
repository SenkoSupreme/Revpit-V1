import type { Tier } from '@/lib/scoring';

interface TierBadgeProps {
  tier:       Tier | string;
  /** Optional size override — 'sm' (default) or 'md' */
  size?:      'sm' | 'md';
  className?: string;
}

const TIER_STYLES: Record<string, { color: string; border: string }> = {
  elite:    { color: '#D4A500', border: 'rgba(212,165,0,0.40)' },
  pro:      { color: '#C8FF00', border: 'rgba(200,255,0,0.35)' },
  advanced: { color: '#FF9500', border: 'rgba(255,149,0,0.35)' },
  starter:  { color: '#6B6860', border: 'rgba(107,104,96,0.35)' },
};

const FALLBACK = { color: '#6B6860', border: 'rgba(107,104,96,0.35)' };

/**
 * TierBadge — compact pill badge for ELITE / PRO / ADVANCED / STARTER tiers.
 * Zero border-radius, JetBrains Mono, colour-coded per tier.
 *
 * @example
 * <TierBadge tier="elite" />
 * <TierBadge tier="pro" size="md" />
 */
export function TierBadge({ tier, size = 'sm', className }: TierBadgeProps) {
  const key    = tier.toLowerCase();
  const styles = TIER_STYLES[key] ?? FALLBACK;
  const fs     = size === 'md' ? 10 : 8;
  const px     = size === 'md' ? 10 : 7;

  return (
    <span
      className={className}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        padding:       `3px ${px}px`,
        border:        `1px solid ${styles.border}`,
        borderRadius:  0,
        fontFamily:    'var(--font-mono)',
        fontSize:      fs,
        fontWeight:    700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         styles.color,
        background:    `${styles.color}0D`,
        whiteSpace:    'nowrap',
        flexShrink:    0,
        lineHeight:    1,
      }}
    >
      {tier.toUpperCase()}
    </span>
  );
}
