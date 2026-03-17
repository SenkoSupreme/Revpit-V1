import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDrop, getReplies } from '@/lib/actions/community';
import { DropCard } from '@/components/community/drop-card';
import { ReplyThread } from '@/components/community/reply-thread';
import { tokens } from '@/lib/design-tokens';
import { PageTransition } from '@/components/layout/page-transition';

const { white, grey, black } = tokens.colors;
const { display, mono } = tokens.fonts;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DropDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [drop, replies] = await Promise.all([
    getDrop(id),
    getReplies(id),
  ]);

  if (!drop) notFound();

  return (
    <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>

      {/* Back nav */}
      <div
        style={{
          padding:      '14px 24px',
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
          display:      'flex',
          alignItems:   'center',
          gap:          10,
          backgroundColor: '#141210',
        }}
      >
        <Link
          href={drop.pit ? `/community/${drop.pit.name}` : '/community'}
          style={{
            fontFamily:     mono,
            fontSize:       9,
            letterSpacing:  '0.12em',
            color:          grey[500],
            textDecoration: 'none',
            textTransform:  'uppercase',
            display:        'flex',
            alignItems:     'center',
            gap:            5,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M7 1L3 5l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {drop.pit ? `r/${drop.pit.name}` : 'Community'}
        </Link>

        {drop.pit && (
          <>
            <span style={{ color: grey[700], fontSize: 10 }}>/</span>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.1em', color: grey[700], textTransform: 'uppercase' }}>
              Drop Thread
            </span>
          </>
        )}
      </div>

      {/* Drop card — full detail */}
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <DropCard drop={drop} />
      </div>

      {/* Reply section */}
      <div style={{ padding: '28px 24px 60px', maxWidth: 760 }}>
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
          }}
        >
          <h2
            style={{
              fontFamily:    display,
              fontSize:      20,
              letterSpacing: '0.06em',
              color:         white,
              lineHeight:    1,
            }}
          >
            REPLIES
          </h2>
          {drop.reply_count > 0 && (
            <span
              style={{
                fontFamily:  mono,
                fontSize:    10,
                color:       grey[700],
                letterSpacing: '0.06em',
              }}
            >
              {drop.reply_count}
            </span>
          )}
        </div>

        <ReplyThread replies={replies} dropId={drop.id} />
      </div>
    </div>
    </PageTransition>
  );
}
