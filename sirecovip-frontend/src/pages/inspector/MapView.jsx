import { useAuth } from '../../context/AuthContext';
import { LogOut, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MapView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-governmental-navy">
                Bienvenido Inspector
              </h1>
              <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Map className="h-6 w-6 text-governmental-blue" />
            <h2 className="text-xl font-semibold text-gray-800">
              Vista de Mapa
            </h2>
          </div>

          <div className="border-4 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">
                Aquí se cargará el Mapa
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Integración con sistema de mapas pendiente
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapView;
