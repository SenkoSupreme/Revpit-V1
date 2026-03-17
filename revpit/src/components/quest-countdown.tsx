'use client';

import { useState, useEffect } from 'react';
import { tokens } from '@/lib/design-tokens';

type Props = { deadline: string };

function getRemaining(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return null;

  const s   = Math.floor(ms / 1_000);
  const m   = Math.floor(s  / 60);
  const h   = Math.floor(m  / 60);
  const d   = Math.floor(h  / 24);

  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${s % 60}s`;
}

export function QuestCountdown({ deadline }: Props) {
  const { grey, accent } = tokens.colors;
  const { mono }         = tokens.fonts;

  const [label, setLabel] = useState<string | null>(() => getRemaining(deadline));

  useEffect(() => {
    const tick = () => setLabel(getRemaining(deadline));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [deadline]);

  const expired  = label === null;
  const urgent   = !expired && new Date(deadline).getTime() - Date.now() < 24 * 3_600_000;

  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: expired ? grey[700] : urgent ? '#FF6B6B' : grey[500],
      }}
    >
      {expired ? 'EXPIRED' : label ?? '—'}
    </span>
  );
}
