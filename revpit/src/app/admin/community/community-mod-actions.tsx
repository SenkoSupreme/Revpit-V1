'use client';

import { useState, useTransition } from 'react';
import { adminDeleteDrop } from '../actions';
import styles from '../admin.module.css';

export function CommunityModActions({ dropId }: { dropId: string }) {
  const [deleted, setDeleted]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [confirm, setConfirm]   = useState(false);
  const [isPending, startTransition] = useTransition();

  function remove() {
    if (!confirm) { setConfirm(true); return; }
    startTransition(async () => {
      const res = await adminDeleteDrop(dropId);
      if (res.error) { setError(res.error); setConfirm(false); }
      else setDeleted(true);
    });
  }

  if (deleted) {
    return <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#FF4444', letterSpacing: '0.08em' }}>DELETED</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className={styles.btnReject}
          style={confirm ? { background: 'rgba(255,68,68,0.2)', borderColor: 'rgba(255,68,68,0.5)' } : undefined}
        >
          {confirm ? 'CONFIRM' : '✕ DELETE'}
        </button>
        {confirm && (
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className={styles.btnDelete}
          >
            CANCEL
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#FF4444', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
