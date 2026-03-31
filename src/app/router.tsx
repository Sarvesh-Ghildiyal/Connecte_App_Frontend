import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

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

// ─── DEV MODE: All routes open, no auth guard ────────────────────────────────
// TODO: Re-enable ProtectedRoute / MetaProtectedRoute before production



export const router = createBrowserRouter([
  // Root
  { path: '/', element: <Navigate to="/auth/login" replace /> },

  // ── Auth pages (no layout) ────────────────────────────────────────────────
  { path: '/auth/login',  element: <Login /> },
  { path: '/auth/signup', element: <Signup /> },

  // ── Meta OAuth pages (no sidebar layout) ─────────────────────────────────
  { path: '/meta/login',    element: <MetaLogin /> },
  { path: '/meta/callback', element: <MetaCallback /> },

  // ── App pages (inside DashboardLayout with sidebar) ───────────────────────
  {
    element: <DashboardLayout><Navigate to="/dashboard" replace /></DashboardLayout>,
    children: [],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout><Dashboard /></DashboardLayout>,
  },
  {
    path: '/templates',
    element: <DashboardLayout><Templates /></DashboardLayout>,
  },
  {
    path: '/templates/create',
    element: <DashboardLayout><CreateTemplate /></DashboardLayout>,
  },
  {
    path: '/contacts',
    element: <DashboardLayout><Contacts /></DashboardLayout>,
  },
  {
    path: '/broadcast',
    element: <DashboardLayout><Broadcast /></DashboardLayout>,
  },
  {
    path: '/chat',
    element: <DashboardLayout><Chat /></DashboardLayout>,
  },

  // Catch-all
  { path: '*', element: <Navigate to="/auth/login" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
