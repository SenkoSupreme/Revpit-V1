import { tokens } from '@/lib/design-tokens';

const { grey, black } = tokens.colors;
const { display } = tokens.fonts;

function Skeleton({ w, h }: { w: string | number; h: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h }}
    />
  );
}

export default function DropDetailLoading() {
  return (
    <div style={{ backgroundColor: black, minHeight: '100vh' }}>

      {/* Back nav skeleton */}
      <div style={{ padding: '20px 40px', borderBottom: `1px solid ${grey[700]}`, display: 'flex', gap: 12 }}>
        <Skeleton w={100} h={10} />
        <Skeleton w={80}  h={10} />
      </div>

      {/* Drop card skeleton */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${grey[700]}` }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Vote col */}
          <div style={{ flexShrink: 0, width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Skeleton w={32} h={28} />
            <Skeleton w={20} h={14} />
            <Skeleton w={32} h={28} />
          </div>
          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Skeleton w={80} h={10} />
              <Skeleton w={50} h={10} />
            </div>
            <Skeleton w="60%" h={22} />
            <Skeleton w="95%" h={13} />
            <Skeleton w="80%" h={13} />
            <Skeleton w="70%" h={13} />
          </div>
        </div>
      </div>

      {/* Reply section skeleton */}
      <div style={{ padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div
            style={{
              fontFamily:    display,
              fontSize:      18,
              letterSpacing: '0.06em',
              color:         grey[700],
              opacity:       0.4,
            }}
          >
            REPLIES
          </div>
          <Skeleton w={30} h={10} />
        </div>

        {/* Reply skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              display:      'flex',
              gap:          10,
              marginBottom: 24,
            }}
          >
            {/* Avatar */}
            <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Skeleton w={80}  h={10} />
                <Skeleton w={40}  h={10} />
              </div>
              <Skeleton w={`${85 - i * 10}%`} h={12} />
              <Skeleton w={`${70 - i * 8}%`}  h={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
