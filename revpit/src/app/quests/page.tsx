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
  accent,
}: {
  label: string;
  count: number;
  accent?: boolean;
}) {
  const { white, grey } = tokens.colors;
  const { display, mono } = tokens.fonts;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          fontFamily: display,
          fontSize: 22,
          letterSpacing: '0.06em',
          color: accent ? tokens.colors.accent : white,
          margin: 0,
          lineHeight: 1,
        }}
      >
        {label}
      </h2>
      <span
        style={{
          fontFamily: mono,
          fontSize: 11,
          fontWeight: 700,
          color: grey[700],
          letterSpacing: '0.06em',
        }}
      >
        {count}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: grey[900],
        }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: 'Quests — REVPIT' };

export default async function QuestsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { black, white, grey } = tokens.colors;
  const { display, mono }      = tokens.fonts;

  const supabase = createAdminClient();

  // Fetch all available quests (not yet expired)
  const { data: allQuests } = await supabase
    .from('quests')
    .select('id, title, description, points, deadline, category, difficulty')
    .gte('deadline', new Date().toISOString())
    .order('deadline', { ascending: true });

  // Fetch this user's quest submissions (including joined quest data for
  // quests that may have expired and are no longer in allQuests)
  const { data: userQuestsRaw } = await supabase
    .from('user_quests')
    .select('quest_id, status, progress, submitted_at, quest:quests(id, title, description, points, deadline, category, difficulty)')
    .eq('user_id', userId);

  const quests     = (allQuests     as RawQuest[]     | null) ?? [];
  const userQuests = (userQuestsRaw as RawUserQuest[] | null) ?? [];

  // Build lookup: questId → user submission
  const submissionMap = new Map<string, RawUserQuest>();
  for (const uq of userQuests) {
    submissionMap.set(uq.quest_id, uq);
  }

  // Buckets
  const activeCards:    QuestCardProps[] = [];
  const pendingCards:   QuestCardProps[] = [];
  const completedCards: QuestCardProps[] = [];

  for (const q of quests) {
    const sub = submissionMap.get(q.id);

    if (!sub || sub.status === 'rejected') {
      activeCards.push({
        id:          q.id,
        title:       q.title,
        description: q.description,
        points:      q.points,
        deadline:    q.deadline,
        category:    q.category,
        difficulty:  q.difficulty,
        progress:    sub?.progress ?? 0,
        status:      'active',
      });
    } else if (sub.status === 'pending') {
      pendingCards.push({
        id:          q.id,
        title:       q.title,
        description: q.description,
        points:      q.points,
        deadline:    q.deadline,
        category:    q.category,
        difficulty:  q.difficulty,
        progress:    sub.progress ?? 100,
        status:      'pending',
        submittedAt: sub.submitted_at,
      });
    }
    // approved: caught below via userQuests loop
  }

  // Completed quests (approved) — pull from user_quests since the source
  // quest may or may not still be in the active list
  for (const uq of userQuests) {
    if (uq.status !== 'approved') continue;
    const q = uq.quest ?? quests.find((r) => r.id === uq.quest_id);
    if (!q) continue;
    completedCards.push({
      id:          q.id,
      title:       q.title,
      description: q.description,
      points:      q.points,
      deadline:    q.deadline,
      category:    q.category,
      difficulty:  q.difficulty,
      progress:    100,
      status:      'completed',
      submittedAt: uq.submitted_at,
    });
  }

  const totalPts = completedCards.reduce((acc, c) => acc + c.points, 0);

  return (
    <PageTransition>
    <div
      className="page-red-accent"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D0B0B',
        padding: '40px 48px',
      } as React.CSSProperties}
    >
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: display,
              fontSize: 42,
              letterSpacing: '0.04em',
              color: white,
              lineHeight: 1,
              margin: 0,
            }}
          >
            QUESTS
          </h1>
          <p
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: grey[500],
              letterSpacing: '0.1em',
              marginTop: 8,
            }}
          >
            {activeCards.length} ACTIVE &nbsp;·&nbsp;
            {pendingCards.length} PENDING &nbsp;·&nbsp;
            {completedCards.length} COMPLETED
          </p>
        </div>

        {/* Points earned summary */}
        {completedCards.length > 0 && (
          <div
            style={{
              textAlign: 'right',
              fontFamily: mono,
            }}
          >
            <p style={{ fontSize: 10, color: grey[500], letterSpacing: '0.1em', marginBottom: 2 }}>
              POINTS EARNED
            </p>
            <p
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: tokens.colors.accent,
                lineHeight: 1,
              }}
            >
              +{totalPts.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: grey[700],
          margin: '24px 0 36px',
        }}
      />

      {/* ── Active ────────────────────────────────────────────────────── */}
      {activeCards.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeading label="ACTIVE" count={activeCards.length} accent />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {activeCards.map((q) => <QuestCard key={q.id} {...q} />)}
          </div>
        </section>
      )}

      {/* ── Submitted — Pending Review ────────────────────────────────── */}
      {pendingCards.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeading label="SUBMITTED — PENDING REVIEW" count={pendingCards.length} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {pendingCards.map((q) => <QuestCard key={q.id} {...q} />)}
          </div>
        </section>
      )}

      {/* ── Completed ─────────────────────────────────────────────────── */}
      {completedCards.length > 0 && (
        <section>
          <SectionHeading label="COMPLETED" count={completedCards.length} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {completedCards.map((q) => <QuestCard key={q.id} {...q} />)}
          </div>
        </section>
      )}

      {/* ── Fully empty state ─────────────────────────────────────────── */}
      {activeCards.length === 0 && pendingCards.length === 0 && completedCards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 80,
            fontFamily: mono,
            fontSize: 13,
            color: grey[700],
            letterSpacing: '0.08em',
          }}
        >
          No quests available right now. Check back soon.
        </div>
      )}
    </div>
    </PageTransition>
  );
}
