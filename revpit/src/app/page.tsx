import Link from 'next/link';
import Image from 'next/image';
import { tokens } from '@/lib/design-tokens';
import { HeroImage } from '@/components/landing/hero-image';

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono } = tokens.fonts;

export const metadata = {
  title: 'REVPIT — Motorsport Platform',
  description: 'The ultimate ecosystem for drivers to compete, connect, and showcase high-performance builds.',
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const LEADERS = [
  { rank: '01', username: 'VRT_Ghost',     car: 'Porsche 911 GT3 RS', pts: '14,280', gold: true  },
  { rank: '02', username: 'Apex_Predator', car: 'Nissan GT-R Nismo',  pts: '13,945', gold: false },
  { rank: '03', username: 'Redline_Max',   car: 'BMW M4 CSL',         pts: '13,210', gold: false },
  { rank: '04', username: 'Turbo_Tomi',    car: 'Audi R8 V10',        pts: '12,880', gold: false },
  { rank: '05', username: 'Shift_Queen',   car: 'Lotus Emira',        pts: '12,540', gold: false },
];

const STATS = [
  { value: '8.4K+', label: 'BUILDS',      sub: 'REGISTERED'   },
  { value: '312',   label: 'CLUBS',       sub: 'WORLDWIDE'     },
  { value: '94',    label: 'CHALLENGES',  sub: 'THIS SEASON'   },
  { value: '41',    label: 'COUNTRIES',   sub: 'REPRESENTED'   },
];

const FEATURES = [
  {
    n: '01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="10" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="7" y="6"  width="3" height="10" rx="1" fill="currentColor" />
        <rect x="12" y="2" width="3" height="14" rx="1" fill="currentColor" />
        <path d="M2 8l4-4 4 3 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'SCORING ENGINE',
    desc: 'Advanced telemetry-based algorithms that capture every nuance of your driving style, lap-time, and event performance.',
    stat: '99.8% UPTIME',
  },
  {
    n: '02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'GLOBAL LEADERBOARD',
    desc: 'Climb the ranks against thousands of elite drivers. Real-time standings updated after every event submission.',
    stat: 'LIVE · GLOBAL',
  },
  {
    n: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="6"  cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 15c0-2.76 2.24-5 5-5h6c2.76 0 5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'CREW CLUBS',
    desc: 'Form specialized teams, host private events, and dominate regional circuits as an organised force.',
    stat: '312 ACTIVE',
  },
  {
    n: '04',
    icon: (
      <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2l1.5 4.5H15l-3.75 2.73 1.43 4.5L9 11.2l-3.68 2.53 1.43-4.5L3 6.5h4.5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'QUEST SYSTEM',
    desc: 'Dynamic seasonal objectives and high-stakes missions designed to push your limits and reward consistency.',
    stat: 'SEASON 05',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'BUILD YOUR PROFILE',
    desc: 'Register your driver handle, link your car specs, and set your regional base of operations.',
  },
  {
    n: '02',
    title: 'JOIN OR FORM A CREW',
    desc: 'Find your club by style, region, or discipline. Compete under one banner and dominate the standings.',
  },
  {
    n: '03',
    title: 'DOMINATE THE PIT',
    desc: 'Submit challenge entries, earn quest completions, and climb the global leaderboard every season.',
  },
];

const COMMUNITY_DROPS = [
  { user: 'VRT_Ghost',     text: 'Just broke the track record at Silverstone. Season 5 meta is unreal.', pts: '+340' },
  { user: 'Apex_Predator', text: 'Club "Nismo Army" is recruiting — 10 spots left, apply fast.', pts: '+215' },
  { user: 'Shift_Queen',   text: 'Posted new lap footage from Spa. Check the braking zone at Bus Stop.', pts: '+189' },
];

// ─── Corner bracket decoration ──────────────────────────────────────────────────

function CornerBracket({ size = 40, opacity = 0.25 }: { size?: number; opacity?: number }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, opacity }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M40 0H22V4H36V18H40V0Z" fill={accent} />
        <path d="M0 40H18V36H4V22H0V40Z" fill={accent} />
      </svg>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav
      style={{
        position:        'sticky',
        top:             0,
        zIndex:          100,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '0 40px',
        height:          64,
        backgroundColor: `${black}f2`,
        backdropFilter:  'blur(24px)',
        borderBottom:    `1px solid rgba(200,255,0,0.1)`,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image
          src="/images/logo-dark.png"
          alt="REVPIT"
          width={1059}
          height={812}
          style={{
            height:    '38px',
            width:     'auto',
            objectFit: 'contain',
            display:   'block',
            filter:    'invert(1) drop-shadow(0 0 6px rgba(200,255,0,0.2))',
          }}
          priority
        />
      </Link>

      {/* Nav links */}
      <div className="rp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {(['LEADERBOARD', 'CLUBS', 'CHALLENGES', 'QUESTS', 'STORE'] as const).map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            style={{
              fontFamily:    mono,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.16em',
              color:         grey[500],
              textDecoration: 'none',
              transition:    'color 150ms ease',
              padding:       '4px 0',
              position:      'relative',
            }}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href="/sign-in"
          style={{
            fontFamily:    mono,
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '0.14em',
            color:         grey[500],
            textDecoration: 'none',
            padding:       '10px 0',
          }}
        >
          SIGN IN
        </Link>
        <Link href="/sign-up" className="cyber-btn" style={{ height: 38, padding: '0 22px', fontSize: 10 }}>
          JOIN NOW
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      style={{
        position:   'relative',
        padding:    '80px 40px 96px',
        overflow:   'hidden',
        minHeight:  '100dvh',
        display:    'flex',
        alignItems: 'center',
      }}
    >
      {/* Background */}
      <HeroImage />

      {/* Gradient vignette */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:      0,
          zIndex:     1,
          background: 'radial-gradient(ellipse 80% 100% at 30% 50%, transparent 30%, rgba(14,13,12,0.7) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Cyber grid overlay */}
      <div
        aria-hidden="true"
        className="cyber-grid-bg"
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 70%)',
          maskImage:        'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 70%)',
        }}
      />

      {/* Scan sweep */}
      <div className="scan-sweep" aria-hidden="true" style={{ zIndex: 2 }} />

      {/* Left accent bar */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        0,
          left:       40,
          width:      2,
          height:     80,
          background: `linear-gradient(180deg, ${accent}, transparent)`,
          zIndex:     3,
        }}
      />

      {/* Bottom edge line */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          height:     1,
          background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
          zIndex:     3,
        }}
      />

      <div style={{ maxWidth: 1140, margin: '0 auto', width: '100%', position: 'relative', zIndex: 4 }} className="rp-hero-grid">
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div>

          {/* Live badge */}
          <div
            style={{
              display:     'inline-flex',
              alignItems:  'center',
              gap:         8,
              border:      `1px solid rgba(200,255,0,0.25)`,
              padding:     '6px 14px',
              marginBottom: 32,
              clipPath:    'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              background:  'rgba(200,255,0,0.05)',
              animation:   'rp-slide-up 400ms ease-out both',
            }}
          >
            <span className="live-dot" />
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: accent, fontWeight: 700 }}>
              SEASON 05 · NOW LIVE
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily:    display,
              fontSize:      'clamp(56px, 7.5vw, 104px)',
              lineHeight:    0.9,
              letterSpacing: '0.02em',
              margin:        0,
              color:         white,
              animation:     'rp-slide-up 550ms ease-out both',
            }}
          >
            BUILT FOR
          </h1>
          <h1
            style={{
              fontFamily:    display,
              fontSize:      'clamp(56px, 7.5vw, 104px)',
              lineHeight:    0.9,
              letterSpacing: '0.02em',
              margin:        '0 0 6px',
              color:         accent,
              textShadow:    `0 0 60px rgba(200,255,0,0.25), 0 0 120px rgba(200,255,0,0.1)`,
              animation:     'rp-slide-up 650ms ease-out both',
            }}
          >
            THE FAST
          </h1>
          <h1
            style={{
              fontFamily:    display,
              fontSize:      'clamp(56px, 7.5vw, 104px)',
              lineHeight:    0.9,
              letterSpacing: '0.02em',
              margin:        '0 0 36px',
              color:         white,
              animation:     'rp-slide-up 750ms ease-out both',
            }}
          >
            &amp; FURIOUS
          </h1>

          <p
            style={{
              fontFamily:  body,
              fontSize:    16,
              color:       grey[500],
              lineHeight:  1.7,
              maxWidth:    420,
              marginBottom: 44,
              animation:   'rp-slide-up 850ms ease-out both',
            }}
          >
            The ultimate platform for drivers to compete, connect, and showcase
            high-performance builds. Track every millisecond. Dominate every corner.
          </p>

          <div
            style={{
              display:  'flex',
              gap:      14,
              flexWrap: 'wrap',
              animation: 'rp-slide-up 950ms ease-out both',
            }}
          >
            <Link href="/sign-up" className="cyber-btn" style={{ height: 48, padding: '0 28px', fontSize: 11 }}>
              GET STARTED →
            </Link>
            <Link href="/leaderboard" className="cyber-btn-ghost" style={{ height: 48, padding: '0 24px', fontSize: 11 }}>
              VIEW STANDINGS
            </Link>
          </div>

          {/* HUD readouts */}
          <div
            style={{
              marginTop:  52,
              display:    'flex',
              gap:        32,
              flexWrap:   'wrap',
              animation:  'rp-slide-up 1050ms ease-out both',
            }}
          >
            {[
              { label: 'SEASON',  value: '05',     highlight: false },
              { label: 'STATUS',  value: 'LIVE',   highlight: true  },
              { label: 'REGION',  value: 'GLOBAL', highlight: false },
              { label: 'TIER',    value: 'OPEN',   highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ borderLeft: `2px solid rgba(200,255,0,0.2)`, paddingLeft: 14 }}>
                <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.18em', color: grey[700], marginBottom: 3 }}>
                  {label}
                </p>
                <p style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: highlight ? accent : white, letterSpacing: '0.06em', lineHeight: 1 }}>
                  {highlight ? <><span className="live-dot" style={{ marginRight: 6 }} />{value}</> : value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: Leaderboard widget ────────────────────────────── */}
        <div
          className="cyber-card"
          style={{
            overflow:  'hidden',
            animation: 'rp-slide-up 600ms ease-out 200ms both',
          }}
        >
          {/* Widget header */}
          <div
            style={{
              padding:         '18px 22px 16px',
              borderBottom:    `1px solid rgba(200,255,0,0.1)`,
              background:      'rgba(200,255,0,0.03)',
              position:        'relative',
            }}
          >
            <CornerBracket size={32} opacity={0.3} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="live-dot" />
              <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: accent }}>
                LIVE STANDINGS
              </p>
            </div>
            <p style={{ fontFamily: display, fontSize: 22, letterSpacing: '0.06em', color: white, lineHeight: 1 }}>
              GLOBAL LEADERBOARD
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], marginTop: 4 }}>
              SEASON 05 · HIGH VOLTAGE
            </p>
          </div>

          {/* Rows */}
          {LEADERS.map((row, idx) => (
            <div
              key={row.rank}
              style={{
                display:         'flex',
                alignItems:      'center',
                padding:         '11px 22px',
                borderBottom:    `1px solid rgba(255,255,255,0.04)`,
                borderLeft:      row.gold ? `3px solid ${accent}` : '3px solid transparent',
                backgroundColor: row.gold ? `${accent}08` : 'transparent',
                animation:       `rp-slide-up 400ms ease-out ${300 + idx * 55}ms both`,
                gap:             12,
              }}
            >
              <span
                style={{
                  fontFamily:    mono,
                  fontSize:      11,
                  fontWeight:    700,
                  color:         row.gold ? accent : grey[700],
                  width:         24,
                  flexShrink:    0,
                  letterSpacing: '0.04em',
                }}
              >
                {row.rank}
              </span>

              {/* Gold crown for #1 */}
              {row.gold && (
                <svg width="12" height="12" viewBox="0 0 18 18" fill={accent} aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M2 14h14l-2-8-4 4-1-5-1 5-4-4-2 8z" />
                </svg>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: body, fontSize: 13, fontWeight: 600, color: row.gold ? white : grey[300], marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.username}
                </p>
                <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.04em', color: grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.car}
                </p>
              </div>

              <span
                style={{
                  fontFamily:    mono,
                  fontSize:      12,
                  fontWeight:    700,
                  color:         row.gold ? accent : grey[500],
                  whiteSpace:    'nowrap',
                  letterSpacing: '0.04em',
                  textShadow:    row.gold ? `0 0 12px rgba(200,255,0,0.5)` : 'none',
                  flexShrink:    0,
                }}
              >
                {row.pts}
              </span>
            </div>
          ))}

          {/* Footer */}
          <div
            style={{
              padding:        '12px 22px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/leaderboard"
              style={{
                fontFamily:    mono,
                fontSize:      9,
                letterSpacing: '0.14em',
                color:         accent,
                textDecoration: 'none',
                display:       'flex',
                alignItems:    'center',
                gap:           6,
              }}
            >
              VIEW FULL STANDINGS
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5h6M5 2l3 3-3 3" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span style={{ fontFamily: mono, fontSize: 8, color: grey[700], letterSpacing: '0.1em' }}>
              {LEADERS.length} SHOWN
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <section
      style={{
        backgroundColor: accent,
        padding:         '0',
        position:        'relative',
        overflow:        'hidden',
      }}
    >
      {/* Scanline */}
      <div className="scanline-overlay" aria-hidden="true" />

      <div
        style={{
          maxWidth:       1140,
          margin:         '0 auto',
          padding:        '0 40px',
          display:        'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          position:       'relative',
          zIndex:         1,
        }}
        className="rp-stat-grid"
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              justifyContent: 'center',
              padding:       '28px 20px',
              borderRight:   i < STATS.length - 1 ? `1px solid rgba(0,0,0,0.12)` : 'none',
              textAlign:     'center',
            }}
          >
            <span
              style={{
                fontFamily:    display,
                fontSize:      42,
                letterSpacing: '0.04em',
                color:         black,
                lineHeight:    1,
                display:       'block',
              }}
            >
              {s.value}
            </span>
            <span
              style={{
                fontFamily:    mono,
                fontSize:      9,
                fontWeight:    700,
                letterSpacing: '0.2em',
                color:         `${black}70`,
                marginTop:     4,
                display:       'block',
              }}
            >
              {s.label}
            </span>
            <span
              style={{
                fontFamily:    mono,
                fontSize:      8,
                letterSpacing: '0.12em',
                color:         `${black}45`,
                marginTop:     2,
                display:       'block',
              }}
            >
              {s.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section style={{ padding: '100px 40px', position: 'relative', backgroundColor: '#0A0908' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          width:         600,
          height:        400,
          background:    'radial-gradient(ellipse, rgba(200,255,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          maxWidth:    1140,
          margin:      '0 auto 60px',
          display:     'flex',
          alignItems:  'flex-end',
          gap:         24,
          flexWrap:    'wrap',
        }}
      >
        <div>
          <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: accent, marginBottom: 10 }}>
            PLATFORM CAPABILITIES
          </p>
          <h2
            style={{
              fontFamily:    display,
              fontSize:      'clamp(40px, 5vw, 64px)',
              letterSpacing: '0.04em',
              color:         white,
              lineHeight:    0.9,
              margin:        0,
            }}
          >
            EVERYTHING YOU
            <br />
            <span style={{ color: accent }}>NEED TO WIN</span>
          </h2>
        </div>
        <div style={{ flex: 1, minWidth: 120, height: 1, background: `linear-gradient(90deg, rgba(200,255,0,0.15), transparent)`, marginBottom: 6 }} />
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1140, margin: '0 auto' }} className="rp-features-grid">
        {FEATURES.map((f, idx) => (
          <div
            key={f.n}
            className="cyber-card"
            style={{
              padding:   '32px 28px',
              animation: `rp-slide-up 500ms ease-out ${idx * 70}ms both`,
            }}
          >
            <CornerBracket size={20} opacity={0.4} />

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <span
                style={{
                  fontFamily:    mono,
                  fontSize:      32,
                  fontWeight:    700,
                  color:         grey[700],
                  lineHeight:    1,
                  letterSpacing: '0.04em',
                  opacity:       0.5,
                }}
              >
                {f.n}
              </span>
              <div
                style={{
                  width:           46,
                  height:          46,
                  backgroundColor: `${accent}14`,
                  border:          `1px solid ${accent}35`,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  color:           accent,
                  clipPath:        'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                  flexShrink:      0,
                }}
              >
                {f.icon}
              </div>
            </div>

            <h3
              style={{
                fontFamily:    display,
                fontSize:      22,
                letterSpacing: '0.06em',
                color:         white,
                marginBottom:  10,
                lineHeight:    1.1,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontFamily: body,
                fontSize:   14,
                color:      grey[500],
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              {f.desc}
            </p>

            {/* Card footer stat */}
            <div className="cyber-sep" />
            <p
              style={{
                fontFamily:    mono,
                fontSize:      9,
                letterSpacing: '0.14em',
                color:         accent,
                marginTop:     14,
              }}
            >
              {f.stat}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section style={{ padding: '100px 40px', position: 'relative', overflow: 'hidden' }}>
      {/* Top divider */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     1,
          background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
        }}
      />

      {/* Header */}
      <div style={{ maxWidth: 1140, margin: '0 auto 64px', textAlign: 'center' }}>
        <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: accent, marginBottom: 12 }}>
          HOW IT WORKS
        </p>
        <h2
          style={{
            fontFamily:    display,
            fontSize:      'clamp(36px, 4.5vw, 58px)',
            letterSpacing: '0.04em',
            color:         white,
            lineHeight:    0.95,
            margin:        0,
          }}
        >
          THREE STEPS TO
          <br />
          <span style={{ color: accent }}>THE PODIUM</span>
        </h2>
      </div>

      {/* Steps */}
      <div
        style={{
          maxWidth:            1140,
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 2,
          position:            'relative',
        }}
      >
        {/* Connector line */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            top:        52,
            left:       '16.66%',
            right:      '16.66%',
            height:     1,
            background: `linear-gradient(90deg, ${accent}40, ${accent}20, ${accent}40)`,
            zIndex:     0,
          }}
        />

        {STEPS.map((step, idx) => (
          <div
            key={step.n}
            style={{
              position:  'relative',
              padding:   '0 32px',
              textAlign: 'center',
              zIndex:    1,
              animation: `rp-slide-up 500ms ease-out ${idx * 100}ms both`,
            }}
          >
            {/* Step number circle */}
            <div
              style={{
                width:           80,
                height:          80,
                borderRadius:    '50%',
                border:          `2px solid ${accent}40`,
                backgroundColor: `${accent}08`,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                margin:          '0 auto 28px',
                position:        'relative',
              }}
            >
              {/* Outer ring */}
              <div
                aria-hidden="true"
                style={{
                  position:     'absolute',
                  inset:        -6,
                  borderRadius: '50%',
                  border:       `1px solid ${accent}18`,
                }}
              />
              <span
                style={{
                  fontFamily:    display,
                  fontSize:      28,
                  letterSpacing: '0.06em',
                  color:         accent,
                  lineHeight:    1,
                }}
              >
                {step.n}
              </span>
            </div>

            <h3
              style={{
                fontFamily:    display,
                fontSize:      20,
                letterSpacing: '0.06em',
                color:         white,
                marginBottom:  12,
                lineHeight:    1.1,
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontFamily: body,
                fontSize:   14,
                color:      grey[500],
                lineHeight: 1.65,
                maxWidth:   260,
                margin:     '0 auto',
              }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Community preview ──────────────────────────────────────────────────────────

function CommunitySection() {
  return (
    <section
      style={{
        padding:         '100px 40px',
        backgroundColor: '#080706',
        position:        'relative',
        overflow:        'hidden',
      }}
    >
      {/* Lime ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        -100,
          right:         -100,
          width:         500,
          height:        500,
          background:    'radial-gradient(ellipse, rgba(200,255,0,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="rp-community-grid">
        {/* Left: text */}
        <div>
          <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: accent, marginBottom: 12 }}>
            THE COMMUNITY
          </p>
          <h2
            style={{
              fontFamily:    display,
              fontSize:      'clamp(40px, 5vw, 64px)',
              letterSpacing: '0.04em',
              color:         white,
              lineHeight:    0.9,
              margin:        '0 0 24px',
            }}
          >
            ENTER
            <br />
            <span style={{ color: accent }}>THE PIT</span>
          </h2>
          <p
            style={{
              fontFamily:  body,
              fontSize:    15,
              color:       grey[500],
              lineHeight:  1.7,
              maxWidth:    400,
              marginBottom: 36,
            }}
          >
            Join thousands of passionate drivers sharing lap times, build specs,
            and racing stories. The Pit is where the scene lives.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
            {['DROP A POST', 'JOIN A PIT', 'VOTE ON DROPS'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily:    mono,
                  fontSize:      9,
                  letterSpacing: '0.12em',
                  color:         grey[700],
                  border:        `1px solid rgba(255,255,255,0.08)`,
                  padding:       '5px 12px',
                  clipPath:      'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <Link href="/sign-up" className="cyber-btn" style={{ height: 46, padding: '0 26px', fontSize: 10 }}>
            JOIN THE PIT →
          </Link>
        </div>

        {/* Right: feed preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMMUNITY_DROPS.map((drop, idx) => (
            <div
              key={drop.user}
              style={{
                border:       `1px solid rgba(200,255,0,0.07)`,
                borderLeft:   `3px solid ${accent}40`,
                padding:      '14px 18px',
                background:   'rgba(255,255,255,0.02)',
                clipPath:     'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
                animation:    `rp-slide-up 500ms ease-out ${idx * 80}ms both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '0.06em' }}>
                  {drop.user}
                </span>
                <span
                  style={{
                    fontFamily:    mono,
                    fontSize:      9,
                    color:         accent,
                    letterSpacing: '0.06em',
                    background:    `${accent}10`,
                    padding:       '2px 8px',
                    border:        `1px solid ${accent}25`,
                  }}
                >
                  {drop.pts} PTS
                </span>
              </div>
              <p style={{ fontFamily: body, fontSize: 13, color: grey[500], lineHeight: 1.5, margin: 0 }}>
                {drop.text}
              </p>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4, marginTop: 4 }}>
            <div className="live-dot" />
            <span style={{ fontFamily: mono, fontSize: 8, color: grey[700], letterSpacing: '0.14em' }}>
              LIVE FEED · UPDATING NOW
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Store section ─────────────────────────────────────────────────────────────

const STORE_ITEMS = [
  {
    category: 'MERCH',
    title:    'REVPIT Drop Hoodie',
    price:    '£64',
    badge:    'NEW DROP',
    color:    accent,
    img:      null,
  },
  {
    category: 'CAR PARTS',
    title:    'Track-spec Brake Kit — 330mm',
    price:    '£220',
    badge:    'EXCLUSIVE',
    color:    '#C8FF00',
    img:      null,
  },
  {
    category: 'MERCH',
    title:    'Pit Crew Cap — Season 05',
    price:    '£28',
    badge:    null,
    color:    null,
    img:      null,
  },
];

function StoreSection() {
  return (
    <section
      style={{
        padding:         '100px 40px',
        position:        'relative',
        backgroundColor: '#0E0D0C',
        overflow:        'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           -80,
          left:          -80,
          width:         500,
          height:        500,
          background:    'radial-gradient(ellipse, rgba(200,255,0,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top divider */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     1,
          background: 'linear-gradient(90deg, transparent, rgba(200,255,0,0.3), transparent)',
        }}
      />

      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 60, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: accent, marginBottom: 10 }}>
              PIT MARKET
            </p>
            <h2
              style={{
                fontFamily:    display,
                fontSize:      'clamp(40px, 5vw, 64px)',
                letterSpacing: '0.04em',
                color:         white,
                lineHeight:    0.9,
                margin:        0,
              }}
            >
              BUY &amp; SELL
              <br />
              <span style={{ color: accent }}>LIKE A PRO</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['MERCH', 'CAR PARTS', 'EXCLUSIVE DROPS'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily:    mono,
                    fontSize:      8,
                    letterSpacing: '0.14em',
                    color:         grey[700],
                    border:        `1px solid rgba(255,255,255,0.07)`,
                    padding:       '4px 10px',
                    clipPath:      'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p style={{ fontFamily: body, fontSize: 13, color: grey[700], textAlign: 'right', maxWidth: 280, lineHeight: 1.5 }}>
              Buy and sell race-ready gear directly with the community.
              Members get access to exclusive drops.
            </p>
          </div>
        </div>

        {/* Sample cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }} className="rp-features-grid">
          {STORE_ITEMS.map((item, idx) => (
            <div
              key={item.title}
              className="cyber-card"
              style={{
                padding:   0,
                overflow:  'hidden',
                animation: `rp-slide-up 500ms ease-out ${idx * 80}ms both`,
              }}
            >
              {/* Image placeholder */}
              <div
                style={{
                  height:          160,
                  background:      'linear-gradient(135deg, #1C1B19 0%, #141312 100%)',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  borderBottom:    `1px solid rgba(200,255,0,0.06)`,
                  position:        'relative',
                  overflow:        'hidden',
                }}
              >
                {/* Grid texture */}
                <div className="cyber-grid-bg" aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

                {/* Bag icon */}
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.18 }}>
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
                  <line x1="3" y1="6" x2="21" y2="6" stroke={accent} strokeWidth="1.5" />
                  <path d="M16 10a4 4 0 01-8 0" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
                </svg>

                {/* Badge */}
                {item.badge && (
                  <span
                    style={{
                      position:      'absolute',
                      top:           12,
                      left:          12,
                      fontFamily:    mono,
                      fontSize:      7,
                      fontWeight:    700,
                      letterSpacing: '0.12em',
                      color:         black,
                      background:    accent,
                      padding:       '3px 8px',
                      clipPath:      'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '16px 18px 20px' }}>
                <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], marginBottom: 6 }}>
                  {item.category}
                </p>
                <p style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: white, lineHeight: 1.3, marginBottom: 12 }}>
                  {item.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: display, fontSize: 24, letterSpacing: '0.04em', color: accent, lineHeight: 1 }}>
                    {item.price}
                  </span>
                  <span
                    style={{
                      fontFamily:    mono,
                      fontSize:      8,
                      letterSpacing: '0.1em',
                      color:         grey[700],
                      border:        `1px solid rgba(255,255,255,0.07)`,
                      padding:       '3px 8px',
                    }}
                  >
                    VIEW ITEM →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Payment placeholder badges */}
            {['STRIPE', 'PAYPAL'].map((p) => (
              <span
                key={p}
                style={{
                  fontFamily:    mono,
                  fontSize:      8,
                  letterSpacing: '0.1em',
                  color:         grey[700],
                  border:        `1px solid rgba(255,255,255,0.08)`,
                  padding:       '5px 12px',
                  opacity:       0.6,
                }}
              >
                {p} <span style={{ opacity: 0.5 }}>· COMING SOON</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/sign-up" className="cyber-btn" style={{ height: 46, padding: '0 26px', fontSize: 10 }}>
              START SELLING →
            </Link>
            <Link href="/store" className="cyber-btn-ghost" style={{ height: 46, padding: '0 22px', fontSize: 10 }}>
              BROWSE STORE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Season CTA ────────────────────────────────────────────────────────────────

function SeasonCTA() {
  return (
    <section
      style={{
        position:   'relative',
        padding:    '120px 40px',
        overflow:   'hidden',
        textAlign:  'center',
        background: `linear-gradient(135deg, #0E0D0C 0%, #111210 50%, #0E0D0C 100%)`,
      }}
    >
      {/* Cyber grid bg */}
      <div className="cyber-grid-bg" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />

      {/* Corner brackets */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 24, left: 24, opacity: 0.2 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M0 48V28H4V44H20V48H0Z" fill={accent} />
          <path d="M0 0H20V4H4V20H0V0Z" fill={accent} />
        </svg>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 24, right: 24, opacity: 0.2 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M48 0V20H44V4H28V0H48Z" fill={accent} />
          <path d="M48 48H28V44H44V28H48V48Z" fill={accent} />
        </svg>
      </div>

      {/* Scan sweep */}
      <div className="scan-sweep" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display:     'inline-flex',
            alignItems:  'center',
            gap:         8,
            border:      `1px solid rgba(200,255,0,0.3)`,
            padding:     '6px 16px',
            marginBottom: 28,
            clipPath:    'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
            background:  'rgba(200,255,0,0.06)',
          }}
        >
          <span className="live-dot" />
          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: accent, fontWeight: 700 }}>
            SEASON 05 · HIGH VOLTAGE
          </span>
        </div>

        <h2
          style={{
            fontFamily:    display,
            fontSize:      'clamp(48px, 7vw, 96px)',
            letterSpacing: '0.04em',
            color:         white,
            lineHeight:    0.9,
            margin:        '0 0 8px',
          }}
        >
          DON&apos;T MISS THE
        </h2>
        <h2
          style={{
            fontFamily:    display,
            fontSize:      'clamp(48px, 7vw, 96px)',
            letterSpacing: '0.04em',
            color:         accent,
            lineHeight:    0.9,
            margin:        '0 0 32px',
            textShadow:    `0 0 80px rgba(200,255,0,0.3)`,
          }}
        >
          STARTING GRID
        </h2>

        <p
          style={{
            fontFamily:  body,
            fontSize:    16,
            color:       grey[500],
            lineHeight:  1.65,
            maxWidth:    480,
            margin:      '0 auto 44px',
          }}
        >
          Season 05 challenges and exclusive clubs are filling fast.
          Register now to secure your position before the field is set.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up" className="cyber-btn" style={{ height: 52, padding: '0 36px', fontSize: 12 }}>
            CREATE ACCOUNT →
          </Link>
          <Link href="/sign-in" className="cyber-btn-ghost" style={{ height: 52, padding: '0 28px', fontSize: 12 }}>
            SIGN IN
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#080706',
        borderTop:       `1px solid rgba(200,255,0,0.08)`,
      }}
    >
      {/* Main footer content */}
      <div
        style={{
          maxWidth: 1140,
          margin:   '0 auto',
          padding:  '56px 40px 40px',
          display:  'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap:      40,
        }}
        className="rp-footer-grid"
      >
        {/* Brand column */}
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginBottom: 16 }}>
            <Image
              src="/images/logo-dark.png"
              alt="REVPIT"
              width={1059}
              height={812}
              style={{
                height:    '36px',
                width:     'auto',
                objectFit: 'contain',
                display:   'block',
                filter:    'invert(1) opacity(0.7)',
              }}
            />
          </Link>
          <p
            style={{
              fontFamily: body,
              fontSize:   13,
              color:      grey[700],
              lineHeight: 1.65,
              maxWidth:   220,
              marginBottom: 20,
            }}
          >
            The ultimate motorsport platform for competitive drivers worldwide.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Instagram */}
            <a href="#" aria-label="Instagram" style={{ opacity: 0.4, transition: 'opacity 150ms ease' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="3" stroke={grey[500]} strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2.5" stroke={grey[500]} strokeWidth="1.5" />
                <circle cx="11.5" cy="4.5" r="0.75" fill={grey[500]} />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" aria-label="Twitter" style={{ opacity: 0.4, transition: 'opacity 150ms ease' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l5 5.5L2 14h2l3.5-4.5L10 14h4L8.5 8 14 2h-2L7.5 6 5.5 2H2z" stroke={grey[500]} strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" aria-label="YouTube" style={{ opacity: 0.4, transition: 'opacity 150ms ease' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="3.5" width="13" height="9" rx="2.5" stroke={grey[500]} strokeWidth="1.5" />
                <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill={grey[500]} />
              </svg>
            </a>
          </div>
        </div>

        {/* Platform links */}
        <div>
          <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.18em', color: grey[700], marginBottom: 16, textTransform: 'uppercase' }}>
            PLATFORM
          </p>
          {['Leaderboard', 'Clubs', 'Challenges', 'Quests', 'Community', 'Store'].map((link) => (
            <div key={link} style={{ marginBottom: 10 }}>
              <Link
                href={`/${link.toLowerCase()}`}
                style={{
                  fontFamily:    body,
                  fontSize:      13,
                  color:         grey[700],
                  textDecoration: 'none',
                  transition:    'color 150ms ease',
                }}
              >
                {link}
              </Link>
            </div>
          ))}
        </div>

        {/* Account links */}
        <div>
          <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.18em', color: grey[700], marginBottom: 16, textTransform: 'uppercase' }}>
            ACCOUNT
          </p>
          {[['Sign Up', '/sign-up'], ['Sign In', '/sign-in'], ['Profile', '/profile'], ['Settings', '/settings']].map(([label, href]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <Link
                href={href}
                style={{
                  fontFamily:    body,
                  fontSize:      13,
                  color:         grey[700],
                  textDecoration: 'none',
                  transition:    'color 150ms ease',
                }}
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        {/* Status */}
        <div>
          <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.18em', color: grey[700], marginBottom: 16, textTransform: 'uppercase' }}>
            STATUS
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: mono, fontSize: 9, color: accent, letterSpacing: '0.1em' }}>ALL SYSTEMS LIVE</span>
          </div>
          <div style={{ border: `1px solid rgba(200,255,0,0.12)`, padding: '12px 14px', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], marginBottom: 6 }}>
              CURRENT SEASON
            </p>
            <p style={{ fontFamily: display, fontSize: 20, color: white, letterSpacing: '0.06em', lineHeight: 1, margin: '0 0 4px' }}>
              HIGH VOLTAGE
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, color: accent, letterSpacing: '0.1em' }}>
              SEASON 05
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop:  `1px solid rgba(255,255,255,0.05)`,
          padding:    '16px 40px',
          maxWidth:   1140,
          margin:     '0 auto',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap:   'wrap',
          gap:        12,
        }}
      >
        <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.12em', color: grey[700] }}>
          © 2025 REVPIT TECHNOLOGY SYSTEMS · ALL RIGHTS RESERVED
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['PRIVACY', 'TERMS', 'CONTACT'].map((item) => (
            <Link
              key={item}
              href="#"
              style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], textDecoration: 'none' }}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight:       '100vh',
        backgroundColor: black,
        color:           white,
        display:         'flex',
        flexDirection:   'column',
      }}
    >
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <CommunitySection />
      <StoreSection />
      <SeasonCTA />
      <Footer />
    </div>
  );
}
