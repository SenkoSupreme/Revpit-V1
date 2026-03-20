'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { markAsSold, deleteListing } from '../actions';
import type { StoreListing } from '../page';

type Props = {
  listing:  StoreListing;
  isOwner:  boolean;
  isLocked: boolean;
  isSold:   boolean;
};

export function ListingActions({ listing, isOwner, isLocked, isSold }: Props) {
  const [, startTransition] = useTransition();
  const [error, setError]   = useState<string | null>(null);
  const [sold,  setSold]    = useState(isSold);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const accent = '#C8FF00';
  const black  = '#0E0D0C';
  const grey500 = '#898882';
  const grey700 = '#504F4B';
  const mono   = '"JetBrains Mono", monospace';
  const body   = '"DM Sans", sans-serif';

  function handleMarkSold() {
    startTransition(async () => {
      const res = await markAsSold(listing.id);
      if (res.error) setError(res.error);
      else setSold(true);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteListing(listing.id);
      if (res.error) setError(res.error);
    });
  }

  // ── Member gate ──────────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div
        style={{
          padding:   '20px',
          border:    `1px solid rgba(200,255,0,0.1)`,
          background: 'rgba(200,255,0,0.03)',
          clipPath:  'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
        }}
      >
        <p style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: accent, margin: '0 0 6px' }}>
          ★ EXCLUSIVE LISTING
        </p>
        <p style={{ fontFamily: body, fontSize: 13, color: grey500, margin: '0 0 14px', lineHeight: 1.55 }}>
          This listing is available to club members and subscribed accounts only.
          Join a club or upgrade your account to access exclusive drops.
        </p>
        <Link
          href="/clubs"
          style={{
            display:         'inline-block',
            height:          40,
            lineHeight:      '40px',
            padding:         '0 20px',
            background:      accent,
            color:           black,
            fontFamily:      mono,
            fontSize:        10,
            fontWeight:      700,
            letterSpacing:   '0.12em',
            textTransform:   'uppercase',
            textDecoration:  'none',
            clipPath:        'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
          }}
        >
          FIND A CLUB
        </Link>
      </div>
    );
  }

  // ── Sold state ───────────────────────────────────────────────────────────────
  if (sold) {
    return (
      <div style={{ padding: '16px', border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.04)' }}>
        <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', color: '#FF4444', margin: 0 }}>
          THIS ITEM HAS BEEN SOLD
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && (
        <p style={{ fontFamily: body, fontSize: 13, color: '#FF4444', margin: 0 }}>{error}</p>
      )}

      {/* Buyer CTA — payment placeholder */}
      {!isOwner && (
        <div>
          <button
            type="button"
            style={{
              width:         '100%',
              height:        50,
              background:    accent,
              color:         black,
              fontFamily:    mono,
              fontSize:      12,
              fontWeight:    700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              border:        'none',
              cursor:        'pointer',
              clipPath:      'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              marginBottom:  8,
            }}
            onClick={() => alert('Payment integration coming soon — contact the seller directly via their profile.')}
          >
            CONTACT SELLER
          </button>

          {/* Payment placeholder notice */}
          <div
            style={{
              padding:   '10px 12px',
              background: 'rgba(200,255,0,0.03)',
              border:    `1px solid rgba(200,255,0,0.08)`,
              clipPath:  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.12em', color: grey700, margin: '0 0 3px', fontWeight: 700 }}>
              ◈ STRIPE · PAYPAL — COMING SOON
            </p>
            <p style={{ fontFamily: body, fontSize: 11, color: grey700, margin: 0, lineHeight: 1.5 }}>
              Direct payment is on the way. For now, reach out to the seller to arrange a transaction.
            </p>
          </div>
        </div>
      )}

      {/* Owner controls */}
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey700, margin: 0 }}>
            YOUR LISTING
          </p>

          <button
            type="button"
            onClick={handleMarkSold}
            style={{
              height:        44,
              background:    'transparent',
              color:         grey500,
              fontFamily:    mono,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border:        `1px solid ${grey700}`,
              cursor:        'pointer',
              clipPath:      'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              transition:    'border-color 150ms ease, color 150ms ease',
            }}
          >
            MARK AS SOLD
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{
                height:        44,
                background:    'transparent',
                color:         '#FF4444',
                fontFamily:    mono,
                fontSize:      10,
                fontWeight:    700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border:        '1px solid rgba(255,68,68,0.3)',
                cursor:        'pointer',
                clipPath:      'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              }}
            >
              DELETE LISTING
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex:          1,
                  height:        44,
                  background:    'rgba(255,68,68,0.15)',
                  color:         '#FF4444',
                  fontFamily:    mono,
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.12em',
                  border:        '1px solid rgba(255,68,68,0.4)',
                  cursor:        'pointer',
                  clipPath:      'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                CONFIRM DELETE
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                style={{
                  flex:          1,
                  height:        44,
                  background:    'transparent',
                  color:         grey500,
                  fontFamily:    mono,
                  fontSize:      10,
                  letterSpacing: '0.12em',
                  border:        `1px solid ${grey700}`,
                  cursor:        'pointer',
                  clipPath:      'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
