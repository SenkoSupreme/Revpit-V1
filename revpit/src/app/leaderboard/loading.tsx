import { Skeleton } from '@/components/ui/skeleton';

function RowSkeleton({ delay }: { delay: number }) {
  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           16,
        padding:       '14px 48px',
        borderBottom:  '1px solid rgba(255,255,255,0.05)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Rank */}
      <Skeleton width={28} height={14} />
      {/* Avatar */}
      <Skeleton circle width={32} height={32} />
      {/* Name + car */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="40%" height={13} />
        <Skeleton width="25%" height={10} />
      </div>
      {/* Score */}
      <Skeleton width={70} height={14} />
      {/* Tier */}
      <Skeleton width={60} height={20} />
      {/* Trend */}
      <Skeleton width={36} height={10} />
    </div>
  );
}

export default function LeaderboardLoading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0E0D0C' }}>
      {/* Header skeleton */}
      <div style={{ padding: '48px 48px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton width={120} height={10} style={{ marginBottom: 14 }} />
        <Skeleton width={380} height={56} style={{ marginBottom: 16 }} />
        <Skeleton width={460} height={14} />
      </div>

      {/* Toolbar */}
      <div style={{ padding: '20px 48px', display: 'flex', gap: 16, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} width={80} height={32} />)}
        </div>
        <Skeleton width={220} height={36} />
      </div>

      {/* Table rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <RowSkeleton key={i} delay={i * 30} />
      ))}
    </div>
  );
}
