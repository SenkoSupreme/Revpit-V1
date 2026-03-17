import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: 1100 }}>
      <Skeleton width={280} height={56} className="skeleton-v2" style={{ marginBottom: 8 }} />
      <Skeleton width={200} height={16} className="skeleton-v2" style={{ marginBottom: 40 }} />
      <Skeleton width={200} height={80} className="skeleton-v2" style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[1,2,3].map(i => <Skeleton key={i} height={112} className="skeleton-v2" />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Skeleton height={280} className="skeleton-v2" />
        <Skeleton height={280} className="skeleton-v2" />
      </div>
    </div>
  );
}
