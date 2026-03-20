import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { tokens } from '@/lib/design-tokens';
import { NewListingForm } from './new-listing-form';

export const metadata = { title: 'List an Item — REVPIT Pit Market' };

export default async function NewListingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { black, white, grey, accent } = tokens.colors;
  const { display, mono }              = tokens.fonts;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: black }}>
      {/* Header */}
      <div
        style={{
          position:     'relative',
          background:   'linear-gradient(135deg, #0E0D0C 0%, #111110 50%, #0A0908 100%)',
          borderBottom: `1px solid rgba(200,255,0,0.08)`,
          padding:      '32px 48px 28px',
          overflow:     'hidden',
        }}
      >
        <div aria-hidden="true" className="cyber-grid-bg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', color: accent }}>
              REVPIT · PIT MARKET · NEW LISTING
            </span>
          </div>
          <h1
            style={{
              fontFamily:    display,
              fontSize:      'clamp(32px, 4vw, 44px)',
              letterSpacing: '0.03em',
              color:         white,
              lineHeight:    0.95,
              margin:        0,
            }}
          >
            LIST AN ITEM
          </h1>
          <p style={{ fontFamily: mono, fontSize: 10, color: grey[500], letterSpacing: '0.1em', marginTop: 8 }}>
            YOUR LISTING WILL BE REVIEWED BEFORE GOING LIVE
          </p>
        </div>
      </div>

      {/* Form */}
      <NewListingForm />
    </div>
  );
}
