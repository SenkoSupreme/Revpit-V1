import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import styles from '../admin.module.css';

export const metadata = { title: 'Action Log — Admin — REVPIT' };

type LogEntry = {
  id:             string;
  actor_id:       string;
  actor_username: string;
  actor_email:    string | null;
  actor_role:     string;
  action:         string;
  target_type:    string | null;
  target_id:      string | null;
  target_label:   string | null;
  created_at:     string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  APPROVE_LISTING:     { label: '✓ APPROVED LISTING',      color: '#00D68F', bg: 'rgba(0,214,143,0.08)',   border: 'rgba(0,214,143,0.2)'   },
  REJECT_LISTING:      { label: '✕ REJECTED LISTING',      color: '#FF4444', bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.2)'   },
  DELETE_LISTING:      { label: '🗑 DELETED LISTING',       color: '#FF4444', bg: 'rgba(255,68,68,0.06)',   border: 'rgba(255,68,68,0.15)'  },
  DELETE_DROP:         { label: '🗑 DELETED DROP',          color: '#FF6B35', bg: 'rgba(255,107,53,0.07)',  border: 'rgba(255,107,53,0.2)'  },
  DELETE_REPLY:        { label: '🗑 DELETED REPLY',         color: '#FF6B35', bg: 'rgba(255,107,53,0.05)',  border: 'rgba(255,107,53,0.15)' },
  SET_ROLE:            { label: '⬡ ROLE CHANGED',           color: '#C8FF00', bg: 'rgba(200,255,0,0.06)',   border: 'rgba(200,255,0,0.2)'   },
  GRANT_ROLE_BY_EMAIL: { label: '⬡ ROLE PRE-GRANTED',      color: '#C8FF00', bg: 'rgba(200,255,0,0.05)',   border: 'rgba(200,255,0,0.15)'  },
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hrs   = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hrs  < 24)   return `${hrs}h ago`;
  if (days < 7)    return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

