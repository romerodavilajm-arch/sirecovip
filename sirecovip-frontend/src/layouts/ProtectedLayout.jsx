import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedLayout = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'inspector') {
    return <Navigate to="/app/map" replace />;
  }

  if (role === 'coordinator') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
