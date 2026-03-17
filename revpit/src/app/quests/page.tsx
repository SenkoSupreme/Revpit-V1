import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { QuestCard } from '@/components/quest-card';
import type { QuestCardProps, QuestStatus } from '@/components/quest-card';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';

// ─── Types ────────────────────────────────────────────────────────────────────

type RawQuest = {
  id:          string;
  title:       string;
  description: string;
  points:      number;
  deadline:    string;
  category:    string;
  difficulty:  'easy' | 'medium' | 'hard';
};

type RawUserQuest = {
  quest_id:     string;
  status:       'pending' | 'approved' | 'rejected';
  progress:     number;
  submitted_at: string;
  quest:        RawQuest;
};

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  label,
  count,
  accent: isAccent,
}: {
  label: string;
  count: number;
  accent?: boolean;
}) {
  const { white, grey, accent } = tokens.colors;
  const { display, mono } = tokens.fonts;

  return (
    <div className="section-header-line" style={{ marginBottom: 20 }}>
      {isAccent && <span className="live-dot" />}
      <h2
        style={{
          fontFamily:    display,
          fontSize:      22,
          letterSpacing: '0.06em',
          color:         isAccent ? accent : white,
          margin:        0,
          lineHeight:    1,
        }}
      >
        {label}
      </h2>
      <span
        style={{
          fontFamily:    mono,
          fontSize:      11,
          fontWeight:    700,
          color:         grey[700],
          letterSpacing: '0.06em',
        }}
      >
        {count}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: 'Quests — REVPIT' };

export default async function QuestsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { white, grey, accent } = tokens.colors;
  const { display, body, mono } = tokens.fonts;

  const supabase = createAdminClient();

  const { data: allQuests } = await supabase
    .from('quests')
    .select('id, title, description, points, deadline, category, difficulty')
    .gte('deadline', new Date().toISOString())
    .order('deadline', { ascending: true });

  const { data: userQuestsRaw } = await supabase
    .from('user_quests')
    .select('quest_id, status, progress, submitted_at, quest:quests(id, title, description, points, deadline, category, difficulty)')
    .eq('user_id', userId);

  const quests     = (allQuests     as RawQuest[]     | null) ?? [];
  const userQuests = (userQuestsRaw as RawUserQuest[] | null) ?? [];

  const submissionMap = new Map<string, RawUserQuest>();
  for (const uq of userQuests) {
    submissionMap.set(uq.quest_id, uq);
  }

  const activeCards:    QuestCardProps[] = [];
  const pendingCards:   QuestCardProps[] = [];
  const completedCards: QuestCardProps[] = [];

  for (const q of quests) {
    const sub = submissionMap.get(q.id);
    if (!sub || sub.status === 'rejected') {
      activeCards.push({
        id: q.id, title: q.title, description: q.description,
        points: q.points, deadline: q.deadline, category: q.category,
        difficulty: q.difficulty, progress: sub?.progress ?? 0, status: 'active',
      });
    } else if (sub.status === 'pending') {
      pendingCards.push({
        id: q.id, title: q.title, description: q.description,
        points: q.points, deadline: q.deadline, category: q.category,
        difficulty: q.difficulty, progress: sub.progress ?? 100,
        status: 'pending', submittedAt: sub.submitted_at,
      });
    }
  }

  for (const uq of userQuests) {
    if (uq.status !== 'approved') continue;
    const q = uq.quest ?? quests.find((r) => r.id === uq.quest_id);
    if (!q) continue;
    completedCards.push({
      id: q.id, title: q.title, description: q.description,
      points: q.points, deadline: q.deadline, category: q.category,
      difficulty: q.difficulty, progress: 100,
      status: 'completed', submittedAt: uq.submitted_at,
    });
  }

  const totalPts = completedCards.reduce((acc, c) => acc + c.points, 0);

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0B0B' }}>

      {/* ── Cyber hero header ─────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          background:   `linear-gradient(135deg, #0D0B0B 0%, #111110 50%, #0A0908 100%)`,
          borderBottom: `1px solid rgba(200,255,0,0.08)`,
          padding:      '44px 48px 36px',
          overflow:     'hidden',
        }}
      >
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

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', color: accent }}>
                  REVPIT · MISSION BOARD
                </span>
              </div>
              <h1
                style={{
                  fontFamily:    display,
                  fontSize:      'clamp(44px, 5vw, 64px)',
                  letterSpacing: '0.04em',
                  color:         white,
                  lineHeight:    0.9,
                  margin:        '0 0 12px',
                }}
              >
                QUESTS
              </h1>
              <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', color: grey[500] }}>
                {activeCards.length} ACTIVE &nbsp;·&nbsp;
                {pendingCards.length} PENDING &nbsp;·&nbsp;
                {completedCards.length} COMPLETED
              </p>
            </div>

            {/* Points earned */}
            {completedCards.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: grey[700], marginBottom: 4 }}>
                  POINTS EARNED
                </p>
                <p
                  style={{
                    fontFamily:    display,
                    fontSize:      40,
                    letterSpacing: '0.04em',
                    color:         accent,
                    lineHeight:    1,
                    textShadow:    '0 0 24px rgba(200,255,0,0.35)',
                  }}
                >
                  +{totalPts.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
          background:   '#0F0E0C',
        }}
      >
        {[
          { label: 'ACTIVE',     value: String(activeCards.length),    hi: activeCards.length > 0 },
          { label: 'PENDING',    value: String(pendingCards.length),   hi: false },
          { label: 'COMPLETED',  value: String(completedCards.length), hi: false },
          { label: 'PTS EARNED', value: totalPts > 0 ? `+${totalPts.toLocaleString()}` : '0', hi: totalPts > 0 },
        ].map(({ label, value, hi }, i, arr) => (
          <div
            key={label}
            style={{
              flex:        1,
              padding:     '14px 24px',
              borderRight: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
              textAlign:   'center',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 8, color: grey[700], letterSpacing: '0.16em', marginBottom: 4 }}>
              {label}
            </p>
            <p
              style={{
                fontFamily: mono, fontSize: 22, fontWeight: 700,
                color:      hi ? accent : white,
                lineHeight: 1,
                textShadow: hi ? '0 0 16px rgba(200,255,0,0.4)' : 'none',
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '36px 48px 64px' }}>

        {/* Active */}
        {activeCards.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeading label="ACTIVE" count={activeCards.length} accent />
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap:                 16,
              }}
            >
              {activeCards.map((q) => <QuestCard key={q.id} {...q} />)}
            </div>
          </section>
        )}

        {/* Pending */}
        {pendingCards.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeading label="SUBMITTED — PENDING REVIEW" count={pendingCards.length} />
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap:                 16,
              }}
            >
              {pendingCards.map((q) => <QuestCard key={q.id} {...q} />)}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedCards.length > 0 && (
          <section>
            <SectionHeading label="COMPLETED" count={completedCards.length} />
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap:                 16,
              }}
            >
              {completedCards.map((q) => <QuestCard key={q.id} {...q} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {activeCards.length === 0 && pendingCards.length === 0 && completedCards.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding:   '80px 24px',
              border:    `1px dashed ${grey[700]}`,
              clipPath:  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
            }}
          >
            <p style={{ fontFamily: display, fontSize: 24, letterSpacing: '0.06em', color: grey[700], marginBottom: 8, lineHeight: 1 }}>
              NO QUESTS AVAILABLE
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em' }}>
              NEW MISSIONS DROP REGULARLY — CHECK BACK SOON
            </p>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
