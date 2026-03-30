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

// ─── DEV MODE: All routes open, no auth guard ────────────────────────────────
// TODO: Re-enable ProtectedRoute / MetaProtectedRoute before production

const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-2">
    <p className="text-label-md text-foreground/40 tracking-widest">{name}</p>
    <p className="text-sm text-muted-foreground">Coming soon</p>
  </div>
);

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
    element: <DashboardLayout><PlaceholderPage name="BROADCAST" /></DashboardLayout>,
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
