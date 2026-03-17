import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { OnboardingForm } from '@/components/onboarding-form';
import { tokens } from '@/lib/design-tokens';

export const metadata = { title: 'Get Started — REVPIT' };

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Skip onboarding if profile already exists
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle();

  if (profile) redirect('/dashboard');

  const { black, grey } = tokens.colors;
  const { mono }        = tokens.fonts;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      {/* Logo + tagline */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <Image
          src="/images/logo-white.png"
          alt="REVPIT"
          width={160}
          height={46}
          priority
          style={{ width: 160, height: 'auto', display: 'inline-block' }}
        />
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.18em',
            color: grey[700],
            textTransform: 'uppercase',
            display: 'block',
            marginTop: 8,
          }}
        >
          Let&apos;s set up your profile
        </span>
      </div>

      <OnboardingForm />

      {/* Footer note */}
      <p
        style={{
          fontFamily: mono,
          fontSize: 10,
          color: grey[700],
          letterSpacing: '0.06em',
          marginTop: 24,
          textAlign: 'center',
        }}
      >
        You can update everything later in your profile settings.
      </p>
    </main>
  );
}
