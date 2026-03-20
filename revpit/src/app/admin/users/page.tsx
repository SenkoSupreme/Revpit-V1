import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentRole } from '@/lib/roles';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import { SetRoleForm, GrantEmailForm } from './user-role-forms';
import styles from '../admin.module.css';

export const metadata = { title: 'User Management — Admin — REVPIT' };

type Profile = {
  id:         string;
  clerk_id:   string;
  username:   string;
  email:      string | null;
  role:       string;
  score:      number;
  tier:       string | null;
  created_at: string;
};

type Assignment = {
  id:         string;
  email:      string;
  role:       string;
  created_at: string;
};

export default async function AdminUsersPage() {
  // Admin-only page
  const currentRole = await getCurrentRole();
  const isAdmin     = currentRole === 'admin';

  const { grey, accent } = tokens.colors;
  const { display, mono, body } = tokens.fonts;
  const supabase = createAdminClient();

  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, clerk_id, username, email, role, score, tier, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('role_assignments')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const users       = (profiles   as Profile[]    | null) ?? [];
  const roleGrants  = (assignments as Assignment[] | null) ?? [];
  const elevated    = users.filter(u => u.role !== 'user');

  return (
    <PageTransition>
      <div className={styles.content}>

        {/* Admin-only gate notice for moderators */}
        {!isAdmin && (
          <div style={{ padding: '12px 16px', border: '1px solid rgba(245,166,35,0.25)', background: 'rgba(245,166,35,0.05)', marginBottom: 24, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
            <p style={{ fontFamily: mono, fontSize: 9, color: '#F5A623', letterSpacing: '0.12em', margin: 0 }}>
              MODERATORS CAN VIEW USERS BUT CANNOT CHANGE ROLES — ADMIN ONLY
            </p>
          </div>
        )}

        {/* ── Elevated users ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 36 }}>
          <div className={styles.sectionHeader}>
            <h2 style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
              ELEVATED ROLES
            </h2>
            <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
              {elevated.length} ADMIN / MOD
            </span>
          </div>

          {elevated.length === 0 ? (
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
              NO ELEVATED USERS
            </p>
          ) : (
            <div style={{ overflowX: 'auto', marginBottom: 0 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Username</th>
                    <th className={styles.th}>Email</th>
                    <th className={styles.th}>Clerk ID</th>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>Score</th>
                    {isAdmin && <th className={styles.th}>Change Role</th>}
                  </tr>
                </thead>
                <tbody>
                  {elevated.map((u) => (
                    <tr key={u.id} className={styles.tr}>
                      <td className={styles.td}>
                        <span style={{ fontFamily: mono, fontSize: 11, color: '#F5F4F0' }}>@{u.username}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>{u.email ?? '—'}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontFamily: mono, fontSize: 9, color: grey[700] }}>{u.clerk_id.slice(0, 18)}…</span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeMod}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontFamily: mono, fontSize: 10, color: accent }}>{u.score.toLocaleString()}</span>
                      </td>
                      {isAdmin && (
                        <td className={styles.td}>
                          <SetRoleForm clerkId={u.clerk_id} currentRole={u.role} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Role assignments (pre-grants) ──────────────────────────────── */}
        {isAdmin && (
          <section style={{ marginBottom: 36 }}>
            <div className={styles.sectionHeader}>
              <h2 style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
                PRE-GRANTED ROLES
              </h2>
              <span style={{ fontFamily: mono, fontSize: 9, color: grey[500], letterSpacing: '0.1em' }}>
                Applied automatically on sign-in
              </span>
            </div>

            <p style={{ fontFamily: body, fontSize: 13, color: grey[500], marginBottom: 16, lineHeight: 1.6 }}>
              Grant roles by email before the user signs up. The role is applied automatically the first time they authenticate.
            </p>

            <GrantEmailForm />

            {roleGrants.length > 0 && (
              <div style={{ overflowX: 'auto', marginTop: 20 }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Role</th>
                      <th className={styles.th}>Granted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleGrants.map((g) => (
                      <tr key={g.id} className={styles.tr}>
                        <td className={styles.td}>
                          <span style={{ fontFamily: mono, fontSize: 10, color: grey[300] }}>{g.email}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.badge} ${g.role === 'admin' ? styles.badgeAdmin : styles.badgeMod}`}>
                            {g.role}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span style={{ fontFamily: mono, fontSize: 9, color: grey[700] }}>
                            {new Date(g.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── All users ──────────────────────────────────────────────────── */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
              ALL USERS
            </h2>
            <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
              {users.length} TOTAL
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Username</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Score</th>
                  <th className={styles.th}>Joined</th>
                  {isAdmin && <th className={styles.th}>Set Role</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={styles.tr}>
                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 11, color: '#F5F4F0' }}>@{u.username}</span>
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>{u.email ?? '—'}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : u.role === 'moderator' ? styles.badgeMod : styles.badgeUser}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: accent }}>{u.score.toLocaleString()}</span>
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], whiteSpace: 'nowrap' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className={styles.td}>
                        <SetRoleForm clerkId={u.clerk_id} currentRole={u.role} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
