import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../LoadingState';

// If token missing -> /login. If role !== 'admin' -> /dashboard.
// If role === 'admin' -> allow. Purely a UI convenience: every admin API
// route independently enforces role === 'admin' server-side regardless
// of what this component decides.
export default function AdminRoute({ children }) {
  const { user, checkingSession } = useAuth();

  if (checkingSession) return <LoadingState label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
