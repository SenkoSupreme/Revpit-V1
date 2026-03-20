import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import styles from './admin.module.css';

export const metadata = { title: 'Overview — Admin — REVPIT' };

export default async function AdminOverviewPage() {
  const { grey, accent } = tokens.colors;
  const { display, mono, body } = tokens.fonts;
  const supabase = createAdminClient();

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingListings },
    { count: approvedListings },
    { count: rejectedListings },
    { count: totalDrops },
    { count: totalClubs },
    { data: recentListings },
    { data: recentDrops },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('store_listings').select('*', { count: 'exact', head: true }),
    supabase.from('store_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('store_listings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('store_listings').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('drops').select('*', { count: 'exact', head: true }),
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
    supabase.from('store_listings')
      .select('id, title, seller_username, status, created_at, price')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('drops')
      .select('id, title, author_id, created_at, rev_count')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles')
      .select('id, username, clerk_id, role, created_at')
      .order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: 'Total Users',       value: totalUsers ?? 0 },
    { label: 'Store Listings',     value: totalListings ?? 0 },
    { label: 'Pending Review',     value: pendingListings ?? 0, alert: (pendingListings ?? 0) > 0 },
    { label: 'Approved Listings',  value: approvedListings ?? 0 },
    { label: 'Community Drops',    value: totalDrops ?? 0 },
    { label: 'Active Clubs',       value: totalClubs ?? 0 },
  ];

  return (
    <PageTransition>
      <div className={styles.content}>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className={styles.statsGrid}>
          {stats.map(({ label, value, alert }) => (
            <div key={label} className={styles.statCard}>
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.3 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M0 0L13 0L13 13" stroke={alert ? '#FF4444' : '#C8FF00'} strokeWidth="1" fill="none" />
                </svg>
              </div>
              <p className={styles.statValue} style={{ color: alert ? '#FF4444' : accent }}>
                {value.toLocaleString()}
              </p>
              <p className={styles.statLabel} style={{ color: alert ? 'rgba(255,68,68,0.6)' : undefined }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Pending listings alert ─────────────────────────────────────── */}
        {(pendingListings ?? 0) > 0 && (
          <a
            href="/admin/store?status=pending"
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           12,
              padding:       '14px 18px',
              background:    'rgba(255,164,0,0.06)',
              border:        '1px solid rgba(255,164,0,0.25)',
              clipPath:      'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              marginBottom:  28,
              textDecoration: 'none',
              transition:    'background 150ms ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1L15 14H1L8 1Z" stroke="#F5A623" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6v4" stroke="#F5A623" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.8" fill="#F5A623" />
            </svg>
            <div>
              <p style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#F5A623', margin: '0 0 2px' }}>
                {pendingListings} LISTING{(pendingListings ?? 0) !== 1 ? 'S' : ''} AWAITING REVIEW
              </p>
              <p style={{ fontFamily: body, fontSize: 12, color: grey[500], margin: 0 }}>
                Click to review and approve or reject pending store listings.
              </p>
            </div>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden="true">
              <path d="M2 5h6M5 2l3 3-3 3" stroke="#F5A623" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {/* ── Three-column activity ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>

          {/* Recent listings */}
          <section>
            <div className={styles.sectionHeader}>
              <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
                RECENT LISTINGS
              </h2>
              <a href="/admin/store" style={{ fontFamily: mono, fontSize: 9, color: accent, textDecoration: 'none', letterSpacing: '0.1em' }}>
                VIEW ALL →
              </a>
            </div>
            {(recentListings?.length ?? 0) === 0 ? (
              <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>NO LISTINGS YET</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentListings!.map((l: { id: string; title: string; seller_username: string; status: string; price: number }) => (
                  <a
                    key={l.id}
                    href={`/admin/store`}
                    style={{
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      gap:            10,
                      padding:        '10px 12px',
                      background:     '#1C1B19',
                      border:         '1px solid rgba(200,255,0,0.06)',
                      clipPath:       'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: body, fontSize: 12, color: '#C4C3BE', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.title}
                      </p>
                      <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], margin: 0, letterSpacing: '0.06em' }}>
                        @{l.seller_username}
                      </p>
                    </div>
                    <span className={`${styles.badge} ${l.status === 'pending' ? styles.badgePending : l.status === 'approved' ? styles.badgeApproved : styles.badgeRejected}`}>
                      {l.status}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Recent drops */}
          <section>
            <div className={styles.sectionHeader}>
              <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
                RECENT DROPS
              </h2>
              <a href="/admin/community" style={{ fontFamily: mono, fontSize: 9, color: accent, textDecoration: 'none', letterSpacing: '0.1em' }}>
                VIEW ALL →
              </a>
            </div>
            {(recentDrops?.length ?? 0) === 0 ? (
              <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>NO DROPS YET</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentDrops!.map((d: { id: string; title: string; rev_count: number }) => (
                  <div
                    key={d.id}
                    style={{
                      display:  'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap:      10,
                      padding:  '10px 12px',
                      background: '#1C1B19',
                      border:   '1px solid rgba(200,255,0,0.06)',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                    }}
                  >
                    <p style={{ fontFamily: body, fontSize: 12, color: '#C4C3BE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.title}
                    </p>
                    <span style={{ fontFamily: mono, fontSize: 9, color: accent, letterSpacing: '0.06em', flexShrink: 0 }}>
                      {d.rev_count} REV
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent users */}
          <section>
            <div className={styles.sectionHeader}>
              <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
                NEW USERS
              </h2>
              <a href="/admin/users" style={{ fontFamily: mono, fontSize: 9, color: accent, textDecoration: 'none', letterSpacing: '0.1em' }}>
                VIEW ALL →
              </a>
            </div>
            {(recentUsers?.length ?? 0) === 0 ? (
              <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>NO USERS YET</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentUsers!.map((u: { id: string; username: string; clerk_id: string; role: string }) => (
                  <div
                    key={u.id}
                    style={{
                      display:  'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap:      10,
                      padding:  '10px 12px',
                      background: '#1C1B19',
                      border:   '1px solid rgba(200,255,0,0.06)',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                    }}
                  >
                    <p style={{ fontFamily: mono, fontSize: 11, color: '#C4C3BE', margin: 0 }}>
                      @{u.username}
                    </p>
                    <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : u.role === 'moderator' ? styles.badgeMod : styles.badgeUser}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
