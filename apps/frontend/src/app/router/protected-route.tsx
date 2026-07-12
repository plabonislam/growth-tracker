import { Navigate, Outlet } from 'react-router';

import { useAuthStore } from '@/store/auth.store';

/** Blocks all child routes unless a decoded auth token is present; redirects to `/login`. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.userId !== null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
