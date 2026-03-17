'use client';

/**
 * PageTransition — wraps page content with a fade-in + slide-up entrance.
 * Place inside the page component's return, around the outermost content div.
 * Animation runs once on mount via the `page-enter` keyframe in globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'page-enter 350ms ease-out both' }}>
      {children}
    </div>
  );
}
