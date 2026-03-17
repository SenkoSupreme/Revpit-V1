import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateClubModal } from '@/components/create-club-modal';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';
import styles from './clubs.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type Club = {
  id:             string;
  name:           string;
  description:    string;
  is_public:      boolean;
  owner_username: string;
  member_count:   number;
  created_at:     string;
};

// ─── Club card ────────────────────────────────────────────────────────────────

function ClubCard({ club }: { club: Club }) {
  const { black, white, grey, accent } = tokens.colors;
  const { display, body, mono }        = tokens.fonts;

  return (
    <Link href={`/clubs/${club.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        className={styles.card}
        style={{
          background:  'linear-gradient(135deg, #1C1B19 0%, #141312 100%)',
          border:      `1px solid rgba(200,255,0,0.1)`,
          clipPath:    'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
          overflow:    'hidden',
          height:      '100%',
          position:    'relative',
          transition:  'border-color 200ms ease, box-shadow 200ms ease',
        }}
      >
        {/* Top-right corner notch accent */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.5 }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M0 0L17 0L17 17" stroke={accent} strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Header area */}
        <div
          style={{
            height:       112,
            background:   `linear-gradient(135deg, rgba(200,255,0,0.05) 0%, rgba(0,0,0,0) 100%)`,
            position:     'relative',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            borderBottom: `1px solid rgba(200,255,0,0.08)`,
          }}
        >
          {/* Subtle grid */}
          <div
            aria-hidden="true"
            className="cyber-grid-bg"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}
          />

          {/* Club initial */}
          <span
            style={{
              fontFamily:    display,
              fontSize:      48,
              letterSpacing: '0.04em',
              color:         `rgba(200,255,0,0.15)`,
              lineHeight:    1,
              position:      'relative',
              zIndex:        1,
              textShadow:    '0 0 24px rgba(200,255,0,0.2)',
            }}
          >
            {club.name[0]?.toUpperCase() ?? '?'}
          </span>

          {/* Public/private badge */}
          <span
            style={{
              position:        'absolute',
              top:             10,
              left:            10,
              fontFamily:      mono,
              fontSize:        8,
              fontWeight:      700,
              letterSpacing:   '0.12em',
              textTransform:   'uppercase',
              color:           club.is_public ? accent : grey[500],
              backgroundColor: `${black}cc`,
              border:          `1px solid ${club.is_public ? `${accent}44` : grey[700]}`,
              padding:         '3px 8px',
              display:         'flex',
              alignItems:      'center',
              gap:             4,
              clipPath:        'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
              zIndex:          2,
            }}
          >
            <svg width="7" height="8" viewBox="0 0 7 8" fill="none" aria-hidden="true">
              {club.is_public ? (
                <circle cx="3.5" cy="4" r="3" stroke="currentColor" strokeWidth="1.2" />
              ) : (
                <path d="M1 4.5V3.5a2.5 2.5 0 015 0V4.5M1 4.5h5v3H1V4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              )}
            </svg>
            {club.is_public ? 'PUBLIC' : 'PRIVATE'}
          </span>

          {/* Member count badge */}
          <span
            style={{
              position:    'absolute',
              top:         10,
              right:       10,
              fontFamily:  mono,
              fontSize:    9,
              fontWeight:  700,
              color:       grey[300],
              display:     'flex',
              alignItems:  'center',
              gap:         4,
              zIndex:      2,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <circle cx="4" cy="3.5" r="2" stroke={grey[500]} strokeWidth="1.2" />
              <path d="M0.5 9.5c0-2 1.6-3.5 3.5-3.5S7.5 7.5 7.5 9.5" stroke={grey[500]} strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="8.5" cy="3.5" r="1.5" stroke={grey[500]} strokeWidth="1.2" />
              <path d="M9.5 7c.7.4 1 1.2 1 1.5" stroke={grey[500]} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {club.member_count >= 1000
              ? `${(club.member_count / 1000).toFixed(1)}k`
              : club.member_count.toString()}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '18px 18px 16px' }}>
          <h2
            style={{
              fontFamily:    display,
              fontSize:      18,
              letterSpacing: '0.04em',
              color:         white,
              lineHeight:    1.1,
              margin:        '0 0 8px',
            }}
          >
            {club.name.toUpperCase()}
          </h2>

          <p
            style={{
              fontFamily:      body,
              fontSize:        12,
              color:           grey[500],
              lineHeight:      1.5,
              marginBottom:    16,
              display:         '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:        'hidden',
            }}
          >
            {club.description || 'No description provided.'}
          </p>

          {/* CTA row */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              paddingTop:     12,
              borderTop:      `1px solid rgba(200,255,0,0.08)`,
            }}
          >
            <span style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.06em' }}>
              @{club.owner_username}
            </span>
            <span
              style={{
                fontFamily:    mono,
                fontSize:      9,
                fontWeight:    700,
                letterSpacing: '0.1em',
                color:         club.is_public ? accent : grey[300],
                border:        `1px solid ${club.is_public ? `${accent}44` : grey[700]}`,
                padding:       '4px 10px',
                textTransform: 'uppercase',
                clipPath:      'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}
            >
              {club.is_public ? 'JOIN CLUB' : 'REQUEST ACCESS'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: 'Clubs — REVPIT' };

export default async function ClubsPage() {
  const { black, white, grey, accent } = tokens.colors;
  const { display, body, mono }        = tokens.fonts;

  const supabase = createAdminClient();

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name, description, is_public, owner_username, member_count, created_at')
    .order('member_count', { ascending: false })
    .limit(60);

  const rows = (clubs as Club[] | null) ?? [];

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* ── Cyber hero header ────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          background:   `linear-gradient(135deg, #0E0D0C 0%, #111110 50%, #0A0908 100%)`,
          borderBottom: `1px solid rgba(200,255,0,0.08)`,
          padding:      '44px 48px 40px',
          overflow:     'hidden',
        }}
      >
        <div
          aria-hidden="true"
          className="cyber-grid-bg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.8 }}
        />
        <div className="scan-sweep" aria-hidden="true" />
        <div className="speed-streaks" aria-hidden="true" />

        {/* Corner bracket */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 48, opacity: 0.15 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M40 0H20V4H36V20H40V0Z" fill={accent} />
            <path d="M0 40H20V36H4V20H0V40Z" fill={accent} />
          </svg>
        </div>

        <div className="rp-clubs-hero" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="live-dot" />
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', color: accent }}>
                REVPIT · COMMUNITY
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
              FIND YOUR<br />CREW
            </h1>
            <p style={{ fontFamily: body, fontSize: 14, color: grey[500], lineHeight: 1.6, marginBottom: 28, maxWidth: 420 }}>
              Connect with fellow enthusiasts, share your builds, and join the most
              active racing communities in the pit.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <CreateClubModal />
              <button
                type="button"
                className="cyber-btn-ghost"
                style={{ height: 44 }}
              >
                HOW IT WORKS
              </button>
            </div>
          </div>

          {/* Right side: active clubs stat */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p
              style={{
                fontFamily:  display,
                fontSize:    72,
                letterSpacing: '0.04em',
                color:       accent,
                lineHeight:  1,
                margin:      '0 0 4px',
                textShadow:  '0 0 40px rgba(200,255,0,0.3)',
              }}
            >
              {rows.length}
            </p>
            <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', color: grey[500], textTransform: 'uppercase' }}>
              ACTIVE CLUBS
            </p>
          </div>
        </div>
      </div>

      {/* ── Grid section ─────────────────────────────────────────────────── */}
      <div style={{ padding: '32px 48px 48px' }}>

        {/* Section header + filter chips */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   24,
            flexWrap:       'wrap',
            gap:            12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(['All Clubs', 'Drift', 'JDM', 'Off-Road'] as const).map((label, i) => (
              <span
                key={label}
                style={{
                  display:         'inline-block',
                  height:          30,
                  padding:         '0 14px',
                  lineHeight:      '30px',
                  fontFamily:      mono,
                  fontSize:        9,
                  fontWeight:      700,
                  letterSpacing:   '0.1em',
                  cursor:          'pointer',
                  backgroundColor: i === 0 ? accent : 'transparent',
                  color:           i === 0 ? black  : grey[500],
                  border:          `1px solid ${i === 0 ? accent : grey[700]}`,
                  textTransform:   'uppercase',
                  clipPath:        'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  transition:      'color 150ms ease, border-color 150ms ease',
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], textTransform: 'uppercase' }}>
            SORT BY: POPULAR
          </span>
        </div>

        {rows.length === 0 ? (
          <div
            style={{
              textAlign:   'center',
              padding:     '72px 24px',
              border:      `1px dashed ${grey[700]}`,
              clipPath:    'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
            }}
          >
            <p style={{ fontFamily: display, fontSize: 24, letterSpacing: '0.06em', color: grey[700], marginBottom: 8, lineHeight: 1 }}>
              NO CLUBS YET
            </p>
            <p style={{ fontFamily: mono, fontSize: 9, color: grey[700], letterSpacing: '0.12em' }}>
              BE THE FIRST TO CREATE ONE
            </p>
          </div>
        ) : (
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap:                 18,
            }}
          >
            {rows.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
