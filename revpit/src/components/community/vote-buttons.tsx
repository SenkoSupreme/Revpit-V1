'use client';

import { useOptimistic, useTransition } from 'react';
import { voteOnDrop } from '@/lib/actions/community';
import { tokens } from '@/lib/design-tokens';
import type { VoteType } from '@/lib/types/community';

const { black, grey, accent } = tokens.colors;
const IDLE_RED = '#FF3B2F';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VoteState {
  revCount:  number;
  idleCount: number;
  userVote:  VoteType | null;
}

interface Props {
  dropId:           string;
  initialRevCount:  number;
  initialIdleCount: number;
  initialUserVote:  VoteType | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VoteButtons({
  dropId,
  initialRevCount,
  initialIdleCount,
  initialUserVote,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic<VoteState, VoteType>(
    { revCount: initialRevCount, idleCount: initialIdleCount, userVote: initialUserVote },
    (state, tappedVote) => {
      if (state.userVote === tappedVote) {
        return {
          revCount:  tappedVote === 'rev'  ? Math.max(0, state.revCount - 1)  : state.revCount,
          idleCount: tappedVote === 'idle' ? Math.max(0, state.idleCount - 1) : state.idleCount,
          userVote:  null,
        };
      }
      if (state.userVote !== null) {
        return {
          revCount:  tappedVote === 'rev'  ? state.revCount + 1 : Math.max(0, state.revCount - 1),
          idleCount: tappedVote === 'idle' ? state.idleCount + 1 : Math.max(0, state.idleCount - 1),
          userVote:  tappedVote,
        };
      }
      return {
        revCount:  tappedVote === 'rev'  ? state.revCount + 1  : state.revCount,
        idleCount: tappedVote === 'idle' ? state.idleCount + 1 : state.idleCount,
        userVote:  tappedVote,
      };
    },
  );

  function handleVote(vote: VoteType) {
    startTransition(async () => {
      setOptimistic(vote);
      await voteOnDrop(dropId, vote);
    });
  }

  const revActive  = optimistic.userVote === 'rev';
  const idleActive = optimistic.userVote === 'idle';

  function fmt(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  }

  const btnBase: React.CSSProperties = {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '5px',
    height:         '34px',
    padding:        '0 10px',
    borderRadius:   '0px',
    cursor:         isPending ? 'not-allowed' : 'pointer',
    opacity:        isPending ? 0.5 : 1,
    transition:     'background 120ms ease, color 120ms ease, border-color 120ms ease',
    fontFamily:     tokens.fonts.mono,
    fontSize:       '10px',
    fontWeight:     700,
    letterSpacing:  '0.08em',
    textTransform:  'uppercase' as const,
    userSelect:     'none' as const,
    outline:        'none',
  };

  return (
    <div
      style={{ display: 'flex', gap: '2px', userSelect: 'none' }}
      aria-label="Vote on this drop"
      aria-live="polite"
    >
      {/* REV */}
      <button
        type="button"
        onClick={() => handleVote('rev')}
        disabled={isPending}
        aria-label={revActive ? 'Remove rev vote' : 'Rev this drop'}
        aria-pressed={revActive}
        style={{
          ...btnBase,
          background:  revActive ? accent : `${grey[700]}28`,
          border:      `1px solid ${revActive ? accent : grey[700]}`,
          color:       revActive ? black : grey[500],
        }}
      >
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
          <path d="M4.5 1L8 6H1L4.5 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
            fill={revActive ? 'currentColor' : 'none'} />
        </svg>
        REV
        {optimistic.revCount > 0 && (
          <span style={{ fontSize: '9px' }}>{fmt(optimistic.revCount)}</span>
        )}
      </button>

      {/* IDLE */}
      <button
        type="button"
        onClick={() => handleVote('idle')}
        disabled={isPending}
        aria-label={idleActive ? 'Remove idle vote' : 'Idle this drop'}
        aria-pressed={idleActive}
        style={{
          ...btnBase,
          background:  idleActive ? `${IDLE_RED}1a` : `${grey[700]}28`,
          border:      `1px solid ${idleActive ? IDLE_RED : grey[700]}`,
          color:       idleActive ? IDLE_RED : grey[500],
        }}
      >
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
          <path d="M4.5 6L1 1H8L4.5 6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
            fill={idleActive ? 'currentColor' : 'none'} />
        </svg>
        IDLE
        {optimistic.idleCount > 0 && (
          <span style={{ fontSize: '9px' }}>{fmt(optimistic.idleCount)}</span>
        )}
      </button>
    </div>
  );
}
