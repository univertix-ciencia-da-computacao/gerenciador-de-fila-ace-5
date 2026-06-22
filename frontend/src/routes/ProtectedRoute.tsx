import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
