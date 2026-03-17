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
    { label: 'SCORE',        value: profile.score.toLocaleString(),                          color: accent },
    { label: 'RANK',         value: profile.global_rank != null ? `#${profile.global_rank}` : '—', color: white },
    { label: 'QUESTS DONE',  value: String(profile.quest_completions ?? 0),                  color: white },
    { label: 'COMMUNITY XP', value: (profile.community_score ?? 0).toLocaleString(),         color: white },
    { label: 'FOLLOWERS',    value: (profile.social_followers ?? 0).toLocaleString(),        color: white },
    { label: 'CLUB ACTIVITY',value: String(profile.club_activity ?? 0),                     color: white },
  ];

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* ── Cyber hero banner ───────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          background:   `linear-gradient(135deg, #0E0D0C 0%, #111110 50%, #0A0908 100%)`,
          borderBottom: `1px solid rgba(200,255,0,0.08)`,
          padding:      '40px 48px 36px',
          overflow:     'hidden',
        }}
      >
        {/* Cyber grid */}
        <div
          aria-hidden="true"
          className="cyber-grid-bg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }}
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

        {/* Scan sweep */}
        <div className="scan-sweep" aria-hidden="true" />

        {/* Corner bracket */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 48, opacity: 0.15 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M40 0H20V4H36V20H40V0Z" fill={accent} />
            <path d="M0 40H20V36H4V20H0V40Z" fill={accent} />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap' }}>

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
                whiteSpace:      'nowrap',
                clipPath:        'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
              }}
            >
              {tier.toUpperCase()}
            </div>
          </div>

          {/* Name + bio */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: grey[700] }}>PILOT PROFILE</span>
            </div>
            <h1
              style={{
                fontFamily:    display,
                fontSize:      'clamp(32px, 4vw, 48px)',
                letterSpacing: '0.04em',
                color:         white,
                lineHeight:    1,
                margin:        0,
              }}
            >
              {profile.username}
            </h1>
            {profile.bio && (
              <p style={{ fontFamily: body, fontSize: 14, color: grey[500], marginTop: 8, lineHeight: 1.5, maxWidth: 520 }}>
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
            <Link href="/settings" className="cyber-btn-ghost" style={{ height: 30, padding: '0 16px', fontSize: 9 }}>
              EDIT PROFILE
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          borderBottom:        `1px solid rgba(200,255,0,0.06)`,
          background:          '#0F0E0C',
        }}
      >
        {stats.map(({ label, value, color }, i) => (
          <div
            key={label}
            style={{
              padding:     '20px 24px',
              borderRight: i < stats.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
              textAlign:   'center',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em', marginBottom: 6 }}>
              {label}
            </p>
            <p
              className={label === 'SCORE' ? 'score-pulse' : undefined}
              style={{
                fontFamily:  mono,
                fontSize:    20,
                fontWeight:  700,
                color,
                lineHeight:  1,
                textShadow:  label === 'SCORE' ? '0 0 16px rgba(200,255,0,0.35)' : 'none',
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0 }}>

        {/* Left: Activity feed placeholder */}
        <div style={{ padding: '32px 48px', borderRight: `1px solid rgba(255,255,255,0.06)` }}>
          <div className="section-header-line" style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.06em', color: white, margin: 0, lineHeight: 1 }}>
              RECENT ACTIVITY
            </h2>
          </div>
          <div
            style={{
              padding:      '40px 24px',
              textAlign:    'center',
              border:       `1px dashed ${grey[700]}`,
              clipPath:     'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.1em' }}>
              NO ACTIVITY YET — COMPLETE QUESTS AND DROP POSTS TO GET STARTED
            </p>
          </div>
        </div>

        {/* Right: Car card + community score */}
        <div style={{ padding: '32px 24px' }}>

          {/* Car card */}
          {car ? (
            <div
              className="cyber-card"
              style={{ padding: '20px 22px', marginBottom: 16 }}
            >
              <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', color: grey[700], marginBottom: 14 }}>
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
                  <div className="cyber-sep" style={{ margin: '14px 0' }} />
                  <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], marginBottom: 6 }}>MODS</p>
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
                  color:          accent,
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
                padding:      '24px',
                textAlign:    'center',
                marginBottom: 16,
                clipPath:     'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
              }}
            >
              <p style={{ fontFamily: mono, fontSize: 10, color: grey[700], letterSpacing: '0.08em', marginBottom: 12 }}>
                NO CAR ADDED YET
              </p>
              <Link
                href="/settings#car"
                style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: accent, textDecoration: 'none' }}
              >
                + ADD YOUR CAR
              </Link>
            </div>
          )}

          {/* Community score card */}
          <div className="cyber-card" style={{ padding: '20px 22px' }}>
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', color: grey[700], marginBottom: 14 }}>
              COMMUNITY SCORE
            </p>
            <p
              style={{
                fontFamily: display,
                fontSize:   36,
                letterSpacing: '0.04em',
                color:      accent,
                lineHeight: 1,
                textShadow: '0 0 20px rgba(200,255,0,0.3)',
              }}
            >
              {(profile.community_score ?? 0).toLocaleString()}
            </p>
            <div className="cyber-sep" style={{ margin: '12px 0 10px' }} />
            <p style={{ fontFamily: body, fontSize: 11, color: grey[700] }}>
              Earned from drops, replies, and votes
            </p>
          </div>

        </div>
      </div>
    </div>
    </PageTransition>
  );
}
