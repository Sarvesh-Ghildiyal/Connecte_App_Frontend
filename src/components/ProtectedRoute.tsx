import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ProtectedRouteProps {
  /** When true, renders without the DashboardLayout sidebar (e.g. /meta/* pages) */
  hideSidebar?: boolean;
}

/**
 * Wraps protected routes. Redirects to /auth/login if not authenticated.
 * Renders children inside DashboardLayout by default; pass hideSidebar
 * for full-page routes like Meta OAuth that manage their own layout.
 */
export function ProtectedRoute({ hideSidebar = false }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (hideSidebar) {
    return <Outlet />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
