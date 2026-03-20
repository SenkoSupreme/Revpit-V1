import Link from 'next/link';
import type { StoreListing } from '@/app/store/page';
import styles from './store-listing-card.module.css';

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  merch:     'MERCH',
  car_parts: 'CAR PARTS',
};

const CONDITION_LABELS: Record<string, string> = {
  new:      'NEW',
  like_new: 'LIKE NEW',
  used:     'USED',
};

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  merch: {
    color:  '#C8FF00',
    bg:     'rgba(200,255,0,0.12)',
    border: 'rgba(200,255,0,0.25)',
  },
  car_parts: {
    color:  '#C4C3BE',
    bg:     'rgba(196,195,190,0.08)',
    border: 'rgba(196,195,190,0.2)',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  listing:       StoreListing;
  isMember:      boolean;
  currentUserId: string | null;
};

export function StoreListingCard({ listing, isMember, currentUserId }: Props) {
  const isLocked = listing.is_exclusive && !isMember;
  const isOwner  = listing.seller_id === currentUserId;
  const firstImg = listing.images?.[0];
  const catStyle = CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS.merch;

  return (
    <Link href={`/store/${listing.id}`} className={styles.card}>
      {/* Corner accent */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.4, zIndex: 3 }}>
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <path d="M0 0L17 0L17 17" stroke="#C8FF00" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Image area */}
      <div className={styles.imageArea}>
        {/* Category badge */}
        <span
          className={styles.categoryBadge}
          style={{ color: catStyle.color, background: catStyle.bg, border: `1px solid ${catStyle.border}` }}
        >
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </span>

        {/* Exclusive badge */}
        {listing.is_exclusive && (
          <span className={styles.exclusiveBadge}>★ EXCLUSIVE</span>
        )}

        {/* Image / placeholder */}
        {firstImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={firstImg} alt={listing.title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            {listing.title[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className={styles.lockOverlay}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="3" y="9" width="16" height="11" rx="2" stroke="#898882" strokeWidth="1.4" />
              <path d="M6 9V7a5 5 0 0110 0v2" stroke="#898882" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="11" cy="15" r="1.5" fill="#898882" />
            </svg>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: '0.12em', color: '#898882' }}>
              MEMBERS ONLY
            </span>
          </div>
        )}

        {/* Sold overlay */}
        {listing.is_sold && !isLocked && (
          <div className={styles.soldOverlay}>
            <span
              style={{
                fontFamily:    '"Bebas Neue", sans-serif',
                fontSize:      28,
                letterSpacing: '0.1em',
                color:         '#FF4444',
                border:        '2px solid rgba(255,68,68,0.5)',
                padding:       '4px 16px',
                background:    'rgba(14,13,12,0.7)',
                transform:     'rotate(-12deg)',
                display:       'block',
              }}
            >
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h2 className={styles.title}>
          {listing.title.toUpperCase()}
        </h2>

        <p className={styles.seller}>
          {isOwner ? '⬡ YOUR LISTING' : `@${listing.seller_username}`}
        </p>

        <div className={styles.footer}>
          {isLocked ? (
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#504F4B', letterSpacing: '0.06em' }}>
              — LOCKED —
            </span>
          ) : (
            <span className={styles.price}>
              ${Number(listing.price).toFixed(2)}
            </span>
          )}

          <span className={styles.conditionChip}>
            {CONDITION_LABELS[listing.condition] ?? listing.condition}
          </span>
        </div>
      </div>
    </Link>
  );
}
