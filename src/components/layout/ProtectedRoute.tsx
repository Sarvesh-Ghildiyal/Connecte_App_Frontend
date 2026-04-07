import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Also check session storage synchronously to prevent a flash-of-redirect 
  // on a hard page reload before Zustand can rehydrate the auth state.
  const hasToken = !!sessionStorage.getItem('connecte_auth_token');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
