import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getDrops, getPit, joinPit } from '@/lib/actions/community';
import { PageTransition } from '@/components/layout/page-transition';

// Void-returning wrapper so the form action type resolves correctly
async function handleJoinPit(pitId: string) {
  'use server';
  await joinPit(pitId);
}
import { CommunityFeed } from '@/components/community/community-feed';
import { tokens } from '@/lib/design-tokens';
import type { FeedSort } from '@/lib/types/community';

const { white, grey, accent, black } = tokens.colors;
const { display, body, mono } = tokens.fonts;

const SORT_TABS: { label: string; value: FeedSort }[] = [
  { label: 'HOT',    value: 'hot'    },
  { label: 'NEW',    value: 'new'    },
  { label: 'TOP',    value: 'top'    },
  { label: 'RISING', value: 'rising' },
];

interface PageProps {
  params:       Promise<{ pit: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function PitPage({ params, searchParams }: PageProps) {
  const { pit: pitName }   = await params;
  const { sort: rawSort }  = await searchParams;
  const sort: FeedSort     = (rawSort as FeedSort) ?? 'hot';

  const [pit, drops] = await Promise.all([
    getPit(pitName),
    getDrops({ pitName, sort }),
  ]);

  if (!pit) notFound();

  const { userId } = await auth();

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* Pit header */}
      <div style={{ borderBottom: `1px solid ${grey[700]}` }}>
        {/* ── Gradient banner keyed on pit name ───────────────────────── */}
        {(() => {
          const BG: Record<string, string> = {
            general:  'linear-gradient(135deg, #0E0D0C 0%, #1C1B19 100%)',
            builds:   'linear-gradient(135deg, #0E0D0C 0%, #1A1A10 100%)',
            stance:   'linear-gradient(135deg, #0E0D0C 0%, #0E0D18 100%)',
            track:    'linear-gradient(135deg, #0D0B0B 0%, #1A1010 100%)',
            jdm:      'linear-gradient(135deg, #0A0A0E 0%, #0E0E1A 100%)',
            euro:     'linear-gradient(135deg, #0A0C10 0%, #131620 100%)',
            american: 'linear-gradient(135deg, #0D0B0B 0%, #1A1010 100%)',
            tech:     'linear-gradient(135deg, #0A0C10 0%, #0E1018 100%)',
            events:   'linear-gradient(135deg, #0E0D0C 0%, #181408 100%)',
            memes:    'linear-gradient(135deg, #0D0B0B 0%, #1A1010 100%)',
          };
          const STREAK: Record<string, string> = {
            builds: '#C8FF00', track: '#FF4444', jdm: '#6688FF',
            euro: '#4488FF',   american: '#FF4444',
          };
          const bg     = BG[pitName]     ?? BG.general;
          const streak = STREAK[pitName] ?? '#C8FF00';
          return (
            <div style={{ position: 'relative', height: 80, background: bg, overflow: 'hidden' }}>
              <svg
                aria-hidden="true"
                viewBox="0 0 600 80"
                preserveAspectRatio="xMaxYMid meet"
                style={{ position: 'absolute', right: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }}
              >
                {([
                  { y: 10, len: 300, w: 2   },
                  { y: 22, len: 180, w: 1   },
                  { y: 34, len: 420, w: 2.5 },
                  { y: 46, len: 130, w: 1   },
                  { y: 58, len: 360, w: 2   },
                  { y: 70, len: 200, w: 1   },
                ] as { y: number; len: number; w: number }[]).map(({ y, len, w }, i) => (
                  <line key={i} x1={600 - len} y1={y} x2={600} y2={y} stroke={streak} strokeWidth={w} />
                ))}
              </svg>
              <div
                style={{
                  position: 'absolute', bottom: 10, left: 32,
                  fontFamily: display, fontSize: 28, letterSpacing: '0.08em',
                  color: white, opacity: 0.1, textTransform: 'uppercase',
                  lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                }}
              >
                {pitName.toUpperCase()}
              </div>
            </div>
          );
        })()}

        <div
          style={{
            padding:    '24px 32px 20px',
            background: `linear-gradient(180deg, ${accent}08 0%, transparent 80%)`,
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Link
              href="/community"
              style={{
                fontFamily:    mono,
                fontSize:      9,
                letterSpacing: '0.12em',
                color:         grey[500],
                textDecoration: 'none',
                textTransform:  'uppercase',
              }}
            >
              ← Community
            </Link>
            <span style={{ color: grey[700], fontSize: 10 }}>/</span>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>
              r/{pitName}
            </span>
            {pit.is_official && (
              <span
                style={{
                  fontFamily:      mono,
                  fontSize:        8,
                  fontWeight:      700,
                  letterSpacing:   '0.1em',
                  color:           black,
                  backgroundColor: accent,
                  padding:         '2px 6px',
                  textTransform:   'uppercase',
                }}
              >
                OFFICIAL
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h1
                style={{
                  fontFamily:    display,
                  fontSize:      44,
                  letterSpacing: '0.04em',
                  color:         white,
                  lineHeight:    1,
                  marginBottom:  10,
                }}
              >
                {pit.display_name.toUpperCase()}
              </h1>

              {pit.description && (
                <p style={{ fontFamily: body, fontSize: 13, color: grey[300], maxWidth: 560, marginBottom: 12 }}>
                  {pit.description}
                </p>
              )}

              <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', color: grey[500], textTransform: 'uppercase' }}>
                {pit.member_count.toLocaleString()} <span style={{ color: grey[700] }}>members</span>
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              {userId && (
                <form action={handleJoinPit.bind(null, pit.id)}>
                  <button
                    type="submit"
                    style={{
                      height:          36,
                      padding:         '0 20px',
                      backgroundColor: `${accent}15`,
                      border:          `1px solid ${accent}`,
                      borderRadius:    0,
                      fontFamily:      mono,
                      fontSize:        10,
                      fontWeight:      700,
                      letterSpacing:   '0.1em',
                      color:           accent,
                      cursor:          'pointer',
                      textTransform:   'uppercase',
                    }}
                  >
                    JOIN PIT
                  </button>
                </form>
              )}
              <Link
                href={`/community/${pitName}/submit`}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  height:          36,
                  padding:         '0 20px',
                  backgroundColor: accent,
                  border:          'none',
                  borderRadius:    0,
                  fontFamily:      mono,
                  fontSize:        10,
                  fontWeight:      700,
                  letterSpacing:   '0.1em',
                  color:           black,
                  textDecoration:  'none',
                  textTransform:   'uppercase',
                }}
              >
                + NEW DROP
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sort tabs */}
      <div
        style={{
          display:         'flex',
          borderBottom:    `1px solid ${grey[700]}`,
          backgroundColor: grey[900],
        }}
      >
        {SORT_TABS.map(({ label, value }) => {
          const active = sort === value;
          return (
            <Link
              key={value}
              href={`/community/${pitName}?sort=${value}`}
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
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Feed */}
      <CommunityFeed initialDrops={drops} pitId={pit.id} />
    </div>
    </PageTransition>
  );
}
