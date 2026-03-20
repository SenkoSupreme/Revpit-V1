'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  User,
  Trophy,
  Users,
  MessageSquare,
  Zap,
  Flag,
  Settings,
  Menu,
  X,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import styles from './sidebar-client.module.css';
import { tokens } from '@/lib/design-tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarProfile = {
  username:    string;
  score:       number;
  global_rank: number | null;
} | null;

export type SidebarRole = 'user' | 'moderator' | 'admin';

type NavItem = {
  label: string;
  href:  string;
  icon:  LucideIcon;
};

// ─── Nav config ───────────────────────────────────────────────────────────────

/** Always visible — no auth required */
const PUBLIC_NAV: NavItem[] = [
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy        },
  { label: 'Clubs',       href: '/clubs',       icon: Users         },
  { label: 'Community',   href: '/community',   icon: MessageSquare },
  { label: 'Pit Market',  href: '/store',       icon: ShoppingBag   },
];

/** Visible only when signed in */
const AUTH_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'My Profile', href: '/profile',    icon: User            },
  { label: 'Quests',     href: '/quests',     icon: Zap             },
  { label: 'Challenges', href: '/challenges', icon: Flag            },
];

const SETTINGS_NAV: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Admin Panel', href: '/admin', icon: ShieldCheck },
];

const { white, grey } = tokens.colors;

// ─── Component ────────────────────────────────────────────────────────────────

export function SidebarClient({ profile, role = 'user' }: { profile: SidebarProfile; role?: SidebarRole }) {
  const pathname   = usePathname();
  const [mounted,    setMounted]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Trigger entrance animations after hydration
  useEffect(() => { setMounted(true); }, []);

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const initials = profile?.username.slice(0, 2).toUpperCase() ?? '??';

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  // ── Shared sidebar styles ────────────────────────────────────────────────────
  const sidebarStyle: React.CSSProperties = {
    width:           220,
    backgroundColor: grey[900],
    borderRight:     '1px solid rgba(255,255,255,0.08)',
    display:         'flex',
    flexDirection:   'column',
    height:          '100vh',
  };

  // ── Logo section ─────────────────────────────────────────────────────────────
  const logoSection = (
    <div style={{ flexShrink: 0 }}>
      <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'flex-start' }}>
        <Link href={profile ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/images/side_nav_logo.png"
            alt="REVPIT"
            width={400}
            height={100}
            style={{
              height:    '52px',
              width:     'auto',
              objectFit: 'contain',
              display:   'block',
            }}
            priority
          />
        </Link>
      </div>
      {/* Lime glow divider */}
      <div className="sidebar-glow-line" />
    </div>
  );

  // ── Nav section ──────────────────────────────────────────────────────────────
  const allMainNav = profile
    ? [...AUTH_NAV, ...PUBLIC_NAV]
    : PUBLIC_NAV;

  const navSection = (
    <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }} aria-label="Main navigation">
      {allMainNav.map(({ label, href, icon: Icon }, idx) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={active ? styles.navItemActive : styles.navItem}
            aria-current={active ? 'page' : undefined}
            style={mounted ? { animation: `rp-slide-in-left 280ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 35}ms both` } : { opacity: 0 }}
          >
            <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </Link>
        );
      })}

      {profile && (
        <>
          <div className={styles.navDivider} />
          {SETTINGS_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={active ? styles.navItemActive : styles.navItem}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            );
          })}

          {/* Admin / Moderator panel link */}
          {(role === 'admin' || role === 'moderator') && (
            <>
              <div className={styles.navDivider} />
              {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={active ? styles.navItemActive : styles.navItem}
                    aria-current={active ? 'page' : undefined}
                    style={{ color: active ? undefined : '#C8FF00', opacity: active ? 1 : 0.85 }}
                  >
                    <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                    {label}
                    {role === 'admin' && (
                      <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#C8FF00', background: 'rgba(200,255,0,0.1)', border: '1px solid rgba(200,255,0,0.25)', padding: '1px 5px', marginLeft: 'auto', clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)' }}>ADMIN</span>
                    )}
                    {role === 'moderator' && (
                      <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#898882', border: '1px solid #504F4B', padding: '1px 5px', marginLeft: 'auto', clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)' }}>MOD</span>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </>
      )}
    </nav>
  );

  // ── User card section ────────────────────────────────────────────────────────
  const userSection = (
    <div
      className={mounted ? styles.userCard : undefined}
      style={{
        borderTop:  '1px solid rgba(255,255,255,0.08)',
        padding:    '14px 16px',
        flexShrink: 0,
      }}
    >
      {profile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar */}
          <div
            className="avatar-glow"
            style={{
              width:           34,
              height:          34,
              borderRadius:    '50%',
              backgroundColor: 'rgba(200,255,0,0.08)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontFamily:      'var(--font-mono)',
              fontSize:        11,
              fontWeight:      700,
              color:           '#C8FF00',
              flexShrink:      0,
            }}
          >
            {initials}
          </div>

          {/* Info */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontFamily:   'var(--font-body)',
                fontSize:     13,
                fontWeight:   600,
                color:        white,
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
                margin:       0,
                lineHeight:   1.3,
              }}
            >
              {profile.username}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
              <span
                className="score-pulse"
                style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      11,
                  color:         '#C8FF00',
                  letterSpacing: '0.04em',
                }}
              >
                {profile.score.toLocaleString()} pts
              </span>
              <span
                style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      10,
                  color:         '#6B6860',
                  letterSpacing: '0.04em',
                }}
              >
                {profile.global_rank != null ? `#${profile.global_rank} GLOBAL` : 'UNRANKED'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <Link href="/sign-in" className={styles.signInBtn}>
          SIGN IN
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (sticky, always visible ≥768px) ───────────────────── */}
      <aside
        className={`${styles.desktopSidebar} ${mounted ? styles.sidebarVisible : styles.sidebarHidden}`}
        style={{ ...sidebarStyle, position: 'sticky', top: 0 }}
      >
        {logoSection}
        {navSection}
        {userSection}
      </aside>

      {/* ── Mobile: hamburger button (fixed, top-left) ────────────────────────── */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile: backdrop overlay ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: sliding sidebar ───────────────────────────────────────────── */}
      <aside
        className={`${styles.mobileSidebar} ${mobileOpen ? styles.mobileSidebarOpen : ''}`}
        style={sidebarStyle}
        aria-hidden={!mobileOpen}
        aria-label="Navigation menu"
      >
        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={14} />
        </button>

        {logoSection}
        {navSection}
        {userSection}
      </aside>
    </>
  );
}
