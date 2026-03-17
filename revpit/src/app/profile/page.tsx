import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import type { Tier } from '@/lib/scoring';
import { PageTransition } from '@/components/layout/page-transition';

export const metadata = { title: 'Profile — REVPIT' };

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

const TIER_COLOR: Record<Tier, string> = {
  starter:  grey[500],
  advanced: grey[300],
  pro:      white,
  elite:    accent,
};

const TIER_BG: Record<Tier, string> = {
  starter:  `${grey[500]}22`,
  advanced: `${grey[300]}22`,
  pro:      `${white}18`,
  elite:    `${accent}22`,
};

function ProfileGauge({ value }: { value: number }) {
  const r    = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 86, height: 86, flexShrink: 0 }}>
      <svg width="86" height="86" viewBox="0 0 86 86" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx="43" cy="43" r={r} fill="none" stroke={grey[700]} strokeWidth="6" />
        <circle
          cx="43" cy="43" r={r}
          fill="none"
          stroke={accent}
          strokeWidth="6"
          strokeDasharray={`${(value / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: white, lineHeight: 1 }}>{value}%</span>
        <span style={{ fontFamily: mono, fontSize: 8, color: grey[700], letterSpacing: '0.08em', marginTop: 2 }}>PROFILE</span>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('id, username, bio, avatar_url, instagram_handle, social_followers, quest_completions, club_activity, global_rank, profile_completion, score, tier, community_score')
    .eq('clerk_id', userId)
    .single<{
      id:                 string;
      username:           string;
      bio:                string | null;
      avatar_url:         string | null;
      instagram_handle:   string | null;
      social_followers:   number;
      quest_completions:  number;
      club_activity:      number;
      global_rank:        number | null;
      profile_completion: number;
      score:              number;
      tier:               string;
      community_score:    number | null;
    }>();

  if (!profile) redirect('/onboarding');

  const { data: car } = await admin
    .from('cars')
    .select('make, model, year, mods')
    .eq('user_id', profile.id)
    .maybeSingle<{ make: string; model: string; year: number; mods: string | null }>();

  const tier      = (profile.tier ?? 'starter') as Tier;
  const initials  = profile.username.slice(0, 2).toUpperCase();
  const tierColor = TIER_COLOR[tier];
  const tierBg    = TIER_BG[tier];

  const stats = [
    { label: 'SCORE',        value: profile.score.toLocaleString(),                          color: accent  },
    { label: 'RANK',         value: profile.global_rank != null ? `#${profile.global_rank}` : '—', color: white  },
    { label: 'QUESTS DONE',  value: String(profile.quest_completions ?? 0),                  color: white  },
    { label: 'COMMUNITY XP', value: (profile.community_score ?? 0).toLocaleString(),         color: white  },
    { label: 'FOLLOWERS',    value: (profile.social_followers ?? 0).toLocaleString(),         color: white  },
    { label: 'CLUB ACTIVITY',value: String(profile.club_activity ?? 0),                      color: white  },
  ];

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position:   'relative',
          background: `linear-gradient(135deg, #0E0D0C 0%, #1C1B19 50%, #0E0D0C 100%)`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          padding:    '40px 48px 32px',
          overflow:   'hidden',
        }}
      >
        {/* Grid dots */}
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            inset:           0,
            backgroundImage: `radial-gradient(circle, rgba(200,255,0,0.06) 1px, transparent 1px)`,
            backgroundSize:  '28px 28px',
            pointerEvents:   'none',
          }}
        />

        {/* Speed streaks */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 160"
          preserveAspectRatio="xMaxYMid meet"
          style={{ position: 'absolute', right: 0, top: 0, width: '60%', height: '100%', pointerEvents: 'none', opacity: 0.04 }}
        >
          {([
            { y: 14,  len: 220, w: 2   },
            { y: 30,  len: 140, w: 1   },
            { y: 46,  len: 300, w: 2.5 },
            { y: 60,  len: 100, w: 1   },
            { y: 76,  len: 250, w: 2   },
            { y: 90,  len: 80,  w: 1   },
            { y: 106, len: 190, w: 1.5 },
            { y: 120, len: 120, w: 1   },
            { y: 136, len: 210, w: 2   },
            { y: 150, len: 160, w: 1   },
          ] as { y: number; len: number; w: number }[]).map(({ y, len, w }, i) => (
            <line key={i} x1={600 - len} y1={y} x2={600} y2={y} stroke="#C8FF00" strokeWidth={w} />
          ))}
        </svg>

        {/* Scan line sweep */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            left:       0,
            right:      0,
            top:        0,
            height:     2,
            background: 'linear-gradient(90deg, transparent 0%, rgba(200,255,0,0.15) 50%, transparent 100%)',
            animation:  'rp-scanline 4s linear infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className={tier === 'elite' ? 'avatar-glow-gold' : 'avatar-glow'}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                className={tier === 'elite' ? 'avatar-glow-gold' : 'avatar-glow'}
                style={{
                  width:           88,
                  height:          88,
                  borderRadius:    '50%',
                  backgroundColor: `${accent}18`,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontFamily:      display,
                  fontSize:        32,
                  color:           tier === 'elite' ? '#D4A500' : accent,
                  letterSpacing:   '0.04em',
                }}
              >
                {initials}
              </div>
            )}
            {/* Tier badge */}
            <div
              style={{
                position:        'absolute',
                bottom:          -6,
                left:            '50%',
                transform:       'translateX(-50%)',
                backgroundColor: tierBg,
                border:          `1px solid ${tierColor}44`,
                color:           tierColor,
                fontFamily:      mono,
                fontSize:        8,
                letterSpacing:   '0.12em',
                padding:         '3px 8px',
                borderRadius:    2,
                whiteSpace:      'nowrap',
              }}
            >
              {tier.toUpperCase()}
            </div>
          </div>

          {/* Name + bio */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
            <h1
              style={{
                fontFamily:    display,
                fontSize:      38,
                letterSpacing: '0.04em',
                color:         white,
                lineHeight:    1,
                margin:        0,
              }}
            >
              {profile.username}
            </h1>
            {profile.bio && (
              <p
                style={{
                  fontFamily: body,
                  fontSize:   14,
                  color:      grey[500],
                  marginTop:  8,
                  lineHeight: 1.5,
                  maxWidth:   520,
                }}
              >
                {profile.bio}
              </p>
            )}
            {profile.instagram_handle && (
              <p style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.08em', marginTop: 8 }}>
                @{profile.instagram_handle}
              </p>
            )}
          </div>

          {/* Profile gauge + edit */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <ProfileGauge value={profile.profile_completion ?? 0} />
            <Link
              href="/settings"
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                height:          30,
                padding:         '0 16px',
                border:          `1px solid ${grey[700]}`,
                borderRadius:    3,
                fontFamily:      mono,
                fontSize:        9,
                letterSpacing:   '0.12em',
                color:           grey[500],
                textDecoration:  'none',
              }}
            >
              EDIT PROFILE
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          borderBottom:        `1px solid rgba(255,255,255,0.06)`,
        }}
      >
        {stats.map(({ label, value, color }, i) => (
          <div
            key={label}
            style={{
              padding:     '20px 24px',
              borderRight: i < stats.length - 1 ? `1px solid rgba(255,255,255,0.06)` : 'none',
              textAlign:   'center',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em', marginBottom: 6 }}>
              {label}
            </p>
            <p
              className={label === 'SCORE' ? 'score-pulse' : undefined}
              style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0 }}>

        {/* Left: Activity feed placeholder */}
        <div style={{ padding: '32px 48px', borderRight: `1px solid rgba(255,255,255,0.06)` }}>
          <h2
            style={{
              fontFamily:    display,
              fontSize:      18,
              letterSpacing: '0.06em',
              color:         white,
              marginBottom:  20,
              lineHeight:    1,
            }}
          >
            RECENT ACTIVITY
          </h2>
          <div
            style={{
              padding:      '40px 0',
              textAlign:    'center',
              fontFamily:   mono,
              fontSize:     11,
              color:        grey[700],
              letterSpacing:'0.08em',
            }}
          >
            No activity yet. Start completing quests and dropping posts.
          </div>
        </div>

        {/* Right: Car card + Instagram */}
        <div style={{ padding: '32px 24px' }}>

          {/* Car card */}
          {car ? (
            <div
              style={{
                border:       `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 6,
                padding:      '20px 22px',
                marginBottom: 20,
              }}
            >
              <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: grey[700], marginBottom: 14 }}>
                PRIMARY CAR
              </p>
              <p
                style={{
                  fontFamily:    display,
                  fontSize:      22,
                  letterSpacing: '0.04em',
                  color:         white,
                  lineHeight:    1,
                  marginBottom:  4,
                }}
              >
                {car.year} {car.make}
              </p>
              <p style={{ fontFamily: body, fontSize: 14, color: grey[500], marginBottom: car.mods ? 16 : 0 }}>
                {car.model}
              </p>
              {car.mods && (
                <>
                  <div style={{ height: 1, backgroundColor: `rgba(255,255,255,0.06)`, margin: '14px 0' }} />
                  <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], marginBottom: 6 }}>MODS</p>
                  <p style={{ fontFamily: body, fontSize: 12, color: grey[500], lineHeight: 1.6 }}>{car.mods}</p>
                </>
              )}
              <Link
                href="/settings#car"
                style={{
                  display:        'block',
                  marginTop:      16,
                  fontFamily:     mono,
                  fontSize:       9,
                  letterSpacing:  '0.1em',
                  color:          grey[700],
                  textDecoration: 'none',
                  textAlign:      'right',
                }}
              >
                EDIT CAR →
              </Link>
            </div>
          ) : (
            <div
              style={{
                border:       `1px dashed ${grey[700]}`,
                borderRadius: 6,
                padding:      '24px',
                textAlign:    'center',
                marginBottom: 20,
              }}
            >
              <p style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.08em', marginBottom: 12 }}>
                NO CAR ADDED YET
              </p>
              <Link
                href="/settings#car"
                style={{
                  fontFamily:    mono,
                  fontSize:      9,
                  letterSpacing: '0.12em',
                  color:         accent,
                  textDecoration:'none',
                }}
              >
                + ADD YOUR CAR
              </Link>
            </div>
          )}

          {/* Community score card */}
          <div
            style={{
              border:       `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 6,
              padding:      '20px 22px',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: grey[700], marginBottom: 14 }}>
              COMMUNITY SCORE
            </p>
            <p style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1 }}>
              {(profile.community_score ?? 0).toLocaleString()}
            </p>
            <p style={{ fontFamily: body, fontSize: 11, color: grey[700], marginTop: 6 }}>
              Earned from drops, replies, and votes
            </p>
          </div>

        </div>
      </div>
    </div>
    </PageTransition>
  );
}
