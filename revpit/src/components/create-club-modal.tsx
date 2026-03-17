'use client';

import { useState, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createPortal } from 'react-dom';
import { createClub } from '@/app/clubs/actions';
import type { CreateClubState } from '@/app/clubs/actions';
import styles from './create-club-modal.module.css';

// ─── Submit button (needs useFormStatus, must be inside the form) ─────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitBtn} disabled={pending}>
      {pending ? 'Creating…' : 'Create Club'}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ onClose }: { onClose: () => void }) {
  const [state, action] = useActionState<CreateClubState, FormData>(createClub, {
    error: null,
  });
  const [descLen, setDescLen] = useState(0);
  const [isPublic, setIsPublic] = useState(true);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-club-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* Close */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Title */}
        <h2
          id="create-club-title"
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 26,
            letterSpacing: '0.05em',
            color: '#F5F4F0',
            marginBottom: 24,
            lineHeight: 1,
          }}
        >
          CREATE CLUB
        </h2>

        {/* Error */}
        {state.error && (
          <p className={styles.error} role="alert">{state.error}</p>
        )}

        {/* Form */}
        <form action={action} noValidate>
          {/* Name */}
          <div className={styles.field}>
            <label htmlFor="club-name" className={styles.label}>Club Name</label>
            <input
              id="club-name"
              name="name"
              type="text"
              className={styles.input}
              placeholder="e.g. Alpine Motorsport Club"
              maxLength={60}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="club-desc" className={styles.label}>Description</label>
            <textarea
              id="club-desc"
              name="description"
              className={styles.textarea}
              placeholder="What's your club about?"
              maxLength={280}
              onChange={(e) => setDescLen(e.target.value.length)}
            />
            <span className={styles.charCount}>{descLen}/280</span>
          </div>

          {/* Visibility toggle */}
          <div className={styles.field}>
            <span className={styles.label}>Visibility</span>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>
                  {isPublic ? 'Public' : 'Private'}
                </span>
                <span className={styles.toggleSub}>
                  {isPublic
                    ? 'Anyone can find and join this club'
                    : 'Invite-only — hidden from search'}
                </span>
              </div>
              <label className={styles.toggleSwitch} aria-label="Toggle visibility">
                <input
                  type="checkbox"
                  name="visibility"
                  value="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleKnob} />
              </label>
            </div>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ─── Exported component: trigger button + portal modal ───────────────────────

export function CreateClubModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setOpen(true)}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Create Club
      </button>

      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
