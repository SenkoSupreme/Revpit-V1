export const tokens = {
  colors: {
    black:  '#0E0D0C',
    white:  '#F5F4F0',
    grey: {
      100: '#F0EFEB',
      300: '#C4C3BE',
      500: '#898882',
      700: '#504F4B',
      900: '#1E1D1B',
    },
    accent: '#C8FF00',
    error:  '#FF4444',
    success: '#00D68F',
  },
  fonts: {
    display: '"Bebas Neue", sans-serif',
    body:    '"DM Sans", sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  shadows: {
    card:       '0 2px 8px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.7)',
    raised:     '0 4px 16px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8)',
    accentSm:   '0 0 10px rgba(200,255,0,0.2)',
    accentMd:   '0 0 20px rgba(200,255,0,0.3)',
    accentLg:   '0 0 36px rgba(200,255,0,0.4), 0 0 8px rgba(200,255,0,0.2)',
  },
  transitions: {
    fast:   '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base:   '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow:   '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  radii: {
    sm:   3,
    md:   6,
    lg:   12,
    xl:   20,
    full: 9999,
  },
  spacing: {
    pagePad:    48,
    pagePadMob: 20,
    sectionGap: 32,
    cardGap:    16,
  },
} as const;

export type Tokens      = typeof tokens;
export type ColorToken  = typeof tokens.colors;
export type GreyScale   = typeof tokens.colors.grey;
export type FontToken   = typeof tokens.fonts;
export type ShadowToken = typeof tokens.shadows;