type SearchParams = Promise<{ actor?: string; action?: string }>;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminLogsPage(props: { searchParams: SearchParams }) {
  const { grey, accent } = tokens.colors;
  const { display, mono, body } = tokens.fonts;

  const sp          = await props.searchParams;
  const filterActor  = sp.actor?.trim() ?? '';
  const filterAction = sp.action?.trim() ?? '';

  const supabase = createAdminClient();

  let query = supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (filterActor)  query = query.ilike('actor_username', `%${filterActor}%`);
  if (filterAction) query = query.eq('action', filterAction);

  const { data } = await query;
  const logs = (data as LogEntry[] | null) ?? [];

  // Total counts per actor for the summary strip
  const { data: actorSummary } = await supabase
    .from('admin_logs')
    .select('actor_username, actor_email, actor_role');

  type ActorRow = { actor_username: string; actor_email: string | null; actor_role: string };
  const actorCounts: Record<string, { username: string; email: string | null; role: string; count: number }> = {};
  for (const row of (actorSummary as ActorRow[] | null) ?? []) {
    if (!actorCounts[row.actor_username]) {
      actorCounts[row.actor_username] = { username: row.actor_username, email: row.actor_email, role: row.actor_role, count: 0 };
    }
    actorCounts[row.actor_username].count++;
  }
  const topActors = Object.values(actorCounts).sort((a, b) => b.count - a.count).slice(0, 6);

  const ACTION_KEYS = Object.keys(ACTION_META);

  return (
    <PageTransition>
      <div className={styles.content}>

        {/* ── Filter bar ────────────────────────────────────────────────── */}
        <form method="GET" action="/admin/logs" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className={styles.th} style={{ padding: 0, borderBottom: 'none' }}>Filter by Moderator</span>
            <input
              name="actor"
              defaultValue={filterActor}
              placeholder="username..."
              className={styles.formInput}
              style={{ minWidth: 180 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className={styles.th} style={{ padding: 0, borderBottom: 'none' }}>Filter by Action</span>
            <select name="action" defaultValue={filterAction} className={styles.formSelect} style={{ minWidth: 200 }}>
              <option value="">All Actions</option>
              {ACTION_KEYS.map((key) => (
                <option key={key} value={key}>{ACTION_META[key].label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.formBtn}>FILTER</button>
          {(filterActor || filterAction) && (
            <a
              href="/admin/logs"
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                height:        36,
                padding:       '0 14px',
                fontFamily:    mono,
                fontSize:      10,
                letterSpacing: '0.1em',
                color:         grey[500],
                border:        `1px solid ${grey[700]}`,
                textDecoration: 'none',
                clipPath:      'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}
            >
              CLEAR
            </a>
          )}
        </form>

        {/* ── Top actors summary ────────────────────────────────────────── */}
        {topActors.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', color: grey[700], marginBottom: 10, textTransform: 'uppercase' }}>
              MOD ACTIVITY SUMMARY
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {topActors.map(({ username, email, role, count }) => (
                <a
                  key={username}
                  href={`/admin/logs?actor=${username}`}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            10,
                    padding:        '10px 14px',
                    background:     '#1C1B19',
                    border:         `1px solid rgba(200,255,0,0.06)`,
                    clipPath:       'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                    textDecoration: 'none',
                    minWidth:       180,
                  }}
                >
                  {/* Avatar initial */}
                  <div
                    style={{
                      width:          30,
                      height:         30,
                      borderRadius:   '50%',
                      background:     role === 'admin' ? 'rgba(200,255,0,0.12)' : 'rgba(196,195,190,0.06)',
                      border:         `1px solid ${role === 'admin' ? 'rgba(200,255,0,0.3)' : '#504F4B'}`,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontFamily:     mono,
                      fontSize:       11,
                      fontWeight:     700,
                      color:          role === 'admin' ? accent : grey[500],
                      flexShrink:     0,
                    }}
                  >
                    {username[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div>
                    <p style={{ fontFamily: mono, fontSize: 10, color: '#F5F4F0', margin: 0 }}>@{username}</p>
                    <p style={{ fontFamily: mono, fontSize: 8, color: grey[700], margin: '2px 0 0', letterSpacing: '0.06em' }}>
                      {email ?? '—'}
                    </p>
                  </div>

                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ fontFamily: display, fontSize: 20, color: role === 'admin' ? accent : grey[300], margin: 0, lineHeight: 1 }}>{count}</p>
                    <p style={{ fontFamily: mono, fontSize: 7, color: grey[700], margin: 0, letterSpacing: '0.1em' }}>ACTIONS</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Log count ─────────────────────────────────────────────────── */}
        <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em', marginBottom: 16 }}>
          {logs.length} LOG ENTR{logs.length !== 1 ? 'IES' : 'Y'}
          {(filterActor || filterAction) ? ' (FILTERED)' : ''}
        </p>

        {/* ── Log table ─────────────────────────────────────────────────── */}
        {logs.length === 0 ? (
          <div className={styles.empty}>
            <p style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.06em', color: grey[700], margin: '0 0 6px' }}>
              NO LOGS YET
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
              ACTIONS ARE RECORDED HERE AS THEY HAPPEN
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>When</th>
                  <th className={styles.th}>Moderator</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Action</th>
                  <th className={styles.th}>Target</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => {
                  const meta = ACTION_META[entry.action];

                  return (
                    <tr key={entry.id} className={styles.tr}>

                      {/* When */}
                      <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                        <span
                          title={new Date(entry.created_at).toLocaleString()}
                          style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.06em' }}
                        >
                          {formatRelative(entry.created_at)}
                        </span>
                        <br />
                        <span style={{ fontFamily: mono, fontSize: 8, color: grey[700], opacity: 0.6 }}>
                          {new Date(entry.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Moderator */}
                      <td className={styles.td}>
                        <a
                          href={`/admin/logs?actor=${entry.actor_username}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width:          26,
                                height:         26,
                                borderRadius:   '50%',
                                background:     entry.actor_role === 'admin' ? 'rgba(200,255,0,0.1)' : 'rgba(196,195,190,0.05)',
                                border:         `1px solid ${entry.actor_role === 'admin' ? 'rgba(200,255,0,0.25)' : '#504F4B'}`,
                                display:        'flex',
                                alignItems:     'center',
                                justifyContent: 'center',
                                fontFamily:     mono,
                                fontSize:       9,
                                fontWeight:     700,
                                color:          entry.actor_role === 'admin' ? accent : grey[500],
                                flexShrink:     0,
                              }}
                            >
                              {entry.actor_username[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span style={{ fontFamily: mono, fontSize: 10, color: '#F5F4F0' }}>
                              @{entry.actor_username}
                            </span>
                          </div>
                        </a>
                      </td>

                      {/* Email */}
                      <td className={styles.td}>
                        <span style={{ fontFamily: mono, fontSize: 9, color: grey[500] }}>
                          {entry.actor_email ?? '—'}
                        </span>
                      </td>

                      {/* Role */}
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${
                            entry.actor_role === 'admin' ? styles.badgeAdmin :
                            entry.actor_role === 'moderator' ? styles.badgeMod :
                            styles.badgeUser
                          }`}
                        >
                          {entry.actor_role}
                        </span>
                      </td>

                      {/* Action */}
                      <td className={styles.td}>
                        <span
                          style={{
                            display:       'inline-block',
                            fontFamily:    mono,
                            fontSize:      8,
                            fontWeight:    700,
                            letterSpacing: '0.08em',
                            padding:       '3px 9px',
                            color:         meta?.color   ?? grey[500],
                            background:    meta?.bg      ?? 'transparent',
                            border:        `1px solid ${meta?.border ?? grey[700]}`,
                            clipPath:      'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                            whiteSpace:    'nowrap',
                          }}
                        >
                          {meta?.label ?? entry.action.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Target */}
                      <td className={styles.td} style={{ maxWidth: 280 }}>
                        {entry.target_label ? (
                          <p
                            style={{
                              fontFamily:   body,
                              fontSize:     12,
                              color:        grey[300],
                              margin:       0,
                              overflow:     'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace:   'nowrap',
                            }}
                          >
                            {entry.target_label}
                          </p>
                        ) : (
                          <span style={{ fontFamily: mono, fontSize: 9, color: grey[700] }}>—</span>
                        )}
                        {entry.target_type && (
                          <span style={{ fontFamily: mono, fontSize: 8, color: grey[700], letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {entry.target_type}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
