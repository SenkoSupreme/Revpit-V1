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
  photo:  'PHOTO',
  track:  'TRACK',
  build:  'BUILD',
  drift:  'DRIFT',
  style:  'STYLE',
};

const TYPE_COLORS: Record<string, string> = {
  photo:  accent,
  track:  '#00d4ff',
  build:  '#ff9900',
  drift:  '#ff4466',
  style:  '#cc88ff',
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
  const urgent    = live && msLeft < 86_400_000 * 3;
  const critcal   = live && msLeft < 86_400_000;       // < 24h
  const warning   = live && !critcal && msLeft < 86_400_000 * 2; // < 48h

  return (
    <div
      style={{
        position:        'relative',
        backgroundColor: grey[900],
        border:          `1px solid ${featured ? `${accent}40` : 'rgba(255,255,255,0.07)'}`,
        borderRadius:    6,
        overflow:        'hidden',
        display:         'flex',
        flexDirection:   'column',
      }}
    >
      {/* Type + live strip */}
      <div
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '10px 16px',
          backgroundColor: `${typeColor}12`,
          borderBottom:    `1px solid ${typeColor}28`,
        }}
      >
        <span
          style={{
            fontFamily:    mono,
            fontSize:      9,
            letterSpacing: '0.14em',
            color:         typeColor,
          }}
        >
          {TYPE_LABELS[challenge.type] ?? challenge.type.toUpperCase()} CHALLENGE
        </span>
        {live && (
          <span
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             5,
              fontFamily:      mono,
              fontSize:        8,
              letterSpacing:   '0.12em',
              color:           critcal ? '#FF3C28' : warning ? '#FF9500' : accent,
            }}
          >
            <span
              style={{
                display:         'inline-block',
                width:           5,
                height:          5,
                borderRadius:    '50%',
                backgroundColor: critcal ? '#FF3C28' : warning ? '#FF9500' : accent,
              }}
            />
            {remaining}
          </span>
        )}
        {!live && (
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.1em', color: grey[700] }}>
            ENDED
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 18px 14px', flex: 1 }}>
        {featured && (
          <div
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             5,
              backgroundColor: `${accent}18`,
              border:          `1px solid ${accent}44`,
              borderRadius:    2,
              padding:         '3px 8px',
              marginBottom:    10,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill={accent} aria-hidden="true">
              <path d="M4 0l.9 2.6H8L5.5 4.2l.9 2.6L4 5.2 1.6 6.8l.9-2.6L0 2.6h3.1z" />
            </svg>
            <span style={{ fontFamily: mono, fontSize: 7, letterSpacing: '0.14em', color: accent }}>FEATURED</span>
          </div>
        )}

        <h3
          style={{
            fontFamily:    display,
            fontSize:      featured ? 22 : 18,
            letterSpacing: '0.04em',
            color:         white,
            lineHeight:    1.1,
            margin:        '0 0 8px',
          }}
        >
          {challenge.title}
        </h3>

        {challenge.description && (
          <p
            style={{
              fontFamily:  body,
              fontSize:    12,
              color:       grey[500],
              lineHeight:  1.55,
              marginBottom: 14,
              display:     '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:    'hidden',
            }}
          >
            {challenge.description}
          </p>
        )}

        {challenge.prize && (
          <div
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             6,
              backgroundColor: `${typeColor}0e`,
              border:          `1px solid ${typeColor}22`,
              borderRadius:    3,
              padding:         '7px 10px',
              marginBottom:    14,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3 1h4v4a2 2 0 01-4 0V1z" stroke={typeColor} strokeWidth="1.2" strokeLinecap="round" />
              <path d="M3 2H1.5A.5.5 0 001 2.5v.5a1.5 1.5 0 001.5 1.5M7 2h1.5a.5.5 0 01.5.5v.5A1.5 1.5 0 017 5" stroke={typeColor} strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 5.5v2M4 8h2" stroke={typeColor} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.08em', color: typeColor }}>
              {challenge.prize}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          padding:      '10px 18px',
          borderTop:    `1px solid rgba(255,255,255,0.05)`,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.08em' }}>
          {challenge.entry_count} {challenge.entry_count === 1 ? 'ENTRY' : 'ENTRIES'}
        </span>
        {live ? (
          <button
            style={{
              height:          28,
              padding:         '0 14px',
              backgroundColor: typeColor,
              border:          'none',
              borderRadius:    3,
              fontFamily:      mono,
              fontSize:        9,
              fontWeight:      700,
              letterSpacing:   '0.12em',
              color:           typeColor === accent ? black : black,
              cursor:          'pointer',
            }}
          >
            ENTER →
          </button>
        ) : (
          <button
            style={{
              height:          28,
              padding:         '0 14px',
              backgroundColor: 'transparent',
              border:          `1px solid ${grey[700]}`,
              borderRadius:    3,
              fontFamily:      mono,
              fontSize:        9,
              letterSpacing:   '0.12em',
              color:           grey[700],
              cursor:          'default',
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

  const live    = challenges.filter(isLive);
  const ended   = challenges.filter((c) => !isLive(c));
  const featured = live.find((c) => c.is_featured) ?? live[0] ?? null;

  const types = ['all', 'photo', 'track', 'build', 'drift', 'style'] as const;

  return (
    <PageTransition>
    <div
      className="page-red-accent"
      style={{ minHeight: '100vh', backgroundColor: '#0D0B0B' } as React.CSSProperties}
    >

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          background:   `linear-gradient(135deg, #111108 0%, ${grey[900]} 100%)`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          padding:      '40px 48px 36px',
          overflow:     'hidden',
        }}
      >
        {/* Grid dot texture */}
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            inset:           0,
            backgroundImage: `radial-gradient(circle, rgba(200,255,0,0.05) 1px, transparent 1px)`,
            backgroundSize:  '28px 28px',
            pointerEvents:   'none',
          }}
        />
        {/* Corner bracket — top right */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 20, right: 20, opacity: 0.15 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M32 0H16V4H28V16H32V0Z" fill={accent} />
            <path d="M0 32H16V28H4V16H0V32Z" fill={accent} />
          </svg>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span
              style={{
                fontFamily:      mono,
                fontSize:        9,
                letterSpacing:   '0.16em',
                color:           accent,
                backgroundColor: `${accent}14`,
                border:          `1px solid ${accent}30`,
                padding:         '4px 10px',
                borderRadius:    2,
              }}
            >
              SEASON 1 · ACTIVE
            </span>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700] }}>
              {live.length} LIVE &nbsp;·&nbsp; {ended.length} ENDED
            </span>
          </div>

          <h1
            style={{
              fontFamily:    display,
              fontSize:      52,
              letterSpacing: '0.03em',
              color:         white,
              lineHeight:    0.95,
              margin:        0,
            }}
          >
            CHALLENGES
          </h1>
          <p
            style={{
              fontFamily:  body,
              fontSize:    14,
              color:       grey[500],
              marginTop:   12,
              maxWidth:    480,
              lineHeight:  1.55,
            }}
          >
            Compete against the community. Submit your build, lap time, or shot —
            the top entry wins REV POINTS and an exclusive badge.
          </p>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
        }}
      >
        {[
          { label: 'LIVE NOW',       value: String(live.length)         },
          { label: 'TOTAL ENTRIES',  value: String(challenges.reduce((s, c) => s + c.entry_count, 0)) },
          { label: 'CHALLENGE TYPES',value: '5'                         },
          { label: 'SEASON',         value: '01'                        },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            style={{
              flex:        1,
              padding:     '16px 24px',
              borderRight: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.06)` : 'none',
              textAlign:   'center',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em', marginBottom: 4 }}>
              {label}
            </p>
            <p style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: white, lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ padding: '36px 48px 60px' }}>

        {/* ── Featured challenge ──────────────────────────────────────────── */}
        {featured && (
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                marginBottom: 16,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill={accent} aria-hidden="true">
                <path d="M5 0l1.1 3.4H9.5L6.7 5.5l1.1 3.4L5 6.8l-2.8 2.1 1.1-3.4L.5 3.4H3.9z" />
              </svg>
              <h2 style={{ fontFamily: display, fontSize: 14, letterSpacing: '0.1em', color: accent, margin: 0, lineHeight: 1 }}>
                FEATURED CHALLENGE
              </h2>
            </div>
            <div style={{ maxWidth: 640 }}>
              <ChallengeCard challenge={featured} featured />
            </div>
          </div>
        )}

        {/* ── Live challenges ─────────────────────────────────────────────── */}
        {live.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           12,
                marginBottom:  20,
              }}
            >
              <span
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             5,
                  fontFamily:      display,
                  fontSize:        18,
                  letterSpacing:   '0.06em',
                  color:           white,
                  lineHeight:      1,
                }}
              >
                <span
                  style={{
                    display:         'inline-block',
                    width:           6,
                    height:          6,
                    borderRadius:    '50%',
                    backgroundColor: accent,
                  }}
                />
                LIVE NOW
              </span>
              <span style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.06em' }}>
                {live.length}
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: grey[900] }} />
            </div>

            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap:                 16,
              }}
            >
              {live.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          </section>
        )}

        {/* ── No live challenges ──────────────────────────────────────────── */}
        {live.length === 0 && (
          <div
            style={{
              textAlign:       'center',
              padding:         '72px 24px',
              border:          `1px dashed ${grey[700]}`,
              borderRadius:    6,
              marginBottom:    40,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 16, opacity: 0.3 }} aria-hidden="true">
              <path d="M14 6h12v14a6 6 0 01-12 0V6z" stroke={white} strokeWidth="2" strokeLinecap="round" />
              <path d="M14 9H9a2 2 0 00-2 2v2a5 5 0 005 5M26 9h5a2 2 0 012 2v2a5 5 0 01-5 5" stroke={white} strokeWidth="2" strokeLinecap="round" />
              <path d="M20 26v5M16 33h8" stroke={white} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: display, fontSize: 22, letterSpacing: '0.06em', color: grey[700], marginBottom: 8, lineHeight: 1 }}>
              NO ACTIVE CHALLENGES
            </p>
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.08em' }}>
              NEW CHALLENGES DROP WEEKLY — CHECK BACK SOON
            </p>
          </div>
        )}

        {/* ── Past challenges ─────────────────────────────────────────────── */}
        {ended.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.06em', color: grey[500], lineHeight: 1 }}>
                PAST CHALLENGES
              </span>
              <span style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.06em' }}>{ended.length}</span>
              <div style={{ flex: 1, height: 1, backgroundColor: grey[900] }} />
            </div>
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap:                 16,
                opacity:             0.6,
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
