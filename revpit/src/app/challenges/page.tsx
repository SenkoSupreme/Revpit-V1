import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';

export const metadata = { title: 'Challenges — REVPIT' };

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

// ─── Types ────────────────────────────────────────────────────────────────────

type Challenge = {
  id:          string;
  title:       string;
  description: string | null;
  type:        string;
  points:      number;
  prize:       string | null;
  banner_url:  string | null;
  starts_at:   string;
  ends_at:     string;
  is_featured: boolean;
  entry_count: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  photo: 'PHOTO',
  track: 'TRACK',
  build: 'BUILD',
  drift: 'DRIFT',
  style: 'STYLE',
};

const TYPE_COLORS: Record<string, string> = {
  photo:  accent,
  track:  '#00F5FF',
  build:  '#FF9900',
  drift:  '#FF3C28',
  style:  '#CC88FF',
};

function timeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'ENDED';
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}D ${hours}H LEFT`;
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}H ${mins}M LEFT`;
  return `${mins}M LEFT`;
}

function isLive(c: Challenge) {
  const now = Date.now();
  return new Date(c.starts_at).getTime() <= now && new Date(c.ends_at).getTime() > now;
}

// ─── Challenge card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, featured }: { challenge: Challenge; featured?: boolean }) {
  const typeColor = TYPE_COLORS[challenge.type] ?? accent;
  const live      = isLive(challenge);
  const remaining = timeLeft(challenge.ends_at);
  const msLeft    = new Date(challenge.ends_at).getTime() - Date.now();
  const critical  = live && msLeft < 86_400_000;
  const warning   = live && !critical && msLeft < 86_400_000 * 2;
  const timerColor = critical ? '#FF3C28' : warning ? '#FF9500' : accent;

  return (
    <div
      style={{
        position:  'relative',
        background: featured
          ? `linear-gradient(135deg, #1A1918 0%, #111110 100%)`
          : `linear-gradient(135deg, #181716 0%, #111110 100%)`,
        border:    `1px solid ${featured ? `${typeColor}30` : 'rgba(255,255,255,0.07)'}`,
        clipPath:  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
        overflow:  'hidden',
        display:   'flex',
        flexDirection: 'column',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      {/* Top-right corner notch accent line */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.6 }}>
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
          <path d="M0 0L21 0L21 21" stroke={typeColor} strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>

      {/* Type + live strip */}
      <div
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '10px 16px',
          background:      `${typeColor}0e`,
          borderBottom:    `1px solid ${typeColor}22`,
        }}
      >
        {/* Type pill */}
        <span
          className="type-pill"
          style={{
            background: `${typeColor}22`,
            color:      typeColor,
          }}
        >
          <svg width="6" height="6" viewBox="0 0 6 6" fill={typeColor} aria-hidden="true">
            <polygon points="3,0 6,3 3,6 0,3" />
          </svg>
          {TYPE_LABELS[challenge.type] ?? challenge.type.toUpperCase()}
        </span>

        {live ? (
          <span
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           5,
              fontFamily:    mono,
              fontSize:      8,
              letterSpacing: '0.14em',
              color:         timerColor,
            }}
          >
            <span
              style={{
                display:         'inline-block',
                width:           5,
                height:          5,
                borderRadius:    '50%',
                backgroundColor: timerColor,
                boxShadow:       `0 0 6px ${timerColor}88`,
                animation:       critical ? 'neonPulse 1s ease-in-out infinite' : undefined,
              }}
            />
            {remaining}
          </span>
        ) : (
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.12em', color: grey[700] }}>
            ENDED
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 18px 14px', flex: 1 }}>
        {featured && (
          <div
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             5,
              backgroundColor: `${accent}18`,
              border:          `1px solid ${accent}44`,
              padding:         '3px 10px',
              marginBottom:    12,
              clipPath:        'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill={accent} aria-hidden="true">
              <path d="M4 0l.9 2.6H8L5.5 4.2l.9 2.6L4 5.2 1.6 6.8l.9-2.6L0 2.6h3.1z" />
            </svg>
            <span style={{ fontFamily: mono, fontSize: 7, letterSpacing: '0.16em', color: accent }}>FEATURED</span>
          </div>
        )}

        <h3
          style={{
            fontFamily:    display,
            fontSize:      featured ? 24 : 19,
            letterSpacing: '0.04em',
            color:         white,
            lineHeight:    1.1,
            margin:        '0 0 10px',
          }}
        >
          {challenge.title}
        </h3>

        {challenge.description && (
          <p
            style={{
              fontFamily:      body,
              fontSize:        12,
              color:           grey[500],
              lineHeight:      1.6,
              marginBottom:    14,
              display:         '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:        'hidden',
            }}
          >
            {challenge.description}
          </p>
        )}

        {challenge.prize && (
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        6,
              background: `${typeColor}0d`,
              border:     `1px solid ${typeColor}20`,
              padding:    '7px 10px',
              marginBottom: 14,
              clipPath:   'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3 1h4v4a2 2 0 01-4 0V1z" stroke={typeColor} strokeWidth="1.2" strokeLinecap="round" />
              <path d="M3 2H1.5A.5.5 0 001 2.5v.5a1.5 1.5 0 001.5 1.5M7 2h1.5a.5.5 0 01.5.5v.5A1.5 1.5 0 017 5" stroke={typeColor} strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 5.5v2M4 8h2" stroke={typeColor} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: typeColor }}>
              {challenge.prize}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '10px 18px',
          borderTop:      `1px solid rgba(255,255,255,0.05)`,
          background:     'rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
          {challenge.entry_count.toLocaleString()} {challenge.entry_count === 1 ? 'ENTRY' : 'ENTRIES'}
        </span>

        {live ? (
          <button
            style={{
              height:       30,
              padding:      '0 16px',
              background:   typeColor,
              border:       'none',
              fontFamily:   mono,
              fontSize:     9,
              fontWeight:   700,
              letterSpacing: '0.14em',
              color:        black,
              cursor:       'pointer',
              clipPath:     'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              boxShadow:    `0 0 14px ${typeColor}40`,
            }}
          >
            ENTER →
          </button>
        ) : (
          <button
            style={{
              height:    30,
              padding:   '0 16px',
              background: 'transparent',
              border:    `1px solid ${grey[700]}`,
              fontFamily: mono,
              fontSize:  9,
              letterSpacing: '0.12em',
              color:     grey[700],
              cursor:    'default',
              clipPath:  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
            }}
            disabled
          >
            VIEW RESULTS
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ChallengesPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from('challenges')
    .select('id, title, description, type, points, prize, banner_url, starts_at, ends_at, is_featured, entry_count')
    .order('is_featured', { ascending: false })
    .order('ends_at',     { ascending: true });

  const challenges = (data as Challenge[] | null) ?? [];

  const live     = challenges.filter(isLive);
  const ended    = challenges.filter((c) => !isLive(c));
  const featured = live.find((c) => c.is_featured) ?? live[0] ?? null;

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0B0B' }}>

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          background:   `linear-gradient(135deg, #0D0B0B 0%, #111110 50%, #0A0908 100%)`,
          borderBottom: `1px solid rgba(200,255,0,0.08)`,
          padding:      '44px 48px 36px',
          overflow:     'hidden',
        }}
      >
        {/* Cyber grid */}
        <div
          aria-hidden="true"
          className="cyber-grid-bg"
          style={{
            position:      'absolute',
            inset:         0,
            pointerEvents: 'none',
            opacity:       0.8,
          }}
        />
        {/* Scan sweep */}
        <div className="scan-sweep" aria-hidden="true" />
        {/* Speed streaks */}
        <div className="speed-streaks" aria-hidden="true" />
        {/* Corner bracket */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 16, opacity: 0.15 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M36 0H18V4H32V18H36V0Z" fill={accent} />
            <path d="M0 36H18V32H4V18H0V36Z" fill={accent} />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span className="live-dot" />
            <span
              style={{
                fontFamily:      mono,
                fontSize:        8,
                letterSpacing:   '0.2em',
                color:           accent,
                backgroundColor: `${accent}14`,
                border:          `1px solid ${accent}30`,
                padding:         '4px 10px',
                clipPath:        'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}
            >
              SEASON 1 · ACTIVE
            </span>
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.12em', color: grey[700] }}>
              {live.length} LIVE &nbsp;·&nbsp; {ended.length} ENDED
            </span>
          </div>

          <h1
            style={{
              fontFamily:    display,
              fontSize:      56,
              letterSpacing: '0.03em',
              color:         white,
              lineHeight:    0.93,
              margin:        '0 0 14px',
              textShadow:    '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            CHALLENGES
          </h1>
          <p
            style={{
              fontFamily: body,
              fontSize:   14,
              color:      grey[500],
              marginTop:  0,
              maxWidth:   480,
              lineHeight: 1.6,
            }}
          >
            Compete against the community. Submit your build, lap time, or shot —
            the top entry wins REV POINTS and an exclusive badge.
          </p>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          borderBottom: `1px solid rgba(200,255,0,0.06)`,
          background:   '#0F0E0C',
        }}
      >
        {[
          { label: 'LIVE NOW',        value: String(live.length),  accent: true },
          { label: 'TOTAL ENTRIES',   value: String(challenges.reduce((s, c) => s + c.entry_count, 0)) },
          { label: 'CHALLENGE TYPES', value: '5' },
          { label: 'SEASON',          value: '01' },
        ].map(({ label, value, accent: isAccent }, i, arr) => (
          <div
            key={label}
            style={{
              flex:        1,
              padding:     '18px 24px',
              borderRight: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
              textAlign:   'center',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 8, color: grey[700], letterSpacing: '0.16em', marginBottom: 5 }}>
              {label}
            </p>
            <p
              style={{
                fontFamily:  mono,
                fontSize:    24,
                fontWeight:  700,
                color:       isAccent ? accent : white,
                lineHeight:  1,
                letterSpacing: '0.04em',
                textShadow:  isAccent ? '0 0 20px rgba(200,255,0,0.4)' : 'none',
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ padding: '40px 48px 64px' }}>

        {/* ── Featured challenge ────────────────────────────────────────────── */}
        {featured && (
          <div style={{ marginBottom: 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill={accent} aria-hidden="true">
                <path d="M5 0l1.1 3.4H9.5L6.7 5.5l1.1 3.4L5 6.8l-2.8 2.1 1.1-3.4L.5 3.4H3.9z" />
              </svg>
              <span style={{ fontFamily: display, fontSize: 14, letterSpacing: '0.12em', color: accent }}>
                FEATURED CHALLENGE
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(200,255,0,0.2), transparent)` }} />
            </div>
            <div style={{ maxWidth: 660 }}>
              <ChallengeCard challenge={featured} featured />
            </div>
          </div>
        )}

        {/* ── Live challenges ───────────────────────────────────────────────── */}
        {live.length > 0 && (
          <section style={{ marginBottom: 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <span className="live-dot" />
              <span style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.08em', color: white, lineHeight: 1 }}>
                LIVE NOW
              </span>
              <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.08em' }}>
                {live.length}
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(255,255,255,0.08), transparent)` }} />
            </div>

            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap:                 18,
              }}
            >
              {live.map((c, idx) => (
                <div key={c.id} style={{ animation: `rp-slide-up 400ms ease-out ${idx * 60}ms both` }}>
                  <ChallengeCard challenge={c} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── No live challenges ────────────────────────────────────────────── */}
        {live.length === 0 && (
          <div
            style={{
              textAlign:   'center',
              padding:     '72px 24px',
              border:      `1px dashed ${grey[700]}`,
              clipPath:    'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
              marginBottom: 40,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 16, opacity: 0.25 }} aria-hidden="true">
              <path d="M14 6h12v14a6 6 0 01-12 0V6z" stroke={white} strokeWidth="2" strokeLinecap="round" />
              <path d="M14 9H9a2 2 0 00-2 2v2a5 5 0 005 5M26 9h5a2 2 0 012 2v2a5 5 0 01-5 5" stroke={white} strokeWidth="2" strokeLinecap="round" />
              <path d="M20 26v5M16 33h8" stroke={white} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: display, fontSize: 24, letterSpacing: '0.06em', color: grey[700], marginBottom: 8, lineHeight: 1 }}>
              NO ACTIVE CHALLENGES
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em' }}>
              NEW CHALLENGES DROP WEEKLY — CHECK BACK SOON
            </p>
          </div>
        )}

        {/* ── Past challenges ───────────────────────────────────────────────── */}
        {ended.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <span style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.08em', color: grey[500], lineHeight: 1 }}>
                PAST CHALLENGES
              </span>
              <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.08em' }}>{ended.length}</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(255,255,255,0.06), transparent)` }} />
            </div>
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap:                 18,
                opacity:             0.55,
              }}
            >
              {ended.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
