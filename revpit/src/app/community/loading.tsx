import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityLoading() {
  return (
    <div style={{ padding: '32px 48px' }}>
      <Skeleton width={280} height={56} className="skeleton-v2" style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} width={80} height={32} className="skeleton-v2" />)}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={120} className="skeleton-v2" style={{ marginBottom: 8 }} />
      ))}
    </div>
  );
}
