'use client';

import { useState } from 'react';
import { useRealtimeDrops } from '@/hooks/use-community-realtime';
import { DropCard, NewDropsBanner } from '@/components/community/drop-card';
import type { Drop } from '@/lib/types/community';

interface Props {
  initialDrops:    Drop[];
  pitId?:          string;
  isAuthenticated?: boolean;
}

export function CommunityFeed({ initialDrops, pitId, isAuthenticated = false }: Props) {
  const [displayDrops, setDisplayDrops] = useState<Drop[]>(initialDrops);
  const [addedCount,   setAddedCount]   = useState(0);

  const { newDrops, banner } = useRealtimeDrops(pitId);

  // Number of new drops not yet merged into the feed
  const pendingCount = newDrops.length - addedCount;

  function handleDismiss() {
    if (!banner || pendingCount === 0) return;
    const toAdd = newDrops.slice(addedCount);
    banner.dismiss();
    setDisplayDrops((prev) => [...toAdd, ...prev]);
    setAddedCount(newDrops.length);
  }

  return (
    <div>
      {pendingCount > 0 && banner && (
        <NewDropsBanner count={pendingCount} dismiss={handleDismiss} />
      )}

      {displayDrops.length === 0 ? (
        <p
          style={{
            fontFamily:      '"JetBrains Mono", monospace',
            fontSize:        11,
            letterSpacing:   '0.1em',
            color:           '#898882',
            textAlign:       'center',
            padding:         '60px 0',
            textTransform:   'uppercase',
          }}
        >
          No drops yet — be the first to post
        </p>
      ) : (
        displayDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} isAuthenticated={isAuthenticated} />
        ))
      )}
    </div>
  );
}
