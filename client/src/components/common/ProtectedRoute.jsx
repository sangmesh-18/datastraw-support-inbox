import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="full-page-loader">
        <Loader2 size={36} className="spin text-indigo" />
        <p>Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="full-page-loader">
        <Loader2 size={36} className="spin text-indigo" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/inbox" replace />;
  }

  return children;
}

