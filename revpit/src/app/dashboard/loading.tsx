import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: 1060 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={220} height={48} style={{ marginBottom: 8 }} />
        <Skeleton width={280} height={10} />
      </div>

      {/* Stat cards row */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 16,
          marginBottom:        28,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              padding:         '22px 24px',
              border:          '1px solid rgba(255,255,255,0.06)',
              backgroundColor: '#1C1B19',
              display:         'flex',
              flexDirection:   'column',
              gap:             14,
            }}
          >
            <Skeleton width="60%" height={10} />
            <Skeleton width="55%" height={48} />
            <Skeleton width="35%" height={10} />
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              padding:         '22px 24px',
              border:          '1px solid rgba(255,255,255,0.06)',
              backgroundColor: '#1C1B19',
              display:         'flex',
              flexDirection:   'column',
              gap:             16,
            }}
          >
            <Skeleton width="45%" height={18} />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Skeleton circle width={34} height={34} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="80%" height={12} />
                  <Skeleton width="40%" height={9} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
