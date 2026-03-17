import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateScore } from '@/lib/scoring';
import { LeaderboardTable } from '@/components/leaderboard-table';
import type { LeaderboardRow } from '@/components/leaderboard-table';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';

// ─── Types ────────────────────────────────────────────────────────────────────

type RawProfile = {
  id:                string;
  username:          string;
  avatar_url:        string | null;
  social_followers:  number;
  quest_completions: number;
  club_activity:     number;
  score:             number;
  tier:              string;
  global_rank?:      number | null;
  community_score?:  number | null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: 'Leaderboard — REVPIT' };

export default async function LeaderboardPage() {
  const { black, white, grey, accent } = tokens.colors;
  const { display, body, mono }        = tokens.fonts;

  const { userId } = await auth();
  const supabase   = createAdminClient();

  const [{ data: profiles }, { data: currentProfile }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, avatar_url, social_followers, quest_completions, club_activity, score, tier')
      .limit(100),
    userId
      ? supabase
          .from('profiles')
          .select('username, social_followers, quest_completions, club_activity, score, tier, global_rank')
          .eq('clerk_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows: LeaderboardRow[] = (profiles as RawProfile[] ?? [])
    .map((p) => {
      const dbScore = p.score ?? 0;
      const { score: calcScore, tier: calcTier } = calculateScore({
        carSpecCompleteness: 50,
        socialFollowers:     p.social_followers  ?? 0,
        questCompletions:    p.quest_completions ?? 0,
        clubActivity:        p.club_activity     ?? 0,
        communityScore:      p.community_score   ?? 0,
      });
      return {
        rank:         0,
        id:           p.id,
        username:     p.username,
        handle:       p.username.toLowerCase().replace(/\s+/g, '_'),
        avatarLetter: p.username?.[0] ?? '?',
        carName:      '—',
        score:        dbScore || calcScore,
        tier:         (p.tier as import('@/lib/scoring').Tier) || calcTier,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  const cp = currentProfile as RawProfile | null;
  const myScore = cp
    ? (() => {
        const dbScore = cp.score ?? 0;
        const { score: calcScore, tier: calcTier } = calculateScore({
          carSpecCompleteness: 50,
          socialFollowers:     cp.social_followers  ?? 0,
          questCompletions:    cp.quest_completions ?? 0,
          clubActivity:        cp.club_activity     ?? 0,
          communityScore:      cp.community_score   ?? 0,
        });
        return { score: dbScore || calcScore, tier: (cp.tier as import('@/lib/scoring').Tier) || calcTier };
      })()
    : null;

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black, position: 'relative' }}>

      {/* Sports car silhouette watermark — fixed, right-bottom, opacity 0.025 */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          right:         0,
          bottom:        0,
          width:         500,
          pointerEvents: 'none',
          zIndex:        0,
          opacity:       0.025,
        }}
      >
        <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
          {/* Car body */}
          <path
            d="M0,165 L0,140 L35,118 L75,82
               Q115,48 175,36
               Q240,24 305,34
               Q355,42 395,68
               L435,92 L468,118 L480,135 L480,158
               Q462,175 415,178 Q368,178 348,158
               L158,158
               Q138,175 95,178 Q52,178 30,162 Z"
            fill="#C8FF00"
          />
          {/* Front wheel arch cutout + wheel */}
          <circle cx="105" cy="162" r="30" fill="#C8FF00" />
          <circle cx="105" cy="162" r="16" fill="#0E0D0C" />
          {/* Rear wheel arch cutout + wheel */}
          <circle cx="385" cy="162" r="30" fill="#C8FF00" />
          <circle cx="385" cy="162" r="16" fill="#0E0D0C" />
          {/* Windshield */}
          <path
            d="M175,80 Q192,46 218,40 L272,34 L276,72 Z"
            fill="#0E0D0C"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: `1px solid ${grey[700]}`,
          padding: '48px 48px 40px',
          backgroundImage: `radial-gradient(circle, ${grey[700]}33 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      >
        <div style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 11h4V3H5v8z" fill={accent} />
              <path d="M1.5 5.5L3 7l-1.5 1.5M12.5 5.5L11 7l1.5 1.5" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase' }}>
              LIVE STANDINGS
            </span>
          </div>

          <h1
            style={{
              fontFamily: display,
              fontSize: 60,
              letterSpacing: '0.03em',
              color: white,
              lineHeight: 0.9,
              margin: '0 0 16px',
            }}
          >
            GLOBAL LEADERBOARD
          </h1>

          <p style={{ fontFamily: body, fontSize: 14, color: grey[500], lineHeight: 1.6, maxWidth: 520 }}>
            Season 5: High Voltage. Compete with the world&apos;s best drivers across 12 circuits.
            Performance tiers updated every 24 hours.
          </p>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div style={{ padding: '32px 48px' }}>
        <LeaderboardTable rows={rows} />
      </div>

      {/* ── Bottom widgets (only when logged in) ─────────────────────────────── */}
      {myScore && (
        <div
          className="rp-lb-widgets"
          style={{
            gap: 16,
            padding: '0 48px 48px',
          }}
        >
          {/* Active Circuits */}
          <div
            style={{
              backgroundColor: grey[900],
              border: `1px solid ${grey[700]}`,
              borderRadius: 6,
              padding: '20px 24px',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase', marginBottom: 10 }}>
              ACTIVE CIRCUITS
            </p>
            <p style={{ fontFamily: display, fontSize: 22, letterSpacing: '0.04em', color: white, marginBottom: 6 }}>
              Season Active
            </p>
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>
              Rankings updating live
            </p>
          </div>

          {/* Your Position */}
          <div
            style={{
              backgroundColor: grey[900],
              border: `1px solid ${accent}55`,
              borderRadius: 6,
              padding: '20px 24px',
              boxShadow: `0 0 0 1px ${accent}11`,
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase', marginBottom: 10 }}>
              YOUR POSITION
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: display, fontSize: 38, letterSpacing: '0.04em', color: white, lineHeight: 1 }}>
                {cp?.global_rank != null ? `#${cp.global_rank.toLocaleString()}` : '—'}
              </span>
              <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: accent }}>
                {myScore.score.toLocaleString()} PTS
              </span>
            </div>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {cp?.username ?? '—'} · {myScore.tier.toUpperCase()}
            </p>
          </div>

          {/* Showing */}
          <div
            style={{
              backgroundColor: grey[900],
              border: `1px solid ${grey[700]}`,
              borderRadius: 6,
              padding: '20px 24px',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase', marginBottom: 10 }}>
              SHOWING
            </p>
            <p style={{ fontFamily: display, fontSize: 38, letterSpacing: '0.04em', color: white, marginBottom: 4, lineHeight: 1 }}>
              TOP {rows.length}
            </p>
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>
              Of all registered pilots
            </p>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
