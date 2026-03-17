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

      {/* Sports car silhouette watermark */}
      <div aria-hidden="true" style={{
        position: 'fixed', right: 0, bottom: 0, width: 500,
        pointerEvents: 'none', zIndex: 0, opacity: 0.025,
      }}>
        <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,165 L0,140 L35,118 L75,82 Q115,48 175,36 Q240,24 305,34 Q355,42 395,68 L435,92 L468,118 L480,135 L480,158 Q462,175 415,178 Q368,178 348,158 L158,158 Q138,175 95,178 Q52,178 30,162 Z" fill="#C8FF00" />
          <circle cx="105" cy="162" r="30" fill="#C8FF00" />
          <circle cx="105" cy="162" r="16" fill="#0E0D0C" />
          <circle cx="385" cy="162" r="30" fill="#C8FF00" />
          <circle cx="385" cy="162" r="16" fill="#0E0D0C" />
          <path d="M175,80 Q192,46 218,40 L272,34 L276,72 Z" fill="#0E0D0C" opacity="0.55" />
        </svg>
      </div>

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div style={{
        position:     'relative',
        background:   `linear-gradient(135deg, #0E0D0C 0%, #111110 50%, #0A0908 100%)`,
        borderBottom: `1px solid rgba(200,255,0,0.08)`,
        padding:      '44px 48px 40px',
        overflow:     'hidden',
      }}>
        <div
          aria-hidden="true"
          className="cyber-grid-bg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.8 }}
        />
        <div className="scan-sweep" aria-hidden="true" />
        <div className="speed-streaks" aria-hidden="true" />

        {/* Corner bracket */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 48, opacity: 0.15 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M40 0H20V4H36V20H40V0Z" fill={accent} />
            <path d="M0 40H20V36H4V20H0V40Z" fill={accent} />
          </svg>
        </div>

        <div style={{ maxWidth: 900, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase' }}>
              REVPIT · LIVE STANDINGS
            </span>
          </div>

          <h1 style={{
            fontFamily:    display,
            fontSize:      'clamp(44px, 5.5vw, 72px)',
            letterSpacing: '0.03em',
            color:         white,
            lineHeight:    0.9,
            margin:        '0 0 16px',
          }}>
            LEADERBOARD
          </h1>

          <p style={{ fontFamily: body, fontSize: 14, color: grey[500], lineHeight: 1.6, maxWidth: 520 }}>
            Season 5: High Voltage. Compete with the world&apos;s best drivers across 12 circuits.
            Performance tiers updated every 24 hours.
          </p>
        </div>
      </div>

      {/* ── TOP 3 PODIUM ─────────────────────────────────────────────────────── */}
      {rows.length >= 3 && (
        <div style={{
          padding: '48px 48px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 24,
        }}>
          {/* Position 2 — left */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              fontFamily: display, fontSize: 80, color: '#9A9690',
              opacity: 0.08, lineHeight: 1, marginBottom: -20,
            }} aria-hidden="true">2</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: display, fontSize: 20, color: white, letterSpacing: '0.04em' }}>
                {rows[1].username.toUpperCase()}
              </div>
              <div style={{ fontFamily: mono, fontSize: 14, color: grey[500] }}>
                {rows[1].score.toLocaleString()}
              </div>
            </div>
            <div style={{
              width: 80, height: 56, background: `linear-gradient(180deg, #2A2928, #1A1918)`,
              border: `1px solid ${grey[700]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: display, fontSize: 28, color: '#9A9690' }}>2</span>
            </div>
          </div>

          {/* Position 1 — centre (elevated) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span style={{
              padding: '3px 12px', background: '#D4A500',
              fontFamily: display, fontSize: 11, color: '#0A0908',
              letterSpacing: '0.1em',
            }}>
              CHAMPION
            </span>
            <div style={{
              fontFamily: display, fontSize: 100, color: '#D4A500',
              opacity: 0.08, lineHeight: 1, marginBottom: -24,
            }} aria-hidden="true">1</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: display, fontSize: 24, color: white, letterSpacing: '0.04em' }}>
                {rows[0].username.toUpperCase()}
              </div>
              <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: '#D4A500' }}>
                {rows[0].score.toLocaleString()}
              </div>
            </div>
            <div style={{
              width: 96, height: 72, background: `linear-gradient(180deg, #1A1408, #0C0A04)`,
              border: `1px solid #D4A50066`,
              boxShadow: '0 0 24px rgba(212,165,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: display, fontSize: 36, color: '#D4A500' }}>1</span>
            </div>
          </div>

          {/* Position 3 — right */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              fontFamily: display, fontSize: 80, color: '#CC7A30',
              opacity: 0.08, lineHeight: 1, marginBottom: -20,
            }} aria-hidden="true">3</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: display, fontSize: 20, color: white, letterSpacing: '0.04em' }}>
                {rows[2].username.toUpperCase()}
              </div>
              <div style={{ fontFamily: mono, fontSize: 14, color: '#CC7A30' }}>
                {rows[2].score.toLocaleString()}
              </div>
            </div>
            <div style={{
              width: 72, height: 44, background: `linear-gradient(180deg, #2A1A0A, #1A0E05)`,
              border: `1px solid #CC7A3066`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: display, fontSize: 24, color: '#CC7A30' }}>3</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div style={{ padding: '32px 48px' }}>
        <LeaderboardTable rows={rows} />
      </div>

      {/* ── Bottom widgets (only when logged in) ─────────────────────────────── */}
      {myScore && (
        <div className="rp-lb-widgets" style={{ gap: 16, padding: '0 48px 48px' }}>
          <div className="cyber-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', color: grey[700], textTransform: 'uppercase', marginBottom: 10 }}>
              ACTIVE CIRCUITS
            </p>
            <p style={{ fontFamily: display, fontSize: 22, letterSpacing: '0.04em', color: white, marginBottom: 6 }}>
              Season Active
            </p>
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>Rankings updating live</p>
          </div>

          <div
            className="cyber-card"
            style={{
              padding:   '20px 24px',
              border:    `1px solid rgba(200,255,0,0.25)`,
              boxShadow: '0 0 16px rgba(200,255,0,0.06)',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', color: grey[700], textTransform: 'uppercase', marginBottom: 10 }}>
              YOUR POSITION
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: display, fontSize: 38, letterSpacing: '0.04em', color: white, lineHeight: 1 }}>
                {cp?.global_rank != null ? `#${cp.global_rank.toLocaleString()}` : '—'}
              </span>
              <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: accent, textShadow: '0 0 12px rgba(200,255,0,0.4)' }}>
                {myScore.score.toLocaleString()} PTS
              </span>
            </div>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {cp?.username ?? '—'} · {myScore.tier.toUpperCase()}
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', color: grey[700], textTransform: 'uppercase', marginBottom: 10 }}>
              SHOWING
            </p>
            <p style={{ fontFamily: display, fontSize: 38, letterSpacing: '0.04em', color: white, marginBottom: 4, lineHeight: 1 }}>
              TOP {rows.length}
            </p>
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>Of all registered pilots</p>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
