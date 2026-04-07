import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Route Protection
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { GuestRoute } from '@/components/layout/GuestRoute';

// Layout
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Auth pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';

// Meta OAuth pages
import MetaLogin from '@/pages/meta/MetaLogin';
import MetaCallback from '@/pages/meta/MetaCallback';

// App pages
import Dashboard from '@/pages/Dashboard';
import Templates from '@/pages/Templates';
import CreateTemplate from '@/pages/templates/CreateTemplate';
import Contacts from '@/pages/Contacts';
import Chat from '@/pages/Chat';
import Broadcast from '@/pages/Broadcast';
import Settings from '@/pages/Settings';

// ─── DEV MODE: All routes open, no auth guard ────────────────────────────────
// TODO: Re-enable MetaProtectedRoute before production

// Helper to wrap pages requiring basic auth
const ProtectedAppPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  // Root
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // ── Auth pages (no layout) ────────────────────────────────────────────────
  { path: '/auth/login',  element: <GuestRoute><Login /></GuestRoute> },
  { path: '/auth/signup', element: <GuestRoute><Signup /></GuestRoute> },

  // ── Meta OAuth pages (no sidebar layout) ─────────────────────────────────
  { path: '/meta/login',    element: <MetaLogin /> },
  { path: '/meta/callback', element: <MetaCallback /> },

  // ── App pages (inside DashboardLayout with sidebar) ───────────────────────
  {
    element: <ProtectedAppPage><Navigate to="/dashboard" replace /></ProtectedAppPage>,
    children: [],
  },
  {
    path: '/dashboard',
    element: <ProtectedAppPage><Dashboard /></ProtectedAppPage>,
  },
  {
    path: '/templates',
    element: <ProtectedAppPage><Templates /></ProtectedAppPage>,
  },
  {
    path: '/templates/create',
    element: <ProtectedAppPage><CreateTemplate /></ProtectedAppPage>,
  },
  {
    path: '/contacts',
    element: <ProtectedAppPage><Contacts /></ProtectedAppPage>,
  },
  {
    path: '/broadcast',
    element: <ProtectedAppPage><Broadcast /></ProtectedAppPage>,
  },
  {
    path: '/chat',
    element: <ProtectedAppPage><Chat /></ProtectedAppPage>,
  },
  {
    path: '/settings',
    element: <ProtectedAppPage><Settings /></ProtectedAppPage>,
  },

  // Catch-all
  { path: '*', element: <Navigate to="/auth/login" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
