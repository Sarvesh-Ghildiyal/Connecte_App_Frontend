import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from '../App';
// Placeholder for Auth checking logic
const isAuthenticated = () => !!sessionStorage.getItem('connecte_auth_token');

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <div>Login Page Placeholder</div>,
          },
          {
            path: 'signup',
            element: <div>Signup Page Placeholder</div>,
          },
        ],
      },
      {
        path: 'dashboard',
        element: <div>Dashboard Placeholder</div>,
      },
      {
        path: 'templates',
        element: <div>Templates Placeholder</div>,
      },
      {
        path: 'contacts',
        element: <div>Contacts Placeholder</div>,
      },
      {
        path: 'broadcast',
        element: <div>Broadcast Placeholder</div>,
      },
      {
        path: 'chat',
        element: <div>Chat Placeholder</div>,
      },
      {
        path: 'meta',
        children: [
          {
            path: 'login',
            element: <div>Meta Login Placeholder</div>,
          },
          {
            path: 'callback',
            element: <div>Meta Callback Placeholder</div>,
          },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
