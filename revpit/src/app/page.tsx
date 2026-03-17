import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';
import { HeroImage } from '@/components/landing/hero-image';

// ─── Inline REVPIT logo (SVG diamond + wordmark) ─────────────────────────────
function RevpitLogo({ size = 'md', opacity = 1 }: { size?: 'sm' | 'md' | 'lg'; opacity?: number }) {
  const iconSize = size === 'lg' ? 24 : size === 'sm' ? 14 : 18;
  const fontSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 22;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M10 2L18 10L10 18L2 10L10 2Z" fill="#C8FF00" />
        <path d="M10 7L13 10L10 13L7 10L10 7Z" fill="#0E0D0C" />
      </svg>
      <span style={{
        fontFamily:    'var(--font-display)',
        fontSize,
        letterSpacing: '0.05em',
        color:         '#F5F4F0',
        lineHeight:    1,
      }}>
        REVPIT
      </span>
    </div>
  );
}

export const metadata = {
  title: 'REVPIT — Motorsport Platform',
  description: 'The ultimate ecosystem for drivers to compete, connect, and showcase high-performance builds.',
};

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono } = tokens.fonts;

// ─── Mock leaderboard data ─────────────────────────────────────────────────────

const LEADERS = [
  { rank: '01', username: 'VRT_Ghost',      car: 'Porsche 911 GT3 RS', pts: '14,280', gold: true },
  { rank: '02', username: 'Apex_Predator',  car: 'Nissan GT-R Nismo',  pts: '13,945', gold: false },
  { rank: '03', username: 'Redline_Max',    car: 'BMW M4 CSL',         pts: '13,210', gold: false },
  { rank: '04', username: 'Turbo_Tomi',     car: 'Audi R8 V10',        pts: '12,880', gold: false },
  { rank: '05', username: 'Shift_Queen',    car: 'Lotus Emira',        pts: '12,540', gold: false },
];

const STATS = [
  { value: '8.4K', label: 'BUILDS'     },
  { value: '312',  label: 'CLUBS'      },
  { value: '94',   label: 'CHALLENGES' },
  { value: '41',   label: 'COUNTRIES'  },
];

