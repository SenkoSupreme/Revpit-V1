import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import { StoreModActions } from './store-mod-actions';
import styles from '../admin.module.css';

export const metadata = { title: 'Store Moderation — Admin — REVPIT' };

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

type SearchParams = Promise<{ status?: string }>;

type Listing = {
  id:              string;
  seller_id:       string;
  seller_username: string;
  title:           string;
  description:     string;
  price:           number;
  category:        string;
  condition:       string;
  images:          string[];
  is_exclusive:    boolean;
  is_sold:         boolean;
  status:          string;
  created_at:      string;
};

const CONDITION_LABELS: Record<string, string> = { new: 'NEW', like_new: 'LIKE NEW', used: 'USED' };
const CATEGORY_LABELS:  Record<string, string> = { merch: 'MERCH', car_parts: 'CAR PARTS' };

export default async function AdminStorePage(props: { searchParams: SearchParams }) {
  const { grey, accent } = tokens.colors;
  const { display, mono, body } = tokens.fonts;

  const sp     = await props.searchParams;
  const filter = (sp.status ?? 'pending') as StatusFilter;

  const supabase = createAdminClient();

  let query = supabase
    .from('store_listings')
    .select('id, seller_id, seller_username, title, description, price, category, condition, images, is_exclusive, is_sold, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter !== 'all') query = query.eq('status', filter);

  const { data } = await query;
  const listings = (data as Listing[] | null) ?? [];

  // Counts for filter tabs
  const [{ count: pendingCount }, { count: allCount }] = await Promise.all([
    supabase.from('store_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('store_listings').select('*', { count: 'exact', head: true }),
  ]);

  const STATUS_FILTERS: { label: string; value: StatusFilter; count?: number }[] = [
    { label: 'Pending Review', value: 'pending',  count: pendingCount ?? 0 },
    { label: 'Approved',       value: 'approved' },
    { label: 'Rejected',       value: 'rejected' },
    { label: 'All',            value: 'all',      count: allCount ?? 0 },
  ];

  return (
    <PageTransition>
      <div className={styles.content}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {STATUS_FILTERS.map(({ label, value, count }) => (
            <Link
              key={value}
              href={`/admin/store?status=${value}`}
              className={`${styles.tab} ${filter === value ? styles.tabActive : ''}`}
              style={{ height: 32, fontSize: 9, padding: '0 14px' }}
            >
              {label}
              {count !== undefined && (
                <span style={{
                  fontFamily:    mono,
                  fontSize:      8,
                  background:    filter === value ? 'rgba(0,0,0,0.25)' : '#1C1B19',
                  color:         filter === value && value === 'pending' ? '#FF4444' : filter === value ? '#0E0D0C' : grey[500],
                  border:        `1px solid ${value === 'pending' && count > 0 ? 'rgba(255,68,68,0.3)' : 'transparent'}`,
                  padding:       '1px 6px',
                  borderRadius:  2,
                  marginLeft:    4,
                }}>
                  {count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em', marginBottom: 16 }}>
          {listings.length} LISTING{listings.length !== 1 ? 'S' : ''}
        </p>

        {listings.length === 0 ? (
          <div className={styles.empty}>
            <p style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.06em', color: grey[700], margin: '0 0 6px' }}>
              NO LISTINGS
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em' }}>
              NOTHING TO REVIEW HERE
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Listing</th>
                  <th className={styles.th}>Seller</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Condition</th>
                  <th className={styles.th}>Exclusive</th>
                  <th className={styles.th}>Images</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className={styles.tr}>
                    <td className={styles.td} style={{ maxWidth: 240 }}>
                      <div>
                        <p style={{ fontFamily: body, fontSize: 13, color: '#F5F4F0', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.title}
                        </p>
                        {listing.description && (
                          <p style={{ fontFamily: body, fontSize: 11, color: grey[500], margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {listing.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: grey[300] }}>
                        @{listing.seller_username}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 12, color: accent, fontWeight: 700 }}>
                        ${Number(listing.price).toFixed(2)}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[500] }}>
                        {CATEGORY_LABELS[listing.category] ?? listing.category}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[500] }}>
                        {CONDITION_LABELS[listing.condition] ?? listing.condition}
                      </span>
                    </td>

                    <td className={styles.td}>
                      {listing.is_exclusive ? (
                        <span style={{ fontFamily: mono, fontSize: 9, color: accent }}>★ YES</span>
                      ) : (
                        <span style={{ fontFamily: mono, fontSize: 9, color: grey[700] }}>—</span>
                      )}
                    </td>

                    <td className={styles.td}>
                      {listing.images.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {listing.images.slice(0, 3).map((url, i) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              key={i}
                              src={url}
                              alt=""
                              style={{ width: 36, height: 36, objectFit: 'cover', border: '1px solid #504F4B' }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontFamily: mono, fontSize: 9, color: grey[700] }}>—</span>
                      )}
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.badge} ${
                        listing.status === 'pending'  ? styles.badgePending  :
                        listing.status === 'approved' ? styles.badgeApproved :
                        styles.badgeRejected
                      }`}>
                        {listing.status}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], whiteSpace: 'nowrap' }}>
                        {new Date(listing.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <StoreModActions
                        listingId={listing.id}
                        currentStatus={listing.status}
                      />
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
