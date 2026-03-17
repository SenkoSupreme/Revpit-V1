'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { createReply } from '@/lib/actions/community';
import styles from './reply-thread.module.css';
import type { Reply } from '@/lib/types/community';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DEPTH        = 4;
const COLLAPSE_AFTER   = 5;

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

// Deterministic colour from username initial
const AVATAR_COLORS = [
  '#C8FF00', '#60AFFF', '#E8A838', '#A78BFA',
  '#F97316', '#34D399', '#F43F5E', '#22D3EE',
];

function avatarColor(username: string): string {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const color = avatarColor(username);

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={username} className={`${styles.avatar} ${styles.avatarImg}`} />
    );
  }

  return (
    <div className={styles.avatar} style={{ background: color }} aria-hidden="true">
      {username[0]}
    </div>
  );
}

// ─── Rev button (reply-level upvote only) ─────────────────────────────────────

function RevButton({ count, active, onClick, disabled }: {
  count: number; active: boolean; onClick: () => void; disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={active ? 'Remove rev' : 'Rev this reply'}
      aria-pressed={active}
      className={`${styles.revBtn} ${active ? styles.revBtnActive : ''}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
        <path
          d="M5 1L9 7H1L5 1Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
        />
      </svg>
      {count > 0 && count}
    </button>
  );
}

// ─── Inline reply composer ────────────────────────────────────────────────────

function ReplyComposer({
  dropId,
  parentReplyId,
  onSuccess,
  onCancel,
}: {
  dropId:        string;
  parentReplyId?: string;
  onSuccess:      () => void;
  onCancel:       () => void;
}) {
  const [body,    setBody]    = useState('');
  const [error,   setError]   = useState('');
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) { setError('Reply cannot be empty.'); return; }
    if (trimmed.length < 2) { setError('Too short.'); return; }

    startTransition(async () => {
      setError('');
      const result = await createReply({ dropId, body: trimmed, parentReplyId });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBody('');
      onSuccess();
    });
  }

  // Auto-focus on mount
  const focusRef = (el: HTMLTextAreaElement | null) => {
    if (el) { (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el; el.focus(); }
  };

  return (
    <div className={styles.composer}>
      <textarea
        ref={focusRef}
        className={styles.composerTextarea}
        placeholder="Write a reply…"
        value={body}
        maxLength={2000}
        onChange={(e) => { setBody(e.target.value); setError(''); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
        aria-label="Reply body"
      />
      {error && <span className={styles.composerError} role="alert">{error}</span>}
      <div className={styles.composerActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.submitReplyBtn}
          onClick={handleSubmit}
          disabled={pending || !body.trim()}
          aria-busy={pending}
        >
          {pending ? 'Posting…' : 'Reply'}
        </button>
      </div>
    </div>
  );
}

// ─── Single reply node ────────────────────────────────────────────────────────

function ReplyNode({
  reply,
  dropId,
  depth,
}: {
  reply:  Reply;
  dropId: string;
  depth:  number;
}) {
  const [revCount,   setRevCount]   = useState(reply.rev_count);
  const [revActive,  setRevActive]  = useState(false);
  const [revPending, startRevTransition] = useTransition();

  const [composing,  setComposing]  = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  const author    = reply.author;
  const children  = reply.children ?? [];
  const isDeep    = depth >= MAX_DEPTH;
  const hasMore   = children.length >= COLLAPSE_AFTER;
  const visible   = expanded ? children : children.slice(0, COLLAPSE_AFTER - 1);
  const hiddenCount = children.length - visible.length;

  function handleRev() {
    startRevTransition(async () => {
      // Optimistic toggle
      if (revActive) {
        setRevCount((c) => Math.max(0, c - 1));
        setRevActive(false);
      } else {
        setRevCount((c) => c + 1);
        setRevActive(true);
      }
      // Note: reply rev server action can be wired here when added to community.ts
    });
  }

  return (
    <div>
      <div className={styles.replyRow}>
        {/* Avatar */}
        <Avatar
          username={author?.username ?? '?'}
          avatarUrl={author?.avatar_url ?? null}
        />

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            {author ? (
              <Link href={`/profile/${author.username}`} className={styles.username}>
                {author.username}
              </Link>
            ) : (
              <span className={styles.username}>[deleted]</span>
            )}

            {author && <TierBadge tier={author.tier} />}

            <span
              className={styles.timeAgo}
              title={new Date(reply.created_at).toLocaleString()}
            >
              {timeAgo(reply.created_at)}
            </span>
          </div>

          {/* Body */}
          {author
            ? <p className={styles.body}>{reply.body}</p>
            : <p className={styles.deleted}>[comment removed]</p>
          }

          {/* Actions */}
          <div className={styles.actions}>
            <RevButton
              count={revCount}
              active={revActive}
              onClick={handleRev}
              disabled={revPending}
            />

            {!isDeep && (
              <button
                type="button"
                className={`${styles.replyBtn} ${composing ? styles.replyBtnActive : ''}`}
                onClick={() => setComposing((v) => !v)}
                aria-expanded={composing}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path
                    d="M1 5.5a4.5 4.5 0 1 0 1.8 3.6L1 10.5V5.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                Reply
              </button>
            )}
          </div>

          {/* Inline composer */}
          {composing && (
            <ReplyComposer
              dropId={dropId}
              parentReplyId={reply.id}
              onSuccess={() => setComposing(false)}
              onCancel={() => setComposing(false)}
            />
          )}
        </div>
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div className={styles.nested}>
          <div className={styles.nestLine} aria-hidden="true" />

          {isDeep ? (
            // At max depth — offer link to full thread instead of rendering
            <Link
              href={`/community/drop/${dropId}?reply=${reply.id}`}
              className={styles.continueThread}
            >
              Continue this thread
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <>
              {visible.map((child) => (
                <ReplyNode
                  key={child.id}
                  reply={child}
                  dropId={dropId}
                  depth={depth + 1}
                />
              ))}

              {!expanded && hiddenCount > 0 && (
                <button
                  type="button"
                  className={styles.showMoreBtn}
                  onClick={() => setExpanded(true)}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Show {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ReplyThread ──────────────────────────────────────────────────────────────

interface Props {
  replies: Reply[];
  dropId:  string;
}

export function ReplyThread({ replies, dropId }: Props) {
  // Top-level composer for the drop itself
  const [composing, setComposing] = useState(false);

  if (replies.length === 0 && !composing) {
    return (
      <div>
        <div className={styles.empty} aria-label="No replies yet">
          NO REPLIES YET — BE THE FIRST
        </div>
        <button
          type="button"
          className={styles.replyBtn}
          style={{ marginTop: 4 }}
          onClick={() => setComposing(true)}
        >
          Write a reply
        </button>
      </div>
    );
  }

  return (
    <div className={styles.thread}>
      {/* Top-level "Add a comment" composer */}
      {composing ? (
        <div style={{ marginBottom: 24 }}>
          <ReplyComposer
            dropId={dropId}
            onSuccess={() => setComposing(false)}
            onCancel={() => setComposing(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          className={styles.replyBtn}
          style={{ marginBottom: 20, alignSelf: 'flex-start' }}
          onClick={() => setComposing(true)}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path
              d="M1 5.5a4.5 4.5 0 1 0 1.8 3.6L1 10.5V5.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          Add a comment
        </button>
      )}

      {/* Reply tree */}
      {replies.map((reply, i) => (
        <div
          key={reply.id}
          className={`${i > 0 ? styles.topLevelReply : ''}`}
        >
          <ReplyNode
            reply={reply}
            dropId={dropId}
            depth={0}
          />
        </div>
      ))}
    </div>
  );
}
