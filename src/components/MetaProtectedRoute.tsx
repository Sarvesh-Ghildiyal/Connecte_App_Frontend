import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

interface MetaProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps Meta-required routes. Redirects to /dashboard if Meta is not connected.
 */
export function MetaProtectedRoute({ children }: MetaProtectedRouteProps) {
  const { isMetaConnected } = useAuth();

  if (!isMetaConnected) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
