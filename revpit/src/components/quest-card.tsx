import { tokens } from '@/lib/design-tokens';
import { QuestCountdown } from './quest-countdown';
import { QuestSubmitButton } from './quest-submit-button';
import styles from './quest-card.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestStatus = 'active' | 'pending' | 'completed';

export type QuestCardProps = {
  id:           string;
  title:        string;
  description:  string;
  points:       number;
  deadline:     string;   // ISO
  category:     string;
  difficulty:   'easy' | 'medium' | 'hard';
  progress:     number;   // 0–100
  status:       QuestStatus;
  submittedAt?: string;   // ISO — for pending/completed
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DIFF_COLOR = {
  easy:   '#5BA85A',
  medium: '#E8A838',
  hard:   '#FF6B6B',
} as const;

const DIFF_LABEL = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
} as const;

function relativeTime(iso: string) {
  const ms  = Date.now() - new Date(iso).getTime();
  const m   = Math.floor(ms / 60_000);
  const h   = Math.floor(m  / 60);
  const d   = Math.floor(h  / 24);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  return `${m}m ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuestCard({
  id, title, description, points, deadline,
  category, difficulty, progress, status, submittedAt,
}: QuestCardProps) {
  const { white, grey } = tokens.colors;
  const { display, body, mono } = tokens.fonts;

  const cardClass = [
    styles.card,
    status === 'active'    ? styles.cardActive    : '',
    status === 'pending'   ? styles.cardPending   : '',
    status === 'completed' ? styles.cardCompleted : '',
  ].join(' ');

  const fillClass =
    status === 'active'    ? styles.progressFillActive    :
    status === 'pending'   ? styles.progressFillPending   :
                             styles.progressFillCompleted;

  return (
    <article className={cardClass}>
      {/* ── Top row: category + difficulty + points ──────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Category */}
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: grey[500],
            }}
          >
            {category}
          </span>

          {/* Difficulty */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: DIFF_COLOR[difficulty],
            }}
          >
            <span
              className={styles.diffPip}
              style={{ backgroundColor: DIFF_COLOR[difficulty] }}
            />
            {DIFF_LABEL[difficulty]}
          </span>
        </div>

        {/* Points */}
        <span className={styles.pointsBadge}>+{points.toLocaleString()} pts</span>
      </div>

      {/* ── Title ────────────────────────────────────────────────────── */}
      <h3
        style={{
          fontFamily: display,
          fontSize: 20,
          letterSpacing: '0.04em',
          color: status === 'completed' ? grey[300] : white,
          lineHeight: 1.1,
          margin: '0 0 8px',
        }}
      >
        {title.toUpperCase()}
      </h3>

      {/* ── Description ──────────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: body,
          fontSize: 13,
          color: grey[500],
          lineHeight: 1.5,
          margin: '0 0 14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </p>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressFill} ${fillClass}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* ── Footer: deadline + action ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Deadline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="5" stroke={grey[700]} strokeWidth="1.3" />
            <path d="M6 3.5V6l1.5 1.5" stroke={grey[700]} strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <QuestCountdown deadline={deadline} />
        </div>

        {/* Action area */}
        {status === 'active' && <QuestSubmitButton questId={id} />}

        {status === 'pending' && (
          <div>
            <span className={styles.badgePending}>
              <span className={styles.pendingDot} />
              Pending Review
            </span>
            {submittedAt && (
              <span
                style={{
                  display: 'block',
                  fontFamily: mono,
                  fontSize: 9,
                  color: grey[700],
                  marginTop: 4,
                  letterSpacing: '0.04em',
                }}
              >
                Submitted {relativeTime(submittedAt)}
              </span>
            )}
          </div>
        )}

        {status === 'completed' && (
          <div>
            <span className={styles.badgeApproved}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Approved
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: mono,
                fontSize: 9,
                color: grey[700],
                marginTop: 4,
                letterSpacing: '0.04em',
              }}
            >
              +{points.toLocaleString()} pts earned
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
