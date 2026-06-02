import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function ProtectedRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
