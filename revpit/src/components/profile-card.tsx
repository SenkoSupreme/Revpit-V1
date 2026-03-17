import type { CSSProperties } from 'react';
import type { Tier } from '@/lib/scoring';
import Image from 'next/image';
import { tokens } from '@/lib/design-tokens';
import styles from './profile-card.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfileCardProps = {
  username:    string;
  handle:      string;
  avatarLetter: string;
  score:       number;
  rank:        number;
  tier:        Tier;
  carName:     string;
  carSpec:     string;
  badges:      string[];
  stats: {
    badges: number;
    club:   string;
    quests: number;
  };
  variant: 'dark' | 'light';
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

const TIER_COLOR: Record<Tier, string> = {
  starter:  grey[500],
  advanced: grey[300],
  pro:      white,
  elite:    accent,
};

const TIER_LABEL: Record<Tier, string> = {
  starter:  'STARTER',
  advanced: 'ADVANCED',
  pro:      'PRO',
  elite:    'ELITE',
};

// ─── Car silhouette SVG ───────────────────────────────────────────────────────
// Side-view sedan silhouette (300 × 100 viewport)

function CarSilhouette({ fill }: { fill: string }) {
  return (
    <svg
      viewBox="0 0 300 100"
      width="220"
      height="74"
      aria-hidden="true"
      fill={fill}
    >
      {/* Body */}
      <path d="
        M 8 74
        L 8 52
        C 8 44 16 40 26 40
        L 68 40
        L 84 14
        Q 92 8 108 8
        L 196 8
        Q 212 8 222 16
        L 236 40
        L 268 40
        C 280 40 292 44 292 54
        L 292 74
        L 252 74
        A 26 26 0 0 0 200 74
        L 100 74
        A 26 26 0 0 0 48 74
        Z
      " />
      {/* Wheels */}
      <circle cx="74"  cy="74" r="22" fill={fill} />
      <circle cx="226" cy="74" r="22" fill={fill} />
      {/* Windshield cutout (lighter feel) */}
      <path
        d="M 88 38 L 100 14 L 148 14 L 148 38 Z"
        fill="none"
        stroke={fill}
        strokeWidth="0"
        opacity="0.5"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileCard({
  username,
  handle,
  avatarLetter,
  score,
  rank,
  tier,
  carName,
  carSpec,
  badges,
  stats,
  variant,
}: ProfileCardProps) {
  const dark = variant === 'dark';

  const bg          = dark ? grey[900]  : '#F0EFEB';
  const borderColor = dark ? grey[700]  : '#C4C3BE';
  const textPrimary = dark ? white      : black;
  const textMuted   = dark ? grey[500]  : grey[700];
  const bracketColor= dark ? accent     : black;
  const scanColor   = dark ? `${accent}aa` : `${black}55`;
  const dividerColor= dark ? grey[700]  : '#C4C3BE';
  const badgeBg     = dark ? '#2A2927'  : '#E4E3DF';
  const statBg      = dark ? '#161514'  : '#E0DFD9';
  const tierColor   = TIER_COLOR[tier];
  const watermarkFill = dark ? white : black;

  const cardStyle: CSSProperties = {
    backgroundColor: bg,
    border: `1px solid ${borderColor}`,
    padding: '22px 22px 20px',
    // CSS variables used by the module classes
    ['--bracket-color' as string]: bracketColor,
    ['--scan-color'    as string]: scanColor,
  };

  return (
    <div
      className={`${styles.card} ${dark ? styles.cardDark : styles.cardLight}`}
      style={cardStyle}
    >
      {/* Corner brackets */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      {/* Scan line */}
      <div className={styles.scanLine} />

      {/* Car watermark */}
      <div className={styles.carWatermark}>
        <CarSilhouette fill={watermarkFill} />
      </div>

      {/* Logo watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 16,
          opacity: 0.06,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Image
          src="/images/logo-white.png"
          alt=""
          width={80}
          height={23}
          style={{ width: 80, height: 'auto' }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className={styles.content}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          {/* Avatar */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: dark ? grey[700] : '#C4C3BE',
              border: `1.5px solid ${bracketColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 700,
              color: dark ? white : black,
              flexShrink: 0,
            }}
          >
            {avatarLetter.toUpperCase()}
          </div>

          {/* Name + handle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: body,
                fontSize: 15,
                fontWeight: 600,
                color: textPrimary,
                margin: 0,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {username}
            </p>
            <p
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: textMuted,
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              @{handle}
            </p>
          </div>

          {/* Tier badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              backgroundColor: dark ? `${tierColor}18` : `${tierColor}22`,
              border: `1px solid ${tierColor}55`,
              borderRadius: 3,
              padding: '3px 8px',
            }}
          >
            <span
              className={styles.pulseDot}
              style={{ backgroundColor: tierColor }}
            />
            <span
              style={{
                fontFamily: mono,
                fontSize: 9,
                fontWeight: 700,
                color: tierColor,
                letterSpacing: '0.1em',
              }}
            >
              {TIER_LABEL[tier]}
            </span>
          </div>
        </div>

        {/* Score row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: textMuted,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              Score
            </p>
            <span
              className={dark ? styles.scoreGlow : undefined}
              style={{
                fontFamily: mono,
                fontSize: 38,
                fontWeight: 700,
                color: dark ? accent : black,
                lineHeight: 1,
                display: 'block',
              }}
            >
              {score.toLocaleString()}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: textMuted,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              Rank
            </p>
            <span
              style={{
                fontFamily: mono,
                fontSize: 22,
                fontWeight: 700,
                color: textPrimary,
                lineHeight: 1,
                display: 'block',
              }}
            >
              #{rank.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: dividerColor, marginBottom: 14 }} />

        {/* Car info */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              fontFamily: display,
              fontSize: 17,
              letterSpacing: '0.05em',
              color: textPrimary,
            }}
          >
            {carName}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: textMuted,
              marginLeft: 8,
              letterSpacing: '0.04em',
            }}
          >
            {carSpec}
          </span>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 16,
            }}
          >
            {badges.map((badge) => (
              <span
                key={badge}
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: textMuted,
                  backgroundColor: badgeBg,
                  border: `1px solid ${dividerColor}`,
                  borderRadius: 2,
                  padding: '3px 7px',
                  textTransform: 'uppercase',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: dividerColor, marginBottom: 12 }} />

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Badges',  value: stats.badges },
            { label: 'Club',    value: stats.club   },
            { label: 'Quests',  value: stats.quests },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                flex: 1,
                backgroundColor: statBg,
                borderRadius: 3,
                padding: '8px 10px',
                minWidth: 0,
              }}
            >
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: textMuted,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 13,
                  fontWeight: 700,
                  color: textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
