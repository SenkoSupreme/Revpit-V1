import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tokens } from '@/lib/design-tokens';

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  const supabase = createAdminClient();

  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single();

  if (!club) notFound();

  const isOwner = userId === club.owner_id;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* ── Back nav ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 48px 0' }}>
        <Link
          href="/clubs"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            6,
            fontFamily:     mono,
            fontSize:       10,
            letterSpacing:  '0.12em',
            color:          grey[500],
            textDecoration: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          BACK TO CLUBS
        </Link>
      </div>

      {/* ── Club hero ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 48px 0' }}>
        <div
          style={{
            background:   `linear-gradient(135deg, ${grey[900]} 0%, #161514 100%)`,
            border:       `1px solid ${grey[700]}`,
            padding:      '36px 40px',
            display:      'flex',
            alignItems:   'flex-start',
            gap:          32,
          }}
        >
          {/* Club initial avatar */}
          <div
            style={{
              width:           80,
              height:          80,
              backgroundColor: grey[900],
              border:          `1px solid ${grey[700]}`,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
            }}
          >
            <span style={{ fontFamily: display, fontSize: 44, color: grey[500], lineHeight: 1 }}>
              {club.name[0]?.toUpperCase() ?? '?'}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily:      mono,
                  fontSize:        8,
                  fontWeight:      700,
                  letterSpacing:   '0.12em',
                  color:           club.is_public ? accent : grey[500],
                  border:          `1px solid ${club.is_public ? `${accent}55` : grey[700]}`,
                  padding:         '3px 8px',
                  textTransform:   'uppercase',
                }}
              >
                {club.is_public ? 'PUBLIC' : 'PRIVATE'}
              </span>
              {isOwner && (
                <span
                  style={{
                    fontFamily:    mono,
                    fontSize:      8,
                    fontWeight:    700,
                    letterSpacing: '0.12em',
                    color:         '#D4A500',
                    border:        '1px solid rgba(212,165,0,0.4)',
                    padding:       '3px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  OWNER
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily:    display,
                fontSize:      'clamp(28px, 3vw, 42px)',
                letterSpacing: '0.03em',
                color:         white,
                lineHeight:    1,
                margin:        '0 0 12px',
              }}
            >
              {club.name.toUpperCase()}
            </h1>

            <p
              style={{
                fontFamily:   body,
                fontSize:     13,
                color:        grey[500],
                lineHeight:   1.6,
                marginBottom: 24,
                maxWidth:     560,
              }}
            >
              {club.description || 'No description provided.'}
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'MEMBERS',  value: club.member_count ?? 0 },
                { label: 'FOUNDED',  value: new Date(club.created_at).getFullYear().toString() },
                { label: 'OWNER',    value: `@${club.owner_username ?? 'unknown'}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], marginBottom: 4 }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: display, fontSize: 20, letterSpacing: '0.04em', color: white, lineHeight: 1 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Join button */}
          {!isOwner && (
            <div style={{ flexShrink: 0 }}>
              <button
                type="button"
                style={{
                  height:          42,
                  padding:         '0 28px',
                  backgroundColor: club.is_public ? accent : 'transparent',
                  color:           club.is_public ? black  : grey[300],
                  border:          `1px solid ${club.is_public ? accent : grey[700]}`,
                  fontFamily:      mono,
                  fontSize:        10,
                  fontWeight:      700,
                  letterSpacing:   '0.12em',
                  cursor:          'pointer',
                  textTransform:   'uppercase',
                }}
              >
                {club.is_public ? 'JOIN CLUB' : 'REQUEST ACCESS'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Empty members placeholder ─────────────────────────────────────────── */}
      <div style={{ padding: '32px 48px 48px' }}>
        <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.14em', color: grey[700], marginBottom: 20 }}>
          MEMBERS · {club.member_count ?? 0}
        </p>
        <div
          style={{
            border:      `1px solid ${grey[700]}`,
            padding:     '48px 32px',
            textAlign:   'center',
            color:       grey[700],
            fontFamily:  mono,
            fontSize:    11,
            letterSpacing: '0.1em',
          }}
        >
          MEMBER LIST COMING SOON
        </div>
      </div>

    </div>
  );
}
