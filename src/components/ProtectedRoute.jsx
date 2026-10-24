import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadError from './LoadError.jsx';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, authError, refetch } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user && authError) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <LoadError
          message="We could not check your sign-in because the server did not respond."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
