import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';
import { SettingsForm } from '@/components/settings-form';
import { tokens } from '@/lib/design-tokens';

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
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding:      '32px 48px 28px',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display:      'flex',
          alignItems:   'flex-end',
          justifyContent: 'space-between',
          gap:          16,
          flexWrap:     'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily:    display,
              fontSize:      36,
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
        <Link
          href="/profile"
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            6,
            fontFamily:     mono,
            fontSize:       9,
            letterSpacing:  '0.12em',
            color:          grey[500],
            textDecoration: 'none',
          }}
        >
          VIEW PROFILE →
        </Link>
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

        {/* ── Account section ─────────────────────────────────────────────── */}
        <div style={{ height: 1, backgroundColor: `rgba(255,255,255,0.06)`, margin: '0 0 40px' }} />

        <section>
          <h2
            style={{
              fontFamily:    display,
              fontSize:      18,
              letterSpacing: '0.06em',
              color:         white,
              marginBottom:  20,
              lineHeight:    1,
            }}
          >
            ACCOUNT
          </h2>

          <div
            style={{
              border:       `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 6,
              overflow:     'hidden',
              maxWidth:     520,
            }}
          >
            {/* Username row (read-only) */}
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                padding:      '16px 20px',
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              <div>
                <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], marginBottom: 4 }}>
                  USERNAME
                </p>
                <p style={{ fontFamily: body, fontSize: 13, color: white }}>
                  {profile.username}
                </p>
              </div>
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.1em', color: grey[700] }}>
                LOCKED
              </span>
            </div>

            {/* Sign out */}
            <div
              style={{
                padding:      '16px 20px',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], marginBottom: 4 }}>
                  SESSION
                </p>
                <p style={{ fontFamily: body, fontSize: 13, color: grey[500] }}>
                  Sign out of your account on this device
                </p>
              </div>
              <SignOutButton redirectUrl="/">
                <button
                  style={{
                    height:          34,
                    padding:         '0 18px',
                    backgroundColor: 'transparent',
                    border:          `1px solid #ff444488`,
                    borderRadius:    3,
                    fontFamily:      mono,
                    fontSize:        9,
                    letterSpacing:   '0.12em',
                    color:           '#ff6666',
                    cursor:          'pointer',
                  }}
                >
                  SIGN OUT
                </button>
              </SignOutButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
