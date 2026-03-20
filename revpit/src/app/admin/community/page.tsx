import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import { CommunityModActions } from './community-mod-actions';
import styles from '../admin.module.css';

export const metadata = { title: 'Community Moderation — Admin — REVPIT' };

type Drop = {
  id:          string;
  title:       string;
  body:        string | null;
  type:        string;
  rev_count:   number;
  idle_count:  number;
  reply_count: number;
  is_pinned:   boolean;
  is_locked:   boolean;
  created_at:  string;
  author_id:   string;
  pit_id:      string;
  pits:        { display_name: string } | null;
  profiles:    { username: string } | null;
};

export default async function AdminCommunityPage() {
  const { grey, accent } = tokens.colors;
  const { display, mono, body } = tokens.fonts;

  const supabase = createAdminClient();

  const { data } = await supabase
    .from('drops')
    .select('id, title, body, type, rev_count, idle_count, reply_count, is_pinned, is_locked, created_at, author_id, pit_id, pits(display_name), profiles(username)')
    .order('created_at', { ascending: false })
    .limit(100);

  const drops = (data as Drop[] | null) ?? [];

  return (
    <PageTransition>
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.04em', color: '#F5F4F0', margin: 0 }}>
            COMMUNITY DROPS
          </h2>
          <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
            {drops.length} TOTAL
          </span>
        </div>

        <p style={{ fontFamily: body, fontSize: 13, color: grey[500], marginBottom: 24, lineHeight: 1.6 }}>
          Review and moderate community drops. Deleting a drop is permanent and removes all replies and votes.
        </p>

        {drops.length === 0 ? (
          <div className={styles.empty}>
            <p style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.06em', color: grey[700], margin: 0 }}>
              NO DROPS
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Author</th>
                  <th className={styles.th}>Pit</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>REV</th>
                  <th className={styles.th}>Replies</th>
                  <th className={styles.th}>Flags</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drops.map((drop) => (
                  <tr key={drop.id} className={styles.tr}>
                    <td className={styles.td} style={{ maxWidth: 260 }}>
                      <div>
                        <p style={{ fontFamily: body, fontSize: 13, color: '#F5F4F0', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {drop.title}
                        </p>
                        {drop.body && (
                          <p style={{ fontFamily: body, fontSize: 11, color: grey[500], margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                            {drop.body}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: grey[300] }}>
                        @{drop.profiles?.username ?? 'unknown'}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[500] }}>
                        {drop.pits?.display_name ?? '—'}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[500] }}>
                        {drop.type.toUpperCase()}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: accent }}>
                        {drop.rev_count}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: grey[500] }}>
                        {drop.reply_count}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {drop.is_pinned && (
                          <span className={`${styles.badge} ${styles.badgeApproved}`}>PINNED</span>
                        )}
                        {drop.is_locked && (
                          <span className={`${styles.badge} ${styles.badgePending}`}>LOCKED</span>
                        )}
                        {!drop.is_pinned && !drop.is_locked && (
                          <span style={{ fontFamily: mono, fontSize: 9, color: grey[700] }}>—</span>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], whiteSpace: 'nowrap' }}>
                        {new Date(drop.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <CommunityModActions dropId={drop.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
