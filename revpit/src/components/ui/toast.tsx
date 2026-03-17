'use client';

import { useEffect, useState } from 'react';
import type { Toast as ToastItem, ToastVariant } from '@/hooks/use-toast';

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6.5v3.5M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Per-toast config ─────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, { color: string; borderColor: string; icon: React.ReactNode }> = {
  success: {
    color:       '#34C759',
    borderColor: 'rgba(52,199,89,0.50)',
    icon:        <CheckIcon />,
  },
  error: {
    color:       '#FF3B2F',
    borderColor: 'rgba(255,59,47,0.50)',
    icon:        <ErrorIcon />,
  },
  info: {
    color:       '#C8FF00',
    borderColor: 'rgba(200,255,0,0.35)',
    icon:        <InfoIcon />,
  },
};

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const cfg = VARIANT_CONFIG[toast.variant];

  function handleClose() {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, 3200);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             12,
        minWidth:        280,
        maxWidth:        380,
        padding:         '14px 16px',
        backgroundColor: 'var(--bg-elevated, #252422)',
        border:          `1px solid rgba(255,255,255,0.08)`,
        borderLeft:      `3px solid ${cfg.color}`,
        borderRadius:    0,
        boxShadow:       '0 8px 24px rgba(0,0,0,0.60)',
        animation:       exiting
          ? 'toast-out 200ms ease-in both'
          : 'toast-in 250ms ease-out both',
      }}
    >
      {/* Icon */}
      <span style={{ color: cfg.color, flexShrink: 0, display: 'flex' }}>
        {cfg.icon}
      </span>

      {/* Message */}
      <span
        style={{
          flex:       1,
          fontFamily: 'var(--font-body)',
          fontSize:   13,
          color:      'var(--text-primary, #F5F4F0)',
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>

      {/* Close */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          flexShrink:  0,
          display:     'flex',
          alignItems:  'center',
          background:  'none',
          border:      'none',
          padding:     4,
          cursor:      'pointer',
          color:       'var(--text-muted, #6B6860)',
          transition:  'color 120ms ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F5F4F0'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted, #6B6860)'; }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// ─── Toast container ──────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts:    ToastItem[];
  onDismiss: (id: string) => void;
}

/**
 * ToastContainer — fixed bottom-right stack.
 * Render once in the root layout or page; pass `toasts` + `onDismiss` from `useToast()`.
 *
 * @example
 * const { toasts, toast, dismiss } = useToast();
 * return (
 *   <>
 *     ...page content...
 *     <ToastContainer toasts={toasts} onDismiss={dismiss} />
 *   </>
 * );
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position:      'fixed',
        bottom:        20,
        right:         20,
        zIndex:        1000,
        display:       'flex',
        flexDirection: 'column',
        gap:           8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
