import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../LoadingState';

// If token missing -> redirect to /login. If token exists -> allow.
// (Backend authorization is still mandatory and enforced independently —
// this only controls what the UI renders.)
export default function ProtectedRoute({ children }) {
  const { user, checkingSession } = useAuth();

  if (checkingSession) return <LoadingState label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
