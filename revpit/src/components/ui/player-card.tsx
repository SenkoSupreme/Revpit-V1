'use client';

import { useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlayerCardTier = 'STARTER' | 'ADVANCED' | 'PRO' | 'ELITE';

export interface PlayerCardStats {
  spd: number;
  pwr: number;
  skl: number;
  clb: number;
  rep: number;
}

export interface PlayerCardProps {
  username: string;
  handle: string;
  score: number;
  tier: PlayerCardTier;
  carName?: string;
  carPhoto?: string;
  stats: PlayerCardStats;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<PlayerCardTier, {
  bg: string;
  accent: string;
  glow: string;
  label: string;
}> = {
  STARTER: {
    bg:     'linear-gradient(160deg, #1A1918, #0A0908)',
    accent: '#5A5650',
    glow:   'none',
    label:  'STARTER',
  },
  ADVANCED: {
    bg:     'linear-gradient(160deg, #2A1A0A, #1A0E05)',
    accent: '#CC7A30',
    glow:   '0 0 20px rgba(204,122,48,0.3)',
    label:  'ADVANCED',
  },
  PRO: {
    bg:     'linear-gradient(160deg, #141A0A, #0A1205)',
    accent: '#C8FF00',
    glow:   '0 0 24px rgba(200,255,0,0.35)',
    label:  'PRO',
  },
  ELITE: {
    bg:     'linear-gradient(160deg, #1A1408, #0C0A04)',
    accent: '#D4A500',
    glow:   '0 0 32px rgba(212,165,0,0.5)',
    label:  'ELITE',
  },
};

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { width: 160, scoreFontSize: 40, nameFontSize: 16, statFontSize: 18, medFontSize: 14 },
  md: { width: 240, scoreFontSize: 56, nameFontSize: 20, statFontSize: 22, medFontSize: 16 },
  lg: { width: 300, scoreFontSize: 72, nameFontSize: 24, statFontSize: 26, medFontSize: 18 },
};

// ─── Car silhouette SVG ───────────────────────────────────────────────────────

function CarSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 80" style={{ width: '70%', opacity: 0.18 }} aria-hidden="true">
      <path
        d="M10,60 L10,50 L25,38 L45,22 Q70,10 100,8 Q130,6 155,18 L175,34 L188,48 L190,58 Q178,68 155,70 Q132,70 120,58 L80,58 Q68,68 45,70 Q22,70 10,62 Z"
        fill={color}
      />
      <circle cx="52" cy="62" r="12" fill={color} />
      <circle cx="52" cy="62" r="6"  fill="#0A0908" />
      <circle cx="148" cy="62" r="12" fill={color} />
      <circle cx="148" cy="62" r="6"  fill="#0A0908" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlayerCard({
  username,
  handle,
  score,
  tier,
  carName,
  stats,
  size = 'md',
  animate = false,
}: PlayerCardProps) {
  const cfg      = TIER_CONFIG[tier];
  const sizeCfg  = SIZE_CONFIG[size];
  const cardRef  = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  // OVR: maps score 0-10000 → 0-99
  const ovr = Math.min(99, Math.round((score / 10000) * 99));

  // Stat normaliser (0-99)
  const maxStat = 10000;
  const norm = (val: number) => Math.min(99, Math.round((val / maxStat) * 99));

  const statRows: [string, number][] = [
    ['SPD', norm(stats.spd)],
    ['PWR', norm(stats.pwr)],
    ['SKL', norm(stats.skl)],
    ['CLB', norm(stats.clb)],
    ['REP', norm(stats.rep)],
    ['OVR', ovr],
  ];

  // 3D tilt (ELITE only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tier !== 'ELITE') return;
    const rect = cardRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const clipPath = tier === 'ELITE'
    ? 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'
    : 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)';

  const { width, scoreFontSize, nameFontSize, statFontSize } = sizeCfg;
  const cardHeight = Math.round(width * 1.45);

  const transform = tier === 'ELITE' && hovered
    ? `scale(1.04) rotateY(${tilt.x * 5}deg) rotateX(${-tilt.y * 3}deg)`
    : hovered
    ? 'scale(1.04)'
    : 'scale(1)';

  const floatStyle = animate
    ? { animation: 'float 4s ease-in-out infinite' }
    : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        width,
        height:           cardHeight,
        background:       cfg.bg,
        clipPath,
        boxShadow:        hovered ? cfg.glow : 'none',
        transform,
        transition:       'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease',
        transformStyle:   'preserve-3d',
        position:         'relative',
        overflow:         'hidden',
        cursor:           'pointer',
        border:           `1px solid ${cfg.accent}33`,
        userSelect:       'none',
        flexShrink:       0,
        ...floatStyle,
      }}
    >
      {/* ELITE hex pattern overlay */}
      {tier === 'ELITE' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: `radial-gradient(circle, ${cfg.accent}06 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />
      )}

      {/* ELITE diagonal watermark */}
      {tier === 'ELITE' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display, "Bebas Neue", sans-serif)',
            fontSize: 80, color: '#D4A500', opacity: 0.04,
            transform: 'rotate(-30deg)', pointerEvents: 'none', zIndex: 0, letterSpacing: '0.1em',
          }}
        >
          ELITE
        </div>
      )}

      {/* ELITE shimmer sweep on hover */}
      {tier === 'ELITE' && hovered && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-50%', left: '-100%', width: '60%', height: '200%',
            background: 'linear-gradient(105deg, transparent 40%, rgba(212,165,0,0.12) 50%, transparent 60%)',
            animation: 'cardShimmer 0.8s ease-out forwards',
            pointerEvents: 'none', zIndex: 2,
          }}
        />
      )}

      {/* REVPIT watermark top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 8, right: 8,
          fontFamily: 'var(--font-display, "Bebas Neue", sans-serif)',
          fontSize: width * 0.1, color: '#F5F4F0', opacity: 0.07,
          letterSpacing: '0.06em', pointerEvents: 'none', zIndex: 1, lineHeight: 1,
        }}
      >
        REVPIT
      </div>

      {/* ── TOP SECTION (35%) ─────────────────────────────────────────────── */}
      <div style={{
        height:     '35%',
        padding:    `${size === 'sm' ? 8 : 12}px ${size === 'sm' ? 10 : 14}px 0`,
        position:   'relative',
        zIndex:     2,
      }}>
        {/* Tier badge */}
        <div style={{
          display:         'inline-flex',
          alignItems:      'center',
          padding:         `1px ${size === 'sm' ? 5 : 6}px`,
          border:          `1px solid ${cfg.accent}`,
          clipPath:        'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
          fontFamily:      'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize:        size === 'sm' ? 7 : 8,
          fontWeight:      700,
          letterSpacing:   '0.12em',
          color:           cfg.accent,
          marginBottom:    size === 'sm' ? 4 : 6,
        }}>
          {cfg.label}
        </div>

        {/* Score */}
        <div style={{
          fontFamily:    'var(--font-display, "Bebas Neue", sans-serif)',
          fontSize:      scoreFontSize,
          lineHeight:    0.9,
          color:         cfg.accent,
          textShadow:    cfg.glow !== 'none' ? `0 0 20px ${cfg.accent}60` : 'none',
          letterSpacing: '0.02em',
        }}>
          {score.toLocaleString()}
        </div>
        <div style={{
          fontFamily:  'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize:    size === 'sm' ? 7 : 8,
          color:       '#5A5650',
          letterSpacing: '0.1em',
          marginTop:   2,
        }}>
          DRIVER SCORE
        </div>
      </div>

      {/* ── MID SECTION (30%) — car image / silhouette ─────────────────────── */}
      <div style={{
        height:         '30%',
        position:       'relative',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        zIndex:         2,
      }}>
        <CarSilhouette color={cfg.accent} />
        {carName && (
          <div style={{
            position:   'absolute',
            bottom:     4,
            left:       size === 'sm' ? 10 : 14,
            fontFamily: 'var(--font-display, "Bebas Neue", sans-serif)',
            fontSize:   size === 'sm' ? 11 : 14,
            color:      '#F5F4F0',
            letterSpacing: '0.04em',
          }}>
            {carName}
          </div>
        )}
      </div>

      {/* ── BOTTOM SECTION (35%) ─────────────────────────────────────────────── */}
      <div style={{
        height:  '35%',
        padding: `${size === 'sm' ? 6 : 10}px ${size === 'sm' ? 10 : 14}px ${size === 'sm' ? 8 : 12}px`,
        zIndex:  2,
        position: 'relative',
      }}>
        {/* Player name */}
        <div style={{
          fontFamily:    'var(--font-display, "Bebas Neue", sans-serif)',
          fontSize:      nameFontSize,
          color:         '#F5F4F0',
          letterSpacing: '0.04em',
          lineHeight:    1,
          marginBottom:  1,
        }}>
          {username.toUpperCase()}
        </div>
        <div style={{
          fontFamily:  'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize:    size === 'sm' ? 7 : 9,
          color:       '#5A5650',
          letterSpacing: '0.06em',
          marginBottom: size === 'sm' ? 4 : 6,
        }}>
          @{handle}
        </div>

        {/* Divider */}
        <div style={{
          height:       1,
          background:   cfg.accent,
          opacity:      0.5,
          marginBottom: size === 'sm' ? 4 : 6,
        }} />

        {/* 6-stat grid (3×2) */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 `${size === 'sm' ? 2 : 4}px ${size === 'sm' ? 4 : 8}px`,
        }}>
          {statRows.map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily:  'var(--font-display, "Bebas Neue", sans-serif)',
                fontSize:    statFontSize,
                color:       cfg.accent,
                lineHeight:  1,
              }}>
                {val}
              </div>
              <div style={{
                fontFamily:  'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize:    size === 'sm' ? 6 : 7,
                color:       '#5A5650',
                letterSpacing: '0.1em',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
