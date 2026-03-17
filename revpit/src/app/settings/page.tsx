import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';
import { SettingsForm } from '@/components/settings-form';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';

export const metadata = { title: 'Settings — REVPIT' };

const { black, white, grey, accent } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('id, username, bio, instagram_handle, social_followers')
    .eq('clerk_id', userId)
    .single<{
      id:                string;
      username:          string;
      bio:               string | null;
      instagram_handle:  string | null;
      social_followers:  number;
    }>();

  if (!profile) redirect('/onboarding');

  const { data: car } = await admin
    .from('cars')
    .select('make, model, year, mods')
    .eq('user_id', profile.id)
    .maybeSingle<{ make: string; model: string; year: number; mods: string | null }>();

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* ── Cyber hero header ─────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          background:   `linear-gradient(135deg, #0E0D0C 0%, #111110 60%, #0A0908 100%)`,
          borderBottom: `1px solid rgba(200,255,0,0.08)`,
          padding:      '40px 48px 36px',
          overflow:     'hidden',
        }}
      >
        <div
          aria-hidden="true"
          className="cyber-grid-bg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }}
        />
        <div className="scan-sweep" aria-hidden="true" />

        {/* Corner bracket */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 16, right: 48, opacity: 0.12 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M36 0H18V4H32V18H36V0Z" fill={accent} />
            <path d="M0 36H18V32H4V18H0V36Z" fill={accent} />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: grey[700] }}>
                REVPIT · PILOT CONFIG
              </span>
            </div>
            <h1
              style={{
                fontFamily:    display,
                fontSize:      'clamp(36px, 4vw, 52px)',
                letterSpacing: '0.04em',
                color:         white,
                lineHeight:    1,
                margin:        0,
              }}
            >
              SETTINGS
            </h1>
            <p style={{ fontFamily: mono, fontSize: 10, color: grey[500], letterSpacing: '0.1em', marginTop: 8 }}>
              @{profile.username}
            </p>
          </div>
          <Link href="/profile" className="cyber-btn-ghost" style={{ height: 34, fontSize: 9 }}>
            VIEW PROFILE →
          </Link>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '40px 48px', maxWidth: 720 }}>

        <SettingsForm
          profile={{
            bio:              profile.bio,
            instagram_handle: profile.instagram_handle,
            social_followers: profile.social_followers ?? 0,
          }}
          car={car}
        />

        {/* Divider */}
        <div className="cyber-sep" style={{ margin: '0 0 40px' }} />

        {/* ── Account section ─────────────────────────────────────────────── */}
        <section>
          <div className="section-header-line" style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: display, fontSize: 18, letterSpacing: '0.06em', color: white, margin: 0, lineHeight: 1 }}>
              ACCOUNT
            </h2>
          </div>

          {/* Cyber card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1C1B19 0%, #141312 100%)',
              border:     `1px solid rgba(200,255,0,0.08)`,
              clipPath:   'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
              overflow:   'hidden',
              maxWidth:   520,
            }}
          >
            {/* Username row */}
            <div
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '16px 20px',
                borderBottom:   `1px solid rgba(200,255,0,0.06)`,
              }}
            >
              <div>
                <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], marginBottom: 4 }}>
                  USERNAME
                </p>
                <p style={{ fontFamily: body, fontSize: 13, color: white }}>
                  {profile.username}
                </p>
              </div>
              <span
                style={{
                  fontFamily:      mono,
                  fontSize:        8,
                  letterSpacing:   '0.12em',
                  color:           grey[700],
                  border:          `1px solid ${grey[700]}`,
                  padding:         '3px 8px',
                  clipPath:        'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
                }}
              >
                LOCKED
              </span>
            </div>

            {/* Sign out row */}
            <div
              style={{
                padding:        '16px 20px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', color: grey[700], marginBottom: 4 }}>
                  SESSION
                </p>
                <p style={{ fontFamily: body, fontSize: 13, color: grey[500] }}>
                  Sign out of your account on this device
                </p>
              </div>
              <SignOutButton redirectUrl="/">
                <button className="btn-danger" style={{ height: 34, padding: '0 18px', fontSize: 9 }}>
                  SIGN OUT
                </button>
              </SignOutButton>
            </div>
          </div>
        </section>
      </div>
    </div>
    </PageTransition>
  );
}
