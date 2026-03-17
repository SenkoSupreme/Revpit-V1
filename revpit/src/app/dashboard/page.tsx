import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateScore } from '@/lib/scoring';
import type { Tier } from '@/lib/scoring';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import { StatNumber } from '@/components/stat-number';
import { RingGauge } from '@/components/ui/ring-gauge';

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
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
};

type ActivityItem = {
  id: string;
  description: string;
  xp?: number;
  type?: 'quest' | 'club' | 'badge' | 'race';
  created_at: string;
};

type Quest = {
  id: string;
  title: string;
  progress: number;
  total: number;
  reward?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const { white, grey, accent } = tokens.colors;
const { display, body, mono } = tokens.fonts;

const TIER_LABEL: Record<Tier, string> = {
  starter:  'STARTER',
  advanced: 'ADVANCED',
  pro:      'PRO',
  elite:    'ELITE',
};

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

// ─── Activity icon ─────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type?: string }) {
  const iconColor = grey[300];
  const bgColors: Record<string, string> = {
    quest: `${accent}22`,
    club:  `${grey[500]}22`,
    badge: `${accent}22`,
    race:  `${grey[300]}11`,
  };
  const bg = bgColors[type ?? 'race'] ?? `${grey[700]}44`;

  return (
    <div
      style={{
        width:           34,
        height:          34,
        borderRadius:    4,
        backgroundColor: bg,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        flexShrink:      0,
        border:          `1px solid ${grey[700]}`,
      }}
    >
      {type === 'quest' || type === 'race' ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l3 3 7-7" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : type === 'club' ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 11c0-2 1.5-3.5 3.5-3.5h3C10.5 7.5 12 9 12 11" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="4.5" r="2.5" stroke={iconColor} strokeWidth="1.5" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5l1.5 3.5H12l-2.8 2.1 1.1 3.4L7 8.6l-3.3 2.4 1.1-3.4L2 5.5h3.5L7 1.5z" stroke={iconColor} strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Quest bar ────────────────────────────────────────────────────────────────

function QuestBar({ quest }: { quest: Quest }) {
  const pct = Math.min((quest.progress / quest.total) * 100, 100);
  return (
    <div
      style={{
        marginBottom:    20,
        backgroundColor: `${grey[700]}22`,
        border:          `1px solid ${grey[700]}55`,
        borderRadius:    4,
        padding:         '14px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: body, fontSize: 13, fontWeight: 600, color: white }}>
          {quest.title}
        </span>
        <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: accent }}>
          {Math.round(pct)}%
        </span>
      </div>

      <div style={{ height: 3, backgroundColor: grey[700], borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        <div
          style={{
            height:          '100%',
            width:           `${pct}%`,
            backgroundColor: accent,
            borderRadius:    2,
            transition:      'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {quest.reward ? (
          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[500], textTransform: 'uppercase' }}>
            REWARD: {quest.reward}
          </span>
        ) : (
          <span />
        )}
        <span style={{ fontFamily: mono, fontSize: 9, color: grey[500] }}>
          {quest.progress}/{quest.total}
        </span>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createAdminClient();

  const [{ data: profile }, { data: activityRows }, { data: questRows }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', userId)
        .single<Profile>(),
      supabase
        .from('activity_feed')
        .select('id, description, xp, type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('quests')
        .select('id, title, progress, total, reward')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(4),
    ]);

  const p: Profile = profile ?? {
    id:                 userId,
    username:           'pilot',
    bio:                null,
    avatar_url:         null,
    instagram_handle:   null,
    social_followers:   0,
    quest_completions:  0,
    club_activity:      0,
    global_rank:        null,
    profile_completion: 0,
    score:              0,
    tier:               'starter',
  };

  const activity: ActivityItem[] = activityRows ?? [];
  const quests: Quest[]          = questRows ?? [];

  const { score, tier: calcTier } = calculateScore({
    carSpecCompleteness: 50,
    socialFollowers:     p.social_followers,
    questCompletions:    p.quest_completions,
    clubActivity:        p.club_activity,
    communityScore:      (p as { community_score?: number }).community_score ?? 0,
  });
  const resolvedScore = p.score || score;
  const tier          = (p.tier as import('@/lib/scoring').Tier) || calcTier;

  return (
    <PageTransition>
      <div style={{ padding: '40px 48px', maxWidth: 1060, fontFamily: body }}>

        {/* Page title */}
        <div style={{ marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          {/* Speed streak decoration */}
          <svg
            aria-hidden="true"
            viewBox="0 0 520 72"
            preserveAspectRatio="xMaxYMid meet"
            style={{ position: 'absolute', right: 0, top: 0, width: 520, height: 72, pointerEvents: 'none', opacity: 0.07 }}
          >
            {([
              { y: 10,  len: 200, w: 2   },
              { y: 22,  len: 130, w: 1   },
              { y: 33,  len: 260, w: 2   },
              { y: 44,  len: 90,  w: 1   },
              { y: 55,  len: 180, w: 1.5 },
              { y: 65,  len: 110, w: 1   },
            ] as { y: number; len: number; w: number }[]).map(({ y, len, w }, i) => (
              <line key={i} x1={520 - len} y1={y} x2={520} y2={y} stroke="#C8FF00" strokeWidth={w} />
            ))}
          </svg>

          <h1
            style={{
              fontFamily:    display,
              fontSize:      48,
              letterSpacing: '0.04em',
              color:         white,
              lineHeight:    1,
              marginBottom:  6,
            }}
          >
            DASHBOARD
          </h1>
          <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase' }}>
            PERFORMANCE OVERVIEW &amp; RECENT ACTIVITY
          </p>
        </div>

        {/* ── Stat widgets ─────────────────────────────────────────────────── */}
        <div className="rp-stat-grid" style={{ marginBottom: 28 }}>

          {/* Total Score */}
          <div className="rp-card" style={{ padding: '22px 26px' }}>
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase', marginBottom: 14 }}>
              TOTAL SCORE
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatNumber value={resolvedScore} style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: accent, lineHeight: 1 }} />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ opacity: 0.6 }}>
                <path d="M3 13l5-5 3 3 4-5" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6h3v3" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span
              style={{
                display:         'inline-block',
                marginTop:       8,
                padding:         '2px 8px',
                backgroundColor: TIER_BG[tier],
                borderRadius:    2,
                fontFamily:      mono,
                fontSize:        9,
                fontWeight:      700,
                letterSpacing:   '0.12em',
                color:           TIER_COLOR[tier],
                textTransform:   'uppercase',
              }}
            >
              {TIER_LABEL[tier]}
            </span>
          </div>

          {/* Global Rank */}
          <div className="rp-card" style={{ padding: '22px 26px' }}>
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase', marginBottom: 14 }}>
              GLOBAL RANK
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {p.global_rank != null
                ? <><span style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: white, lineHeight: 1 }}>#</span><StatNumber value={p.global_rank} style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: white, lineHeight: 1 }} /></>
                : <span style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: white, lineHeight: 1 }}>—</span>
              }
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ opacity: 0.4 }}>
                <circle cx="9" cy="9" r="7" stroke={grey[300]} strokeWidth="1.5" />
                <path d="M9 5.5v4l2.5 2" stroke={grey[300]} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[500], textTransform: 'uppercase', marginTop: 8, display: 'block' }}>
              WORLDWIDE
            </span>
          </div>

          {/* Profile Completion */}
          <div className="rp-card" style={{ padding: '22px 26px' }}>
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[500], textTransform: 'uppercase', marginBottom: 14 }}>
              PROFILE COMPLETION
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <StatNumber value={p.profile_completion} style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: white, lineHeight: 1 }} />
              <span style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: white, lineHeight: 1 }}>%</span>
              <RingGauge value={p.profile_completion} />
            </div>
          </div>

        </div>

        {/* ── Bottom grid ──────────────────────────────────────────────────── */}
        <div className="rp-bottom-grid" style={{ gap: 16 }}>

          {/* Activity Feed */}
          <div className="rp-card" style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.06em', color: white }}>
                ACTIVITY FEED
              </h2>
              <Link
                href="/activity"
                style={{
                  fontFamily:     mono,
                  fontSize:       9,
                  letterSpacing:  '0.1em',
                  color:          grey[500],
                  textDecoration: 'none',
                  border:         `1px solid ${grey[700]}`,
                  padding:        '4px 10px',
                  borderRadius:   2,
                }}
              >
                VIEW ALL
              </Link>
            </div>

            {activity.length === 0 ? (
              <p style={{ fontFamily: body, fontSize: 13, color: grey[500] }}>
                No activity yet. Complete quests to get started.
              </p>
            ) : (
              <div>
                {activity.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display:       'flex',
                      alignItems:    'flex-start',
                      gap:           12,
                      paddingBottom: idx < activity.length - 1 ? 16 : 0,
                      marginBottom:  idx < activity.length - 1 ? 16 : 0,
                      borderBottom:  idx < activity.length - 1 ? `1px solid ${grey[700]}44` : 'none',
                    }}
                  >
                    <ActivityIcon type={item.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: body, fontSize: 13, color: grey[300], lineHeight: 1.4 }}>
                        {item.description}
                      </span>
                      <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], marginTop: 3, letterSpacing: '0.06em' }}>
                        {timeAgo(item.created_at)}
                      </p>
                    </div>
                    {item.xp != null && item.xp > 0 && (
                      <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: accent, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        +{item.xp} XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Quests */}
          <div className="rp-card" style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.06em', color: white }}>
                QUEST PROGRESS
              </h2>
              <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[500] }}>
                {quests.length} ACTIVE
              </span>
            </div>

            {quests.length === 0 ? (
              <div>
                <p style={{ fontFamily: body, fontSize: 13, color: grey[500], marginBottom: 12 }}>
                  No active quests.
                </p>
                <Link
                  href="/quests"
                  className="rp-btn-accent btn-press"
                  style={{ height: 34, padding: '0 18px', fontSize: 10 }}
                >
                  BROWSE QUESTS
                </Link>
              </div>
            ) : (
              quests.map((q) => <QuestBar key={q.id} quest={q} />)
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
