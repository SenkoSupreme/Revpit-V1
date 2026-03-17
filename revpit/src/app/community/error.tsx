'use client';

import { tokens } from '@/lib/design-tokens';

const { white, grey, accent, black } = tokens.colors;
const { display, body, mono } = tokens.fonts;

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CommunityError({ error, reset }: Props) {
  return (
    <div
      style={{
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        minHeight:       '60vh',
        backgroundColor: black,
        padding:         '40px',
        textAlign:       'center',
      }}
    >
      {/* Icon */}
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ marginBottom: 20, opacity: 0.6 }}>
        <circle cx="20" cy="20" r="18" stroke={grey[700]} strokeWidth="2" />
        <path d="M20 12v10M20 28v2" stroke={grey[500]} strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <h1
        style={{
          fontFamily:    display,
          fontSize:      32,
          letterSpacing: '0.04em',
          color:         white,
          marginBottom:  8,
          lineHeight:    1,
        }}
      >
        SOMETHING WENT WRONG
      </h1>

      <p
        style={{
          fontFamily:  body,
          fontSize:    13,
          color:       grey[300],
          marginBottom: 8,
          maxWidth:    420,
          lineHeight:  1.5,
        }}
      >
        {error.message || 'An unexpected error occurred loading this page.'}
      </p>

      {error.digest && (
        <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.08em', marginBottom: 28 }}>
          ERROR ID: {error.digest}
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        style={{
          height:          40,
          padding:         '0 28px',
          backgroundColor: accent,
          border:          'none',
          borderRadius:    0,
          fontFamily:      mono,
          fontSize:        11,
          fontWeight:      700,
          letterSpacing:   '0.1em',
          color:           black,
          cursor:          'pointer',
          textTransform:   'uppercase',
        }}
      >
        TRY AGAIN
      </button>
    </div>
  );
}
