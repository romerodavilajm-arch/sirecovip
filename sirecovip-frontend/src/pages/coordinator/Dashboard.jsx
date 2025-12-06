import { useAuth } from '../../context/AuthContext';
import { LogOut, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const metrics = [
    {
      title: 'Total Comerciantes',
      value: '1,234',
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'En Regla',
      value: '987',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'Irregulares',
      value: '247',
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-governmental-navy">
                Bienvenido Coordinador
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Panel de Control
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Resumen general del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-md border-2 ${metric.borderColor} p-6 hover:shadow-lg transition duration-150`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={`${metric.bgColor} p-4 rounded-full`}
                  >
                    <Icon className={`h-8 w-8 ${metric.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Actividad Reciente
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p>No hay actividad reciente para mostrar</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
