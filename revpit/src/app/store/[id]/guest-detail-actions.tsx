'use client';

import { useState } from 'react';
import { AuthGateModal } from '@/components/auth-gate-modal';

export function GuestDetailActions() {
  const [open, setOpen] = useState(false);

  const accent  = '#C8FF00';
  const black   = '#0E0D0C';
  const grey500 = '#898882';
  const grey700 = '#504F4B';
  const mono    = '"JetBrains Mono", monospace';
  const body    = '"DM Sans", sans-serif';

  return (
    <>
      <div
        style={{
          padding:    '24px',
          border:     `1px solid rgba(200,255,0,0.12)`,
          background: 'rgba(200,255,0,0.03)',
          clipPath:   'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
        }}
      >
        <p style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: accent, margin: '0 0 8px' }}>
          ⬡ SIGN IN TO ACCESS
        </p>
        <p style={{ fontFamily: body, fontSize: 13, color: grey500, lineHeight: 1.55, margin: '0 0 20px' }}>
          Create a free account to view the full listing details, see the price,
          contact the seller, and list your own items.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
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
            marginBottom:  10,
          }}
        >
          JOIN NOW — IT&apos;S FREE →
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            width:         '100%',
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
            clipPath:      'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
          }}
        >
          ALREADY HAVE AN ACCOUNT? SIGN IN
        </button>
      </div>

      <AuthGateModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
