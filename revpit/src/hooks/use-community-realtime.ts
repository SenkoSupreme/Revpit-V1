'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Drop } from '@/lib/types/community';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewDropsBanner {
  /** How many new drops arrived since page load */
  count:   number;
  /** Call to flush newDrops into the feed and hide the banner */
  dismiss: () => void;
}

export interface UseRealtimeDropsReturn {
  /** Buffered new drops — prepend these to the feed on dismiss */
  newDrops: Drop[];
  /** Banner state — null when nothing new */
  banner:   NewDropsBanner | null;
}

export interface UseRealtimeVotesReturn {
  revCount:  number;
  idleCount: number;
  score:     number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stable channel name so React StrictMode double-mount doesn't leak */
function dropsChannel(pitId?: string) {
  return pitId ? `drops:pit:${pitId}` : 'drops:all';
}

function votesChannel(dropId: string) {
  return `votes:drop:${dropId}`;
}

// ─── 1. useRealtimeDrops ──────────────────────────────────────────────────────

/**
 * Subscribes to INSERT events on public.drops.
 * Buffers new drops and surfaces a banner until the user dismisses it.
 *
 * @param pitId - Optional pit UUID to scope the subscription
 */
export function useRealtimeDrops(pitId?: string): UseRealtimeDropsReturn {
  const [newDrops, setNewDrops] = useState<Drop[]>([]);
  const [banner,   setBanner]   = useState<NewDropsBanner | null>(null);

  // Stable ref so dismiss() always sees current newDrops count
  const newDropsRef = useRef<Drop[]>([]);

  const dismiss = useCallback(() => {
    setBanner(null);
    // Caller gets the snapshot via newDrops state — reset after they consume
    // We keep newDrops populated so the parent can prepend them; caller should
    // reset by re-mounting or via a separate clearNewDrops() if needed.
  }, []);

  useEffect(() => {
    const supabase   = createClient();
    const name       = dropsChannel(pitId);

    // Build filter string for Realtime
    const filter     = pitId ? `pit_id=eq.${pitId}` : undefined;

    let channel: RealtimeChannel;

    function subscribe() {
      channel = supabase.channel(name);

      const builder = channel.on(
        'postgres_changes' as Parameters<typeof channel.on>[0],
        {
          event:  'INSERT',
          schema: 'public',
          table:  'drops',
          ...(filter ? { filter } : {}),
        },
        (payload: { new: Record<string, unknown> }) => {
          const drop = payload.new as Drop;

          setNewDrops((prev) => {
            const next = [drop, ...prev];
            newDropsRef.current = next;
            return next;
          });

          setBanner({
            count:   newDropsRef.current.length,
            dismiss,
          });
        },
      );

      builder.subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[useRealtimeDrops] channel error — will retry', err);
          // Supabase client auto-reconnects; we just log
        }
      });
    }

    subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitId]);

  // Keep banner count in sync when newDrops length changes
  useEffect(() => {
    if (newDrops.length === 0) return;
    setBanner((prev) =>
      prev ? { ...prev, count: newDrops.length } : null,
    );
  }, [newDrops.length]);

  return { newDrops, banner };
}

// ─── 2. useRealtimeVotes ──────────────────────────────────────────────────────

/**
 * Subscribes to UPDATE events on public.drops for a specific drop.
 * Returns live vote counts that update without a page refresh.
 *
 * @param dropId       - The drop UUID to watch
 * @param initialCounts - Seed values from SSR so the first render is correct
 */
export function useRealtimeVotes(
  dropId: string,
  initialCounts: { revCount: number; idleCount: number; score: number },
): UseRealtimeVotesReturn {
  const [revCount,  setRevCount]  = useState(initialCounts.revCount);
  const [idleCount, setIdleCount] = useState(initialCounts.idleCount);
  const [score,     setScore]     = useState(initialCounts.score);

  useEffect(() => {
    const supabase = createClient();
    const name     = votesChannel(dropId);

    const channel = supabase
      .channel(name)
      .on(
        'postgres_changes' as Parameters<ReturnType<typeof supabase.channel>['on']>[0],
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'drops',
          filter: `id=eq.${dropId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as {
            rev_count: number;
            idle_count: number;
            score: number;
          };
          setRevCount(row.rev_count);
          setIdleCount(row.idle_count);
          setScore(row.score);
        },
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[useRealtimeVotes] channel error', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId]);

  // Re-seed if the parent component refreshes server data (e.g. after revalidation)
  useEffect(() => {
    setRevCount(initialCounts.revCount);
    setIdleCount(initialCounts.idleCount);
    setScore(initialCounts.score);
  }, [initialCounts.revCount, initialCounts.idleCount, initialCounts.score]);

  return { revCount, idleCount, score };
}
