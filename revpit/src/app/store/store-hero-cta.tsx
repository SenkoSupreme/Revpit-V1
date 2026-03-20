'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthGateModal } from '@/components/auth-gate-modal';
import styles from './store.module.css';

type Props = {
  userId:       string | null;
  isMember:     boolean;
  exclusiveOnly: boolean;
};

export function StoreHeroCTA({ userId, isMember, exclusiveOnly }: Props) {
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {userId ? (
          <Link href="/store/new" className={styles.sellBtn}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            LIST AN ITEM
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            className={styles.sellBtn}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            LIST AN ITEM
          </button>
        )}

        {isMember && (
          <Link
            href={exclusiveOnly ? '/store' : '/store?exclusive=1'}
            className={styles.chip}
            style={exclusiveOnly ? { background: '#C8FF00', color: '#0E0D0C', borderColor: '#C8FF00' } : {}}
          >
            ★ MEMBERS ONLY
          </Link>
        )}
      </div>

      <AuthGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} />
    </>
  );
}
