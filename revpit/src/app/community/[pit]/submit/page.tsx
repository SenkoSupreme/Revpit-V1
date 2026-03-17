import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getPit } from '@/lib/actions/community';
import { createClient } from '@/lib/supabase/server';
import { SubmitDropClient } from './submit-client';
import { tokens } from '@/lib/design-tokens';

const { white, grey, black } = tokens.colors;
const { display, mono } = tokens.fonts;

interface PageProps {
  params: Promise<{ pit: string }>;
}

export default async function SubmitPage({ params }: PageProps) {
  const { pit: pitName } = await params;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [pit] = await Promise.all([getPit(pitName)]);
  if (!pit) notFound();

  // Fetch user profile for build_update pre-fill
  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('clerk_id', userId)
    .single<{ id: string; username: string }>();

  const userId_db = profileRow?.id ?? '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: black }}>
      {/* Header */}
      <div
        style={{
          padding:      '28px 40px',
          borderBottom: `1px solid ${grey[700]}`,
        }}
      >
        <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: grey[500], textTransform: 'uppercase', marginBottom: 12 }}>
          <a href={`/community/${pitName}`} style={{ color: grey[500], textDecoration: 'none' }}>
            ← {pit.display_name}
          </a>
        </p>
        <h1
          style={{
            fontFamily:    display,
            fontSize:      36,
            letterSpacing: '0.04em',
            color:         white,
            lineHeight:    1,
            marginBottom:  4,
          }}
        >
          NEW DROP
        </h1>
        <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', color: grey[500], textTransform: 'uppercase' }}>
          SHARE YOUR BUILD, CONTENT OR DISCUSSION IN {pit.display_name.toUpperCase()}
        </p>
      </div>

      {/* Client form */}
      <div style={{ padding: '32px 40px 60px', maxWidth: 760 }}>
        <SubmitDropClient
          pitId={pit.id}
          pitDisplayName={pit.display_name}
          userId={userId_db}
        />
      </div>
    </div>
  );
}
