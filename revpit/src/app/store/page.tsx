import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import { StoreListingCard } from '@/components/store-listing-card';
import { StoreHeroCTA } from './store-hero-cta';
import styles from './store.module.css';

export const metadata = { title: 'Pit Market — REVPIT' };

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoreListing = {
  id:              string;
  seller_id:       string;
  seller_username: string;
  title:           string;
  description:     string;
  price:           number;
  category:        'merch' | 'car_parts';
  condition:       'new' | 'like_new' | 'used';
  images:          string[];
  is_exclusive:    boolean;
  is_sold:         boolean;
  created_at:      string;
};

type SearchParams = Promise<{
  q?:        string;
  category?: string;
  condition?: string;
  exclusive?: string;
}>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'All',       value: '' },
  { label: 'Merch',     value: 'merch' },
  { label: 'Car Parts', value: 'car_parts' },
] as const;

const CONDITIONS = [
  { label: 'Any Condition', value: '' },
  { label: 'New',           value: 'new' },
  { label: 'Like New',      value: 'like_new' },
  { label: 'Used',          value: 'used' },
] as const;

function buildChipHref(
  current: Record<string, string>,
  key: string,
  value: string,
): string {
  const params = new URLSearchParams(current);
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  const str = params.toString();
  return `/store${str ? `?${str}` : ''}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StorePage(props: { searchParams: SearchParams }) {
  const { black, white, grey, accent } = tokens.colors;
  const { display, body, mono }        = tokens.fonts;

  const sp       = await props.searchParams;
  const q        = sp.q?.trim() ?? '';
  const category = sp.category ?? '';
  const condition = sp.condition ?? '';
  const exclusiveOnly = sp.exclusive === '1';

  // Current param map for chip href building
  const currentParams: Record<string, string> = {};
  if (q)         currentParams.q        = q;
  if (category)  currentParams.category = category;
  if (condition) currentParams.condition = condition;
  if (exclusiveOnly) currentParams.exclusive = '1';

  // ── Auth + member check ────────────────────────────────────────────────────
  const { userId } = await auth();
  let isMember = false;

  if (userId) {
    const supabase = createAdminClient();

    // Member = subscribed OR in any club
    const [{ data: profile }, { data: clubRow }] = await Promise.all([
      supabase
        .from('profiles')
        .select('is_subscribed')
        .eq('clerk_id', userId)
        .maybeSingle(),
      supabase
        .from('club_members')
        .select('id')
        .eq('member_id', userId)
        .limit(1)
        .maybeSingle(),
    ]);

    isMember = profile?.is_subscribed === true || clubRow !== null;
  }

  // ── Fetch listings ─────────────────────────────────────────────────────────
  const supabase = createAdminClient();

  let query = supabase
    .from('store_listings')
    .select('id, seller_id, seller_username, title, description, price, category, condition, images, is_exclusive, is_sold, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(80);

  if (category)  query = query.eq('category', category);
  if (condition) query = query.eq('condition', condition);
  if (exclusiveOnly) query = query.eq('is_exclusive', true);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data } = await query;
  const listings = (data as StoreListing[] | null) ?? [];

  const totalCount  = listings.length;
  const forSaleCount = listings.filter(l => !l.is_sold).length;

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: black }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          style={{
            position:     'relative',
            background:   'linear-gradient(135deg, #0E0D0C 0%, #111110 50%, #0A0908 100%)',
            borderBottom: `1px solid rgba(200,255,0,0.08)`,
            padding:      '44px 48px 40px',
            overflow:     'hidden',
          }}
        >
          <div aria-hidden="true" className="cyber-grid-bg"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.8 }} />
          <div className="scan-sweep" aria-hidden="true" />
          <div className="speed-streaks" aria-hidden="true" />

          {/* Corner bracket */}
          <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 48, opacity: 0.15 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M40 0H20V4H36V20H40V0Z" fill={accent} />
              <path d="M0 40H20V36H4V20H0V40Z" fill={accent} />
            </svg>
          </div>

          <div
            style={{
              position:       'relative',
              zIndex:         2,
              display:        'flex',
              alignItems:     'flex-end',
              justifyContent: 'space-between',
              gap:            32,
              flexWrap:       'wrap',
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', color: accent }}>
                  REVPIT · PIT MARKET
                </span>
              </div>

              <h1
                style={{
                  fontFamily:    display,
                  fontSize:      'clamp(40px, 5vw, 58px)',
                  letterSpacing: '0.03em',
                  color:         white,
                  lineHeight:    0.93,
                  margin:        '0 0 14px',
                }}
              >
                BUY &amp; SELL<br />IN THE PIT
              </h1>

              <p style={{ fontFamily: body, fontSize: 14, color: grey[500], lineHeight: 1.6, marginBottom: 28, maxWidth: 440 }}>
                Merch, car parts, and exclusive drops — straight from the community.
                Members get access to exclusive listings.
              </p>

              <StoreHeroCTA userId={userId ?? null} isMember={isMember} exclusiveOnly={exclusiveOnly} />
            </div>

            {/* Stats */}
            <div className={styles.statBox}>
              <p style={{ fontFamily: display, fontSize: 72, letterSpacing: '0.04em', color: accent, lineHeight: 1, margin: '0 0 4px', textShadow: '0 0 40px rgba(200,255,0,0.3)' }}>
                {forSaleCount}
              </p>
              <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', color: grey[500], textTransform: 'uppercase' }}>
                ITEMS FOR SALE
              </p>
            </div>
          </div>
        </div>

        {/* ── Browse section ─────────────────────────────────────────────── */}
        <div style={{ padding: '32px 48px 48px' }}>

          {/* Filter bar */}
          <div className={styles.filterBar}>
            {/* Search */}
            <form method="GET" action="/store" className={styles.searchWrap}>
              {/* Preserve other params */}
              {category  && <input type="hidden" name="category"  value={category} />}
              {condition && <input type="hidden" name="condition" value={condition} />}
              {exclusiveOnly && <input type="hidden" name="exclusive" value="1" />}

              <span className={styles.searchIcon}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <circle cx="5.5" cy="5.5" r="4" stroke="#504F4B" strokeWidth="1.4" />
                  <path d="M8.5 8.5L11.5 11.5" stroke="#504F4B" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
              <input
                name="q"
                defaultValue={q}
                placeholder="SEARCH LISTINGS..."
                className={styles.searchInput}
                aria-label="Search listings"
              />
            </form>

            {/* Category chips */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Category</span>
              {CATEGORIES.map(({ label, value }) => (
                <Link
                  key={value || 'all'}
                  href={buildChipHref(currentParams, 'category', value)}
                  className={`${styles.chip} ${category === value ? styles.chipActive : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Condition chips */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Condition</span>
              {CONDITIONS.map(({ label, value }) => (
                <Link
                  key={value || 'any'}
                  href={buildChipHref(currentParams, 'condition', value)}
                  className={`${styles.chip} ${condition === value ? styles.chipActive : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], textTransform: 'uppercase', marginLeft: 'auto' }}>
              {totalCount} RESULT{totalCount !== 1 ? 'S' : ''}
            </span>
          </div>

          {/* Grid */}
          {listings.length === 0 ? (
            <div className={styles.empty}>
              <p style={{ fontFamily: display, fontSize: 24, letterSpacing: '0.06em', color: grey[700], marginBottom: 8, lineHeight: 1 }}>
                NO LISTINGS FOUND
              </p>
              <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em' }}>
                {userId ? 'BE THE FIRST — LIST AN ITEM' : 'SIGN IN TO LIST AN ITEM'}
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {listings.map((listing) => (
                <StoreListingCard
                  key={listing.id}
                  listing={listing}
                  isMember={isMember}
                  currentUserId={userId ?? null}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