const FEATURES = [
  {
    n: '01',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="10" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="7" y="6"  width="3" height="10" rx="1" fill="currentColor" />
        <rect x="12" y="2" width="3" height="14" rx="1" fill="currentColor" />
        <path d="M2 8l4-4 4 3 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'SCORE SYSTEM',
    desc: 'Advanced telemetry-based scoring that captures every nuance of your driving style.',
  },
  {
    n: '02',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'GLOBAL LEADERBOARD',
    desc: 'Climb the ranks and earn your place among the world\'s most elite street and track drivers.',
  },
  {
    n: '03',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="6"  cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 15c0-2.76 2.24-5 5-5h6c2.76 0 5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'CLUBS',
    desc: 'Form specialized teams, host private events, and dominate regional circuits together.',
  },
  {
    n: '04',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2l1.5 4.5H15l-3.75 2.73 1.43 4.5L9 11.2l-3.68 2.53 1.43-4.5L3 6.5h4.5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'QUESTS',
    desc: 'Dynamic seasonal objectives and high-stakes missions designed to test your limits.',
  },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: 60,
        backgroundColor: `${black}ee`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${grey[700]}22`,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <RevpitLogo size="md" />
      </Link>

      {/* Nav links */}
      <div className="rp-nav-links">
        {(['LEADERBOARD', 'CLUBS', 'CHALLENGES', 'QUESTS'] as const).map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            style={{
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: grey[500],
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/sign-up"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 38,
          padding: '0 22px',
          backgroundColor: accent,
          color: black,
          borderRadius: 3,
          fontFamily: mono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
        className="btn-press"
      >
        JOIN NOW
      </Link>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        padding:  '80px 40px 72px',
        overflow: 'hidden',
      }}
    >
      {/* Automotive background photo with parallax */}
      <HeroImage />

      {/* Dot-grid texture overlay (sits above photo, below content) */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          zIndex:          1,
          backgroundImage: `radial-gradient(circle, ${grey[700]}44 1px, transparent 1px)`,
          backgroundSize:  '36px 36px',
          pointerEvents:   'none',
        }}
      />

      {/* Top accent line on left */}
      <div
        style={{
          position:        'absolute',
          top:             0,
          left:            40,
          width:           2,
          height:          40,
          backgroundColor: accent,
          zIndex:          2,
        }}
      />

      <div
        style={{
          maxWidth:  1140,
          margin:    '0 auto',
          position:  'relative',
          zIndex:    2,
        }}
        className="rp-hero-grid"
      >
        {/* Left */}
        <div>
          {/* Hero logo mark */}
          <div style={{ marginBottom: 28, animation: 'rp-slide-up 600ms ease-out both' }}>
            <RevpitLogo size="lg" />
          </div>

          <p
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: accent,
              textTransform: 'uppercase',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 2,
                backgroundColor: accent,
                verticalAlign: 'middle',
              }}
            />
            ENGINEERED FOR PERFORMANCE
          </p>

          <h1
            style={{
              fontFamily: display,
              fontSize: 'clamp(56px, 7vw, 96px)',
              lineHeight: 0.92,
              letterSpacing: '0.02em',
              margin: '0 0 8px',
              color: white,
            }}
          >
            BUILT FOR THE
          </h1>
          <h1
            style={{
              fontFamily: display,
              fontSize: 'clamp(56px, 7vw, 96px)',
              lineHeight: 0.92,
              letterSpacing: '0.02em',
              margin: '0 0 32px',
              color: accent,
            }}
          >
            PASSIONATE
          </h1>

          <p
            style={{
              fontFamily: body,
              fontSize: 16,
              color: grey[500],
              lineHeight: 1.65,
              maxWidth: 460,
              marginBottom: 40,
            }}
          >
            The ultimate ecosystem for drivers to compete, connect, and showcase
            high-performance builds. Track every millisecond, dominate every corner.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link
              href="/sign-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 48,
                padding: '0 32px',
                backgroundColor: accent,
                color: black,
                borderRadius: 3,
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textDecoration: 'none',
              }}
              className="btn-press"
            >
              GET STARTED
            </Link>
            <Link
              href="/leaderboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 48,
                padding: '0 32px',
                backgroundColor: 'transparent',
                color: white,
                border: `1px solid ${grey[700]}`,
                borderRadius: 3,
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textDecoration: 'none',
              }}
              className="btn-press"
            >
              EXPLORE LEADERBOARD
            </Link>
          </div>
        </div>

        {/* Right — Live Leaderboard widget */}
        <div
          style={{
            backgroundColor: grey[900],
            border: `1px solid ${grey[700]}`,
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: `1px solid ${grey[700]}`,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: display,
                  fontSize: 20,
                  letterSpacing: '0.06em',
                  color: white,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                LIVE LEADERBOARD
              </p>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: grey[500],
                  textTransform: 'uppercase',
                }}
              >
                GLOBAL SEASON 04
              </p>
            </div>
            {/* Trophy icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M7 3h8v8a4 4 0 01-8 0V3z" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M7 5H4a1 1 0 00-1 1v2a3 3 0 003 3M15 5h3a1 1 0 011 1v2a3 3 0 01-3 3" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M11 15v3M8 19h6" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Rows */}
          {LEADERS.map((row) => (
            <div
              key={row.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 24px',
                borderBottom: `1px solid ${grey[700]}22`,
                borderLeft: row.gold ? `3px solid ${accent}` : '3px solid transparent',
                backgroundColor: row.gold ? `${accent}08` : 'transparent',
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: row.gold ? accent : grey[500],
                  width: 28,
                  flexShrink: 0,
                }}
              >
                {row.rank}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 13,
                    fontWeight: 600,
                    color: row.gold ? white : grey[300],
                    marginBottom: 2,
                  }}
                >
                  {row.username}
                </p>
                <p
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    color: grey[700],
                    textTransform: 'uppercase',
                  }}
                >
                  {row.car}
                </p>
              </div>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: row.gold ? accent : grey[500],
                  whiteSpace: 'nowrap',
                }}
              >
                {row.pts} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsTicker() {
  return (
    <section
      style={{
        backgroundColor: accent,
        padding: '20px 40px',
      }}
    >
      <div
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          flexWrap: 'wrap',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
            }}
          >
            {i > 0 && (
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: black,
                  opacity: 0.35,
                  margin: '0 40px',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                style={{
                  fontFamily: display,
                  fontSize: 32,
                  letterSpacing: '0.04em',
                  color: black,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: `${black}88`,
                }}
              >
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section style={{ padding: '80px 40px' }}>
      <div
        style={{
          maxWidth: 1140,
          margin: '0 auto',
        }}
        className="rp-features-grid"
      >
        {FEATURES.map((f) => (
          <div key={f.n}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 26,
                  fontWeight: 700,
                  color: grey[700],
                  lineHeight: 1,
                }}
              >
                {f.n}
              </span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: `${accent}1A`,
                  border: `1px solid ${accent}44`,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: accent,
                }}
              >
                {f.icon}
              </div>
            </div>
            <h3
              style={{
                fontFamily: display,
                fontSize: 18,
                letterSpacing: '0.06em',
                color: white,
                marginBottom: 10,
                lineHeight: 1.1,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontFamily: body,
                fontSize: 13,
                color: grey[500],
                lineHeight: 1.6,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${grey[700]}`,
        padding: '28px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <RevpitLogo size="sm" opacity={0.6} />
      </Link>

      <p
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: '0.14em',
          color: grey[700],
          textTransform: 'uppercase',
        }}
      >
        © 2025 REVPIT TECHNOLOGY SYSTEMS. ALL RIGHTS RESERVED.
      </p>

      {/* Social icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Share */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="12" cy="3" r="2" stroke={grey[700]} strokeWidth="1.5" />
          <circle cx="4"  cy="8" r="2" stroke={grey[700]} strokeWidth="1.5" />
          <circle cx="12" cy="13" r="2" stroke={grey[700]} strokeWidth="1.5" />
          <path d="M6 7l4-3M6 9l4 3" stroke={grey[700]} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* Email */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="12" height="9" rx="1.5" stroke={grey[700]} strokeWidth="1.5" />
          <path d="M2 5.5l6 4 6-4" stroke={grey[700]} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* Settings */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="2" stroke={grey[700]} strokeWidth="1.5" />
          <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.64 3.64l1.06 1.06M11.3 11.3l1.06 1.06M3.64 12.36l1.06-1.06M11.3 4.7l1.06-1.06" stroke={grey[700]} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: black,
        color: white,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <HeroSection />
      <StatsTicker />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
