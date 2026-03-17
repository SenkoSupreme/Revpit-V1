/**
 * animations.ts — Single source of truth for all REVPIT motion values.
 * Import these constants instead of hardcoding durations/easings inline.
 */

// ─── Durations (ms) ───────────────────────────────────────────────────────────

export const DURATION = {
  /** Hover states, icon swaps */
  fast:   150,
  /** Card transitions, nav items */
  base:   250,
  /** Page-level entrances */
  slow:   400,
  /** Count-up numbers */
  countUp: 1200,
  /** Ring gauge draw */
  ring:   1400,
} as const;

// ─── Easing ───────────────────────────────────────────────────────────────────

export const EASING = {
  /** Standard material ease */
  standard:  'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Deceleration: entering elements */
  enter:     'cubic-bezier(0.0, 0.0, 0.2, 1)',
  /** Acceleration: exiting elements */
  exit:      'cubic-bezier(0.4, 0.0, 1, 1)',
  /** Spring — feels natural, slight overshoot */
  spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Fluid spring — Expo deceleration (sidebar, modals) */
  fluid:     'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// ─── Stagger delays (ms) for lists / grids ────────────────────────────────────

export const STAGGER = {
  /** Nav items, list rows */
  item:  40,
  /** Stat cards */
  card:  80,
  /** Page sections */
  section: 120,
} as const;

// ─── Transition strings (CSS shorthand) ──────────────────────────────────────

export const TRANSITION = {
  fast:   `${DURATION.fast}ms ${EASING.standard}`,
  base:   `${DURATION.base}ms ${EASING.standard}`,
  slow:   `${DURATION.slow}ms ${EASING.enter}`,
  spring: `${DURATION.base}ms ${EASING.spring}`,
  fluid:  `350ms ${EASING.fluid}`,
} as const;
