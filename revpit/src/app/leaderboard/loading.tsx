import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div>
      <div style={{ padding: '48px 48px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton width={120} height={16} className="skeleton-v2" style={{ marginBottom: 12 }} />
        <Skeleton width={360} height={64} className="skeleton-v2" style={{ marginBottom: 16 }} />
        <Skeleton width={480} height={40} className="skeleton-v2" />
      </div>
      <div style={{ padding: '32px 48px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} height={56} className="skeleton-v2" style={{ marginBottom: 4 }} />
        ))}
      </div>
    </div>
  );
}
