import { tokens } from '@/lib/design-tokens';

const { grey, black } = tokens.colors;

function SkeletonCard() {
  return (
    <div
      style={{
        display:      'flex',
        gap:          12,
        padding:      '20px 24px',
        borderBottom: `1px solid ${grey[700]}22`,
      }}
    >
      {/* Vote column skeleton */}
      <div style={{ flexShrink: 0, width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div className="skeleton" style={{ width: 32, height: 28 }} />
        <div className="skeleton" style={{ width: 20, height: 14, marginTop: 2 }} />
        <div className="skeleton" style={{ width: 32, height: 28 }} />
      </div>

      {/* Content skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 80,  height: 10 }} />
          <div className="skeleton" style={{ width: 60,  height: 10 }} />
          <div className="skeleton" style={{ width: 40,  height: 10 }} />
        </div>
        {/* Title */}
        <div className="skeleton" style={{ width: '65%', height: 18 }} />
        {/* Body */}
        <div className="skeleton" style={{ width: '90%', height: 12 }} />
        <div className="skeleton" style={{ width: '75%', height: 12 }} />
        {/* Actions */}
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          <div className="skeleton" style={{ width: 60, height: 10 }} />
          <div className="skeleton" style={{ width: 40, height: 10 }} />
        </div>
      </div>
    </div>
  );
}

export default function CommunityLoading() {
  return (
    <div style={{ backgroundColor: black, minHeight: '100vh' }}>
      {/* Header skeleton */}
      <div style={{ padding: '32px 40px 24px', borderBottom: `1px solid ${grey[700]}` }}>
        <div className="skeleton" style={{ width: 180, height: 42, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 320, height: 12 }} />
      </div>

      {/* Sort tabs skeleton */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${grey[700]}`, backgroundColor: grey[900], padding: '0 0' }}>
        {['HOT', 'NEW', 'TOP', 'RISING'].map((tab) => (
          <div
            key={tab}
            style={{
              padding:   '12px 24px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize:   10,
              letterSpacing: '0.1em',
              color:      grey[700],
              opacity:    0.4,
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Card skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
