import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface GuestRouteProps {
  children: ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const hasToken = !!sessionStorage.getItem('connecte_auth_token');

  // If the user is already authenticated, don't let them see login/signup.
  // Send them to the dashboard, or wherever they originally intended to go.
  if (isAuthenticated || hasToken) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
