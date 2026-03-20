'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono } = tokens.fonts;

type Props = {
  isOpen:  boolean;
  onClose: () => void;
};

export function AuthGateModal({ isOpen, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     'rgba(14,13,12,0.85)',
        backdropFilter: 'blur(8px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position:  'relative',
          width:     '100%',
          maxWidth:  440,
          background: 'linear-gradient(135deg, #1C1B19 0%, #141312 100%)',
          border:    `1px solid rgba(200,255,0,0.15)`,
          clipPath:  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
          padding:   '40px 36px 36px',
          overflow:  'hidden',
        }}
      >
        {/* Corner accent */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.5 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M0 0L20 0L20 20" stroke={accent} strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Cyber grid bg */}
        <div className="cyber-grid-bg" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   'absolute',
            top:        16,
            right:      24,
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            color:      grey[700],
            fontFamily: mono,
            fontSize:   18,
            lineHeight: 1,
            padding:    4,
            transition: 'color 150ms ease',
          }}
        >
          ×
        </button>

        {/* Lock icon */}
        <div
          style={{
            width:           52,
            height:          52,
            borderRadius:    '50%',
            background:      `${accent}12`,
            border:          `1px solid ${accent}30`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            marginBottom:    24,
            position:        'relative',
            zIndex:          1,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="3" y="9" width="16" height="11" rx="2" stroke={accent} strokeWidth="1.5" />
            <path d="M6 9V7a5 5 0 0110 0v2" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="15" r="1.5" fill={accent} />
          </svg>
        </div>

        {/* Heading */}
        <p
          style={{
            fontFamily:    mono,
            fontSize:      9,
            letterSpacing: '0.24em',
            color:         accent,
            marginBottom:  10,
            position:      'relative',
            zIndex:        1,
          }}
        >
          PIT MARKET ACCESS
        </p>
        <h2
          style={{
            fontFamily:    display,
            fontSize:      'clamp(28px, 4vw, 36px)',
            letterSpacing: '0.04em',
            color:         white,
            lineHeight:    0.95,
            margin:        '0 0 16px',
            position:      'relative',
            zIndex:        1,
          }}
        >
          JOIN TO VIEW
          <br />
          <span style={{ color: accent }}>FULL DETAILS</span>
        </h2>

        <p
          style={{
            fontFamily:  body,
            fontSize:    14,
            color:       grey[500],
            lineHeight:  1.65,
            marginBottom: 32,
            position:    'relative',
            zIndex:      1,
          }}
        >
          Create a free account to view listing details, contact sellers,
          and list your own items on the Pit Market.
        </p>

        {/* Perks */}
        <div
          style={{
            display:      'flex',
            flexDirection: 'column',
            gap:          8,
            marginBottom: 32,
            position:     'relative',
            zIndex:       1,
          }}
        >
          {[
            'View prices & full descriptions',
            'Contact sellers directly',
            'List your own items',
            'Access exclusive member drops',
          ].map((perk) => (
            <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: accent, fontFamily: mono, fontSize: 11, flexShrink: 0 }}>⬡</span>
              <span style={{ fontFamily: body, fontSize: 13, color: grey[500] }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
          <Link
            href="/sign-up"
            style={{
              flex:          1,
              display:       'inline-flex',
              alignItems:    'center',
              justifyContent: 'center',
              height:        48,
              background:    accent,
              color:         black,
              fontFamily:    mono,
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: '0.14em',
              textDecoration: 'none',
              clipPath:      'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
              transition:    'opacity 150ms ease',
            }}
          >
            JOIN NOW →
          </Link>
          <Link
            href="/sign-in"
            style={{
              flex:          1,
              display:       'inline-flex',
              alignItems:    'center',
              justifyContent: 'center',
              height:        48,
              background:    'transparent',
              color:         grey[300],
              border:        `1px solid ${grey[700]}`,
              fontFamily:    mono,
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: '0.14em',
              textDecoration: 'none',
              clipPath:      'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
              transition:    'border-color 150ms ease, color 150ms ease',
            }}
          >
            SIGN IN
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
