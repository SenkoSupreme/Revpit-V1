import Link from 'next/link';
import { getDrops, getPits } from '@/lib/actions/community';
import { CommunityFeed } from '@/components/community/community-feed';
import { tokens } from '@/lib/design-tokens';
import type { FeedSort } from '@/lib/types/community';
import { PageTransition } from '@/components/layout/page-transition';

const { white, grey, accent } = tokens.colors;
const { display, body, mono } = tokens.fonts;

const SORT_TABS: { label: string; value: FeedSort; icon: string }[] = [
  { label: 'HOT',    value: 'hot',    icon: '◈' },
  { label: 'NEW',    value: 'new',    icon: '◇' },
  { label: 'TOP',    value: 'top',    icon: '◆' },
  { label: 'RISING', value: 'rising', icon: '◉' },
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
      <div style={{ flex: 1, minWidth: 0, borderRight: `1px solid rgba(200,255,0,0.06)` }}>

        {/* Page header */}
        <div
          style={{
            position:       'relative',
            padding:        '32px 32px 22px',
            borderBottom:   `1px solid rgba(200,255,0,0.07)`,
            display:        'flex',
            alignItems:     'flex-end',
            justifyContent: 'space-between',
            gap:            16,
            overflow:       'hidden',
            background:     'linear-gradient(135deg, #0E0D0C 0%, #111110 100%)',
          }}
        >
          {/* Cyber grid overlay */}
          <div
            aria-hidden="true"
            className="cyber-grid-bg"
            style={{
              position:          'absolute',
              inset:             0,
              pointerEvents:     'none',
              WebkitMaskImage:   'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
              maskImage:         'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
            }}
          />
          {/* Scan sweep */}
          <div className="scan-sweep" aria-hidden="true" />

          {/* Bottom accent line */}
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              bottom:     0,
              left:       0,
              right:      0,
              height:     1,
              background: `linear-gradient(90deg, ${accent}44, transparent 60%)`,
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="live-dot" />
              <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', color: accent }}>
                REVPIT COMMUNITY
              </p>
            </div>
            <h1
              style={{
                fontFamily:    display,
                fontSize:      52,
                letterSpacing: '0.04em',
                color:         white,
                lineHeight:    1,
                textShadow:    '0 0 40px rgba(200,255,0,0.1)',
              }}
            >
              THE PIT
            </h1>
          </div>

          <Link
            href="/community/general/submit"
            className="cyber-btn"
            style={{ height: 40, padding: '0 20px', fontSize: 10, flexShrink: 0, position: 'relative', zIndex: 2 }}
          >
            + NEW DROP
          </Link>
        </div>

        {/* Sort tabs */}
        <div
          style={{
            display:        'flex',
            alignItems:     'stretch',
            borderBottom:   `1px solid rgba(200,255,0,0.06)`,
            backgroundColor: '#0F0E0C',
          }}
        >
          {SORT_TABS.map(({ label, value, icon }) => {
            const active = sort === value;
            return (
              <Link
                key={value}
                href={`/community?sort=${value}`}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  gap:             6,
                  padding:         '13px 24px',
                  fontFamily:      mono,
                  fontSize:        9,
                  fontWeight:      active ? 700 : 400,
                  letterSpacing:   '0.14em',
                  color:           active ? accent : grey[500],
                  textDecoration:  'none',
                  borderBottom:    active ? `2px solid ${accent}` : '2px solid transparent',
                  backgroundColor: active ? `${accent}06` : 'transparent',
                  transition:      'color 120ms ease, background 120ms ease',
                  boxShadow:       active ? `inset 0 -1px 0 ${accent}40` : 'none',
                  position:        'relative',
                }}
              >
                <span style={{ fontSize: 8, opacity: active ? 1 : 0.5 }}>{icon}</span>
                {label}
                {active && (
                  <div
                    style={{
                      position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
                      background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                      boxShadow: `0 0 8px ${accent}66`,
                    }}
                  />
                )}
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
          width:          280,
          flexShrink:     0,
          padding:        '24px 20px',
          overflowY:      'auto',
          borderLeft:     `1px solid rgba(200,255,0,0.04)`,
          background:     '#0C0B0A',
        }}
      >
        {/* Sidebar header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <polygon points="5,0 10,5 5,10 0,5" fill={accent} fillOpacity="0.7" />
            </svg>
            <p
              style={{
                fontFamily:    mono,
                fontSize:      8,
                letterSpacing: '0.2em',
                color:         grey[700],
                textTransform: 'uppercase',
              }}
            >
              ACTIVE PITS
            </p>
          </div>
          <div className="cyber-sep" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {pits.map((pit) => (
            <Link
              key={pit.id}
              href={`/community/${pit.name}`}
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
                padding:         '10px 12px',
                background:      'transparent',
                border:          `1px solid rgba(200,255,0,0.05)`,
                clipPath:        'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                textDecoration:  'none',
                transition:      'background 120ms ease, border-color 120ms ease',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontFamily:    mono,
                    fontSize:      11,
                    fontWeight:    700,
                    color:         accent,
                    letterSpacing: '0.04em',
                    display:       'block',
                    overflow:      'hidden',
                    textOverflow:  'ellipsis',
                    whiteSpace:    'nowrap',
                  }}
                >
                  r/{pit.name}
                </span>
                {pit.display_name !== pit.name && (
                  <span
                    style={{
                      fontFamily:   body,
                      fontSize:     10,
                      color:        grey[700],
                      display:      'block',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}
                  >
                    {pit.display_name}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily:    mono,
                  fontSize:      9,
                  color:         grey[700],
                  letterSpacing: '0.06em',
                  flexShrink:    0,
                  marginLeft:    8,
                }}
              >
                {pit.member_count.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>

        {/* Footer HUD label */}
        <div style={{ marginTop: 24 }}>
          <div className="cyber-sep" style={{ marginBottom: 12 }} />
          <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700] }}>
            {pits.length} PITS ACTIVE
          </p>
        </div>
      </aside>
    </div>
    </PageTransition>
  );
}
