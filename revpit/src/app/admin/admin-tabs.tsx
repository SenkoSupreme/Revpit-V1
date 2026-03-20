'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

const TABS = [
  { label: 'Overview',   href: '/admin' },
  { label: 'Store',      href: '/admin/store' },
  { label: 'Community',  href: '/admin/community' },
  { label: 'Users',      href: '/admin/users' },
  { label: 'Action Log', href: '/admin/logs' },
] as const;

export function AdminTabs() {
  const pathname = usePathname();

  return (
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
  );
}
