import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import { ListingActions } from './listing-actions';
import { GuestDetailActions } from './guest-detail-actions';
import type { StoreListing } from '../page';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('store_listings')
    .select('title')
    .eq('id', id)
    .single();
  return { title: data?.title ? `${data.title} — REVPIT Pit Market` : 'Pit Market — REVPIT' };
}

const CONDITION_LABELS: Record<string, string> = {
  new:      'NEW',
  like_new: 'LIKE NEW',
  used:     'USED',
};

const CATEGORY_LABELS: Record<string, string> = {
  merch:     'MERCH',
  car_parts: 'CAR PARTS',
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }     = await params;
  const { userId } = await auth();
  const { black, white, grey, accent } = tokens.colors;
  const { display, body, mono }        = tokens.fonts;

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from('store_listings')
    .select('*')
    .eq('id', id)
    .single<StoreListing & { status: string }>();

  if (!listing) notFound();

  // Non-approved listings only visible to the seller
  if (listing.status !== 'approved' && listing.seller_id !== userId) notFound();

  // Exclusive listing: check membership
  let isMember = false;
  if (userId) {
    const [{ data: profile }, { data: clubRow }] = await Promise.all([
      supabase.from('profiles').select('is_subscribed').eq('clerk_id', userId).maybeSingle(),
      supabase.from('club_members').select('id').eq('member_id', userId).limit(1).maybeSingle(),
    ]);
    isMember = profile?.is_subscribed === true || clubRow !== null;
  }

  const isGuest     = !userId;
  const isLocked    = listing.is_exclusive && !isMember;
  const isOwner     = listing.seller_id === userId;
  const images      = listing.images ?? [];
  const hasImages   = images.length > 0;

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: black }}>

        {/* ── Back nav ──────────────────────────────────────────────────── */}
        <div
          style={{
            padding:      '16px 48px',
            borderBottom: `1px solid rgba(200,255,0,0.06)`,
            display:      'flex',
            alignItems:   'center',
            gap:          10,
          }}
        >
          <Link
            href="/store"
            style={{
              fontFamily:    mono,
              fontSize:      9,
              letterSpacing: '0.12em',
              color:         grey[500],
              textDecoration: 'none',
              display:       'flex',
              alignItems:    'center',
              gap:           5,
            }}
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            PIT MARKET
          </Link>
          <span style={{ color: grey[700], fontFamily: mono, fontSize: 9 }}>/</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.08em' }}>
            {listing.title.length > 30 ? listing.title.slice(0, 30) + '…' : listing.title}
          </span>
        </div>

        <div
          style={{
            maxWidth: 900,
            margin:   '0 auto',
            padding:  '36px 48px 80px',
          }}
        >
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: hasImages ? '1fr 400px' : '1fr',
              gap:                 36,
              alignItems:          'start',
            }}
          >
            {/* ── Left: images ──────────────────────────────────────────── */}
            {hasImages && (
              <div>
                {/* Main image */}
                <div
                  style={{
                    aspectRatio: '4/3',
                    background:  '#1C1B19',
                    border:      `1px solid rgba(200,255,0,0.08)`,
                    clipPath:    'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
                    overflow:    'hidden',
                    position:    'relative',
                    marginBottom: 10,
                  }}
                >
                  {isGuest || isLocked ? (
                    <div
                      style={{
                        position:       'absolute',
                        inset:          0,
                        display:        'flex',
                        flexDirection:  'column',
                        alignItems:     'center',
                        justifyContent: 'center',
                        gap:            10,
                        backdropFilter: 'blur(12px)',
                        background:     'rgba(14,13,12,0.5)',
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                        <rect x="4" y="12" width="20" height="14" rx="2" stroke={grey[500]} strokeWidth="1.5" />
                        <path d="M8 12V9a6 6 0 0112 0v3" stroke={grey[500]} strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="14" cy="19" r="2" fill={grey[500]} />
                      </svg>
                      <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.14em', color: grey[500] }}>
                        {isGuest ? 'SIGN IN TO VIEW' : 'MEMBERS ONLY'}
                      </span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={images[0]}
                      alt={listing.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && !isLocked && !isGuest && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {images.slice(1).map((url, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={url}
                        alt={`${listing.title} ${i + 2}`}
                        style={{
                          width:      72,
                          height:     72,
                          objectFit:  'cover',
                          border:     `1px solid rgba(200,255,0,0.08)`,
                          clipPath:   'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Right: details ────────────────────────────────────────── */}
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span
                  style={{
                    fontFamily:      mono,
                    fontSize:        8,
                    fontWeight:      700,
                    letterSpacing:   '0.12em',
                    color:           accent,
                    background:      `${accent}18`,
                    border:          `1px solid ${accent}44`,
                    padding:         '3px 10px',
                    textTransform:   'uppercase',
                    clipPath:        'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                  }}
                >
                  {CATEGORY_LABELS[listing.category] ?? listing.category}
                </span>

                <span
                  style={{
                    fontFamily:    mono,
                    fontSize:      8,
                    fontWeight:    700,
                    letterSpacing: '0.12em',
                    color:         grey[500],
                    border:        `1px solid ${grey[700]}`,
                    padding:       '3px 10px',
                    textTransform: 'uppercase',
                    clipPath:      'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                  }}
                >
                  {CONDITION_LABELS[listing.condition] ?? listing.condition}
                </span>

                {listing.is_exclusive && (
                  <span
                    style={{
                      fontFamily:    mono,
                      fontSize:      8,
                      fontWeight:    700,
                      letterSpacing: '0.12em',
                      color:         '#C8FF00',
                      border:        `1px solid rgba(200,255,0,0.3)`,
                      padding:       '3px 10px',
                      textTransform: 'uppercase',
                      clipPath:      'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                    }}
                  >
                    ★ MEMBERS ONLY
                  </span>
                )}

                {listing.is_sold && (
                  <span
                    style={{
                      fontFamily:    mono,
                      fontSize:      8,
                      fontWeight:    700,
                      letterSpacing: '0.12em',
                      color:         '#FF4444',
                      border:        `1px solid rgba(255,68,68,0.3)`,
                      padding:       '3px 10px',
                      textTransform: 'uppercase',
                    }}
                  >
                    SOLD
                  </span>
                )}

                {listing.status === 'pending' && isOwner && (
                  <span style={{ fontFamily: mono, fontSize: 8, color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)', padding: '3px 10px', letterSpacing: '0.12em' }}>
                    PENDING REVIEW
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily:    display,
                  fontSize:      'clamp(24px, 3vw, 36px)',
                  letterSpacing: '0.03em',
                  color:         white,
                  lineHeight:    1,
                  margin:        '0 0 12px',
                }}
              >
                {listing.title.toUpperCase()}
              </h1>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                {isGuest ? (
                  <span style={{ fontFamily: mono, fontSize: 14, color: grey[700], letterSpacing: '0.1em' }}>
                    — SIGN IN TO SEE PRICE —
                  </span>
                ) : isLocked ? (
                  <span style={{ fontFamily: mono, fontSize: 14, color: grey[700], letterSpacing: '0.1em' }}>
                    — MEMBERS ONLY —
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily:    display,
                      fontSize:      40,
                      letterSpacing: '0.04em',
                      color:         accent,
                      lineHeight:    1,
                      textShadow:    '0 0 20px rgba(200,255,0,0.3)',
                    }}
                  >
                    ${Number(listing.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Seller */}
              <div
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         8,
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: `1px solid rgba(200,255,0,0.08)`,
                }}
              >
                <div
                  style={{
                    width:           28,
                    height:          28,
                    borderRadius:    '50%',
                    background:      'linear-gradient(135deg, rgba(200,255,0,0.2) 0%, rgba(200,255,0,0.05) 100%)',
                    border:          `1px solid rgba(200,255,0,0.2)`,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    fontFamily:      mono,
                    fontSize:        10,
                    fontWeight:      700,
                    color:           accent,
                    flexShrink:      0,
                  }}
                >
                  {listing.seller_username[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.1em', margin: '0 0 1px' }}>
                    SOLD BY
                  </p>
                  <p style={{ fontFamily: mono, fontSize: 11, color: grey[300], margin: 0 }}>
                    @{listing.seller_username}
                  </p>
                </div>
              </div>

              {/* Description — hidden for guests */}
              {listing.description && !isLocked && !isGuest && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: grey[700], marginBottom: 8, textTransform: 'uppercase' }}>
                    Description
                  </p>
                  <p style={{ fontFamily: body, fontSize: 14, color: grey[300], lineHeight: 1.65 }}>
                    {listing.description}
                  </p>
                </div>
              )}

              {/* CTA / Actions */}
              {isGuest ? (
                <GuestDetailActions />
              ) : (
                <ListingActions listing={listing as StoreListing} isOwner={isOwner} isLocked={isLocked} isSold={listing.is_sold} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
