'use client';

import Link from 'next/link';
import Image from 'next/image';
import { VoteButtons } from './vote-buttons';
import styles from './drop-card.module.css';
import type { Drop, DropTag, PollOption } from '@/lib/types/community';
import type { NewDropsBanner as NewDropsBannerProps } from '@/hooks/use-community-realtime';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m  = Math.floor(ms / 60_000);
  const h  = Math.floor(m  / 60);
  const d  = Math.floor(h  / 24);
  const mo = Math.floor(d  / 30);
  if (mo > 0) return `${mo}mo ago`;
  if (d  > 0) return `${d}d ago`;
  if (h  > 0) return `${h}h ago`;
  if (m  > 0) return `${m}m ago`;
  return 'just now';
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function isRecentDrop(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 2 * 60 * 60 * 1000;
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

const TIER_CLASS: Record<string, string> = {
  Elite:    styles.tierElite,
  Pro:      styles.tierPro,
  Advanced: styles.tierAdvanced,
  Starter:  styles.tierStarter,
};

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_CLASS[tier] ?? styles.tierStarter;
  return <span className={`${styles.tierBadge} ${cls}`}>{tier}</span>;
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

const TAG_CLASS: Record<DropTag, string> = {
  'Build Update': styles.tagBuildUpdate,
  'Question':     styles.tagQuestion,
  'Event':        styles.tagEvent,
  'News':         styles.tagNews,
  'Meme':         styles.tagMeme,
  'Discussion':   styles.tagDiscussion,
};

function TagChip({ tag }: { tag: DropTag }) {
  return <span className={`${styles.tag} ${TAG_CLASS[tag]}`}>{tag}</span>;
}

// ─── Poll bars ────────────────────────────────────────────────────────────────

function PollPreview({ options }: { options: PollOption[] }) {
  const total = options.reduce((sum, o) => sum + o.votes, 0);
  return (
    <div className={styles.pollWrap}>
      {options.map((opt) => {
        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
        return (
          <div key={opt.id} className={styles.pollOption}>
            <div className={styles.pollBar} style={{ width: `${pct}%` }} />
            <div className={styles.pollLabel}>
              <span>{opt.option}</span>
              <span className={styles.pollPct}>{pct}%</span>
            </div>
          </div>
        );
      })}
      <span className={styles.pollVotes}>
        {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'}
      </span>
    </div>
  );
}

// ─── Build update callout ─────────────────────────────────────────────────────

function BuildCallout({ body }: { body: string | null }) {
  return (
    <div className={styles.buildCallout}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M9.5 1.5a3 3 0 0 1 0 5.5L4 12.5a1 1 0 0 1-1.414-1.414L8 6.5A3 3 0 0 1 9.5 1.5Z"
          stroke="#C8FF00" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={styles.buildCalloutLabel}>Build Update</span>
      {body && <span className={styles.buildCalloutCar}>{body}</span>}
    </div>
  );
}

// ─── Pin banner ───────────────────────────────────────────────────────────────

function PinBanner() {
  return (
    <div className={styles.pinBanner}>
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
        <path d="M5 1v7M2 8h6M5 8l-2 3M5 8l2 3" stroke="#C8FF00" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5" cy="3" r="2" stroke="#C8FF00" strokeWidth="1.4" />
      </svg>
      Pinned by Pit Boss
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ReplyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1 6a5 5 0 1 0 2 4L1 11V6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="9.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="2.5" cy="6"   r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="9.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 6.8l4.2 2M4 5.2l4.2-2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

// ─── NewDropsBanner ───────────────────────────────────────────────────────────

export function NewDropsBanner({ count, dismiss }: NewDropsBannerProps) {
  return (
    <button
      type="button"
      onClick={dismiss}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '8px',
        width:          '100%',
        padding:        '10px 16px',
        background:     'rgba(200, 255, 0, 0.08)',
        border:         '1px solid rgba(200, 255, 0, 0.25)',
        borderRadius:   '0',
        cursor:         'pointer',
        fontFamily:     '"JetBrains Mono", monospace',
        fontSize:       '11px',
        fontWeight:     700,
        letterSpacing:  '0.08em',
        textTransform:  'uppercase',
        color:          '#C8FF00',
        transition:     'background 120ms ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200, 255, 0, 0.13)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200, 255, 0, 0.08)'; }}
      aria-live="polite"
      aria-label={`${count} new ${count === 1 ? 'drop' : 'drops'} — click to load`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count} new {count === 1 ? 'drop' : 'drops'} — click to load
    </button>
  );
}

// ─── DropCard ─────────────────────────────────────────────────────────────────

interface Props {
  drop: Drop;
}

export function DropCard({ drop }: Props) {
  const {
    id, title, body, type, media_urls, poll_options,
    tag, rev_count, idle_count, reply_count, is_pinned,
    created_at, author, pit, user_vote,
  } = drop;

  const isBuildUpdate = type === 'build_update';
  const isImage       = type === 'image';
  const isNew         = isRecentDrop(created_at);

  const cardClass = [
    styles.card,
    isBuildUpdate ? styles.cardBuildUpdate : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={cardClass}>

      {/* ── Pin banner ─────────────────────────────────────────────────────── */}
      {is_pinned && <PinBanner />}

      {/* ── Hero image — full-bleed for image type ─────────────────────────── */}
      {isImage && media_urls && media_urls[0] && (
        <div className={styles.heroWrap}>
          <Link href={`/community/drop/${id}`} style={{ display: 'block' }}>
            <Image
              src={media_urls[0]}
              alt={title}
              width={800}
              height={400}
              className={styles.heroImage}
              style={{ objectFit: 'cover' }}
            />
          </Link>
          {isNew && <span className={styles.newChipOverlay}>NEW DROP</span>}
        </div>
      )}

      {/* ── Card inner ─────────────────────────────────────────────────────── */}
      <div className={styles.cardInner}>

        {/* Meta */}
        <div className={styles.meta}>
          {pit && (
            <>
              <Link href={`/community/${pit.name}`} className={styles.pitName}>
                r/{pit.name}
              </Link>
              <span className={styles.metaDot} aria-hidden="true" />
            </>
          )}
          {author && (
            <>
              <Link href={`/profile/${author.username}`} className={styles.author}>
                {author.username}
              </Link>
              <TierBadge tier={author.tier} />
            </>
          )}
          <span className={styles.timeAgo} title={fullDate(created_at)}>
            {timeAgo(created_at)}
          </span>
          {!isImage && isNew && <span className={styles.newChip}>NEW</span>}
        </div>

        {/* Title */}
        <Link href={`/community/drop/${id}`} className={styles.title}>
          {title.toUpperCase()}
        </Link>

        {/* Tag */}
        {tag && <TagChip tag={tag} />}

        {/* Build callout or body */}
        {isBuildUpdate
          ? <BuildCallout body={body} />
          : body && <p className={styles.body}>{body}</p>
        }

        {/* Poll preview */}
        {type === 'poll' && poll_options && poll_options.length > 0 && (
          <PollPreview options={poll_options} />
        )}

        {/* ── Action bar ─────────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <VoteButtons
            dropId={id}
            initialRevCount={rev_count}
            initialIdleCount={idle_count}
            initialUserVote={user_vote ?? null}
          />

          <div className={styles.actionRight}>
            <Link href={`/community/drop/${id}`} className={styles.actionBtn} aria-label="View replies">
              <ReplyIcon />
              {reply_count > 0 ? reply_count.toLocaleString() : 'Reply'}
            </Link>
            <button type="button" className={styles.actionBtn} aria-label="Share drop">
              <ShareIcon />
            </button>
          </div>
        </div>

      </div>
    </article>
  );
}
