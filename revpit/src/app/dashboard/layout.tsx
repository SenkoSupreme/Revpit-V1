import AppSidebar from '@/components/app-sidebar';
import { tokens } from '@/lib/design-tokens';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: tokens.colors.black }}>
      <AppSidebar />
      <main className="rp-main-content">
        {children}
      </main>
    </div>
  );
}
