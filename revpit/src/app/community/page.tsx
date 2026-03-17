import Link from 'next/link';
import { getDrops, getPits } from '@/lib/actions/community';
import { CommunityFeed } from '@/components/community/community-feed';
import { tokens } from '@/lib/design-tokens';
import type { FeedSort } from '@/lib/types/community';
import { PageTransition } from '@/components/layout/page-transition';

const { white, grey, accent } = tokens.colors;
const { display, body, mono } = tokens.fonts;

const SORT_TABS: { label: string; value: FeedSort }[] = [
  { label: 'HOT',    value: 'hot'     },
  { label: 'NEW',    value: 'new'     },
  { label: 'TOP',    value: 'top'     },
  { label: 'RISING', value: 'rising'  },
];

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const { sort: rawSort } = await searchParams;
  const sort: FeedSort = (rawSort as FeedSort) ?? 'hot';

  const [drops, pits] = await Promise.all([
    getDrops({ sort }),
    getPits(),
  ]);

  return (
    <PageTransition>
    <div style={{ display: 'flex', gap: 0, minHeight: '100vh', backgroundColor: '#0E0D0C' }}>

      {/* ── Feed column ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, borderRight: `1px solid ${grey[700]}` }}>

        {/* Page header */}
        <div
          style={{
            position:       'relative',
            padding:        '28px 32px 20px',
            borderBottom:   `1px solid ${grey[700]}`,
            display:        'flex',
            alignItems:     'flex-end',
            justifyContent: 'space-between',
            gap:            16,
            overflow:       'hidden',
          }}
        >
          {/* Fine grid overlay fading out at bottom */}
          <div
            aria-hidden="true"
            style={{
              position:        'absolute',
              inset:           0,
              backgroundImage: [
                'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(200,255,0,0.035) 31px, rgba(200,255,0,0.035) 32px)',
                'repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(200,255,0,0.035) 31px, rgba(200,255,0,0.035) 32px)',
              ].join(', '),
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
              maskImage:       'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
              pointerEvents:   'none',
            }}
          />
          <div>
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.16em', color: grey[500], textTransform: 'uppercase', marginBottom: 6 }}>
              REVPIT COMMUNITY
            </p>
            <h1
              style={{
                fontFamily:    display,
                fontSize:      48,
                letterSpacing: '0.04em',
                color:         white,
                lineHeight:    1,
              }}
            >
              THE PIT
            </h1>
          </div>
          <Link
            href="/community/general/submit"
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             6,
              height:          38,
              padding:         '0 20px',
              backgroundColor: accent,
              border:          'none',
              fontFamily:      mono,
              fontSize:        10,
              fontWeight:      700,
              letterSpacing:   '0.1em',
              color:           '#0E0D0C',
              textDecoration:  'none',
              textTransform:   'uppercase',
              whiteSpace:      'nowrap',
              flexShrink:      0,
            }}
          >
            + NEW DROP
          </Link>
        </div>

        {/* Sort tabs */}
        <div
          style={{
            display:        'flex',
            alignItems:     'stretch',
            borderBottom:   `1px solid ${grey[700]}`,
            backgroundColor: grey[900],
          }}
        >
          {SORT_TABS.map(({ label, value }) => {
            const active = sort === value;
            return (
              <Link
                key={value}
                href={`/community?sort=${value}`}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  padding:         '12px 24px',
                  fontFamily:      mono,
                  fontSize:        10,
                  fontWeight:      active ? 700 : 400,
                  letterSpacing:   '0.1em',
                  color:           active ? accent : grey[500],
                  textDecoration:  'none',
                  borderBottom:    active ? `2px solid ${accent}` : '2px solid transparent',
                  backgroundColor: active ? `${accent}08` : 'transparent',
                  transition:      'color 120ms ease, background 120ms ease',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Realtime feed */}
        <div style={{ padding: '0' }}>
          <CommunityFeed initialDrops={drops} />
        </div>
      </div>

      {/* ── Pit sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width:        280,
          flexShrink:   0,
          padding:      '24px 20px',
          overflowY:    'auto',
        }}
      >
        <p
          style={{
            fontFamily:    mono,
            fontSize:      9,
            letterSpacing: '0.14em',
            color:         grey[500],
            textTransform: 'uppercase',
            marginBottom:  14,
          }}
        >
          PITS
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pits.map((pit) => (
            <Link
              key={pit.id}
              href={`/community/${pit.name}`}
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
                padding:         '9px 12px',
                backgroundColor: 'transparent',
                border:          `1px solid rgba(255,255,255,0.05)`,
                borderRadius:    0,
                textDecoration:  'none',
                transition:      'background 120ms ease, border-color 120ms ease',
              }}
            >
              <div>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.04em' }}>
                  r/{pit.name}
                </span>
                {pit.display_name !== pit.name && (
                  <span style={{ fontFamily: body, fontSize: 11, color: grey[500], marginLeft: 6 }}>
                    {pit.display_name}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.04em' }}>
                {pit.member_count.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
    </PageTransition>
  );
}
