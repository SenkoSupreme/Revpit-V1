import Link from 'next/link';
import { headers } from 'next/headers';
import AppSidebar from '@/components/app-sidebar';
import { requireModerator } from '@/lib/roles';
import { tokens } from '@/lib/design-tokens';
import styles from './admin.module.css';

export const metadata = { title: 'Admin Panel — REVPIT' };

const TABS = [
  { label: 'Overview',  href: '/admin' },
  { label: 'Store',     href: '/admin/store' },
  { label: 'Community', href: '/admin/community' },
  { label: 'Users',     href: '/admin/users' },
  { label: 'Action Log', href: '/admin/logs' },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Gate: redirects to 404 if not moderator or admin
  const role = await requireModerator();

  const { black, white, grey, accent } = tokens.colors;
  const { display, mono }              = tokens.fonts;

  // Detect current path for active tab
  const headersList = await headers();
  const pathname    = headersList.get('x-pathname') ?? '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: black }}>
      <AppSidebar />
      <main className="rp-main-content" style={{ flex: 1, minWidth: 0 }}>

        {/* ── Admin header ──────────────────────────────────────────────── */}
        <div
          style={{
            position:     'relative',
            background:   'linear-gradient(135deg, #0E0D0C 0%, #0D0C0B 100%)',
            borderBottom: `1px solid rgba(200,255,0,0.08)`,
            padding:      '24px 48px 0',
            overflow:     'hidden',
          }}
        >
          <div aria-hidden="true" className="cyber-grid-bg"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {/* Shield icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L2 3.5v4C2 10.5 4.5 12.5 7 13c2.5-.5 5-2.5 5-5.5v-4L7 1z"
                  stroke={accent} strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M4.5 7l1.5 1.5L9 5.5" stroke={accent} strokeWidth="1.3"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', color: accent }}>
                REVPIT · ADMIN PANEL
              </span>
              <span
                style={{
                  fontFamily:    mono,
                  fontSize:      8,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  color:         role === 'admin' ? accent : grey[500],
                  background:    role === 'admin' ? 'rgba(200,255,0,0.1)' : 'transparent',
                  border:        `1px solid ${role === 'admin' ? 'rgba(200,255,0,0.25)' : grey[700]}`,
                  padding:       '2px 8px',
                  clipPath:      'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
                }}
              >
                {role.toUpperCase()}
              </span>
            </div>

            <h1
              style={{
                fontFamily:    display,
                fontSize:      'clamp(24px, 3vw, 36px)',
                letterSpacing: '0.03em',
                color:         white,
                lineHeight:    0.95,
                margin:        '0 0 16px',
              }}
            >
              CONTROL PANEL
            </h1>
          </div>

          {/* Sub-nav tabs */}
          <nav className={styles.tabs} aria-label="Admin sections" style={{ padding: 0 }}>
            {TABS.map(({ label, href }) => {
              const isActive = href === '/admin'
                ? pathname === '/admin' || pathname === '/admin/'
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Page content ──────────────────────────────────────────────── */}
        {children}
      </main>
    </div>
  );
}
