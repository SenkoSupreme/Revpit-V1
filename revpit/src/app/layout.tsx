import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-display',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'REVPIT',
  description: 'Motorsport Platform',
  icons: {
    icon: '/images/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <body
          className="antialiased"
          style={{ backgroundColor: '#0E0D0C' }}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
