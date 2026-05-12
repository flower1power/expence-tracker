import { AuthGuard } from '@/features/auth';
import { DashboardHeader } from '@/widgets/dashboard';

/**
 * Layout для защищённых маршрутов. Оборачивает контент в AuthGuard,
 * который перенаправляет неаутентифицированных пользователей на /login.
 *
 * @param children - Контент защищённой страницы
 */
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
