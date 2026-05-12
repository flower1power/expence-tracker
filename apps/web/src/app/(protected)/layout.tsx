import { AuthGuard } from '@/features/auth';
import { DashboardHeader } from '@/widgets/dashboard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
