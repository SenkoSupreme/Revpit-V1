'use client';

import { useState, useTransition } from 'react';
import { approveListing, rejectListing, adminDeleteListing } from '../actions';
import styles from '../admin.module.css';

type Props = {
  listingId:     string;
  currentStatus: string;
};

export function StoreModActions({ listingId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [error,  setError]  = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const res = await approveListing(listingId);
      if (res.error) setError(res.error);
      else setStatus('approved');
    });
  }

  function reject() {
    startTransition(async () => {
      const res = await rejectListing(listingId);
      if (res.error) setError(res.error);
      else setStatus('rejected');
    });
  }

  function remove() {
    if (!confirm('Permanently delete this listing?')) return;
    startTransition(async () => {
      const res = await adminDeleteListing(listingId);
      if (res.error) setError(res.error);
      // Row will disappear on next revalidation
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className={styles.actions}>
        {status !== 'approved' && (
          <button
            type="button"
            onClick={approve}
            disabled={isPending}
            className={styles.btnApprove}
          >
            ✓ APPROVE
          </button>
        )}
        {status !== 'rejected' && (
          <button
            type="button"
            onClick={reject}
            disabled={isPending}
            className={styles.btnReject}
          >
            ✕ REJECT
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className={styles.btnDelete}
        >
          DELETE
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#FF4444', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
