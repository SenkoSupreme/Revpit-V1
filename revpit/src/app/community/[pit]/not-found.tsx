import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';

const { white, grey, accent, black } = tokens.colors;
const { display, body, mono } = tokens.fonts;

export default function PitNotFound() {
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
      {/* Decorative */}
      <div
        style={{
          fontFamily:   '"JetBrains Mono", monospace',
          fontSize:     72,
          fontWeight:   700,
          color:        grey[700],
          lineHeight:   1,
          marginBottom: 16,
          letterSpacing: '0.04em',
          opacity:      0.4,
        }}
        aria-hidden="true"
      >
        404
      </div>

      <h1
        style={{
          fontFamily:    display,
          fontSize:      36,
          letterSpacing: '0.04em',
          color:         white,
          lineHeight:    1,
          marginBottom:  10,
        }}
      >
        PIT NOT FOUND
      </h1>

      <p
        style={{
          fontFamily:   body,
          fontSize:     13,
          color:        grey[300],
          maxWidth:     380,
          lineHeight:   1.55,
          marginBottom: 32,
        }}
      >
        This pit doesn&apos;t exist or may have been removed. Head back to the community to find your crew.
      </p>

      <Link
        href="/community"
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          height:          40,
          padding:         '0 28px',
          backgroundColor: accent,
          borderRadius:    0,
          fontFamily:      mono,
          fontSize:        11,
          fontWeight:      700,
          letterSpacing:   '0.1em',
          color:           black,
          textDecoration:  'none',
          textTransform:   'uppercase',
        }}
      >
        BACK TO COMMUNITY
      </Link>
    </div>
  );
}
