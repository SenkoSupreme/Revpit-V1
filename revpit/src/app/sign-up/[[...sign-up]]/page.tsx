import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export const metadata = { title: 'Sign Up — REVPIT' };

const appearance = {
  variables: {
    colorBackground:     '#1E1D1B',
    colorPrimary:        '#C8FF00',
    colorText:           '#F5F4F0',
    colorTextSecondary:  '#898882',
    colorInputBackground:'#0E0D0C',
    colorInputText:      '#F5F4F0',
    colorNeutral:        '#504F4B',
    borderRadius:        '3px',
    fontFamily:          '"DM Sans", sans-serif',
    fontSize:            '14px',
  },
  elements: {
    card: {
      background:   '#1E1D1B',
      border:       '1px solid #504F4B',
      boxShadow:    'none',
      borderRadius: '3px',
    },
    formButtonPrimary: {
      color:         '#0E0D0C',
      fontFamily:    '"JetBrains Mono", monospace',
      fontSize:      '11px',
      fontWeight:    '700',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    footerAction:     { color: '#898882' },
    footerActionLink: { color: '#C8FF00' },
    headerTitle: {
      fontFamily:    '"Bebas Neue", sans-serif',
      fontSize:      '22px',
      letterSpacing: '0.06em',
      color:         '#F5F4F0',
    },
    headerSubtitle:   { color: '#898882', fontSize: '13px' },
    dividerLine:      { background: '#2A2928' },
    dividerText:      { color: '#504F4B' },
    socialButtonsBlockButton: {
      border:     '1px solid #504F4B',
      background: '#161514',
      color:      '#C4C3BE',
    },
    formFieldInput: { borderColor: '#504F4B' },
    formFieldLabel: {
      fontFamily:    '"JetBrains Mono", monospace',
      fontSize:      '10px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color:         '#898882',
    },
  },
} as const;

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0E0D0C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
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
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            color: '#504F4B',
            textTransform: 'uppercase',
            display: 'block',
            marginTop: 8,
          }}
        >
          Motorsport Platform
        </span>
      </div>

      <SignUp
        appearance={appearance}
        forceRedirectUrl="/onboarding"
      />
    </main>
  );
}
