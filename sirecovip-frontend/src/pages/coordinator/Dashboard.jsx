import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Store, Eye, CheckCircle, AlertTriangle, Clock, TrendingUp,
  MapPin, Calendar, User, FileText, Mail, Shield, Activity
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import SidebarLayout from '../../components/layouts/SidebarLayout';
import merchantService from '../../services/merchantService';

const Dashboard = () => {
  const { user } = useAuth();
  const isInspector = user?.role === 'inspector';
  const isCoordinator = user?.role === 'coordinator';

  // Estado para datos de comerciantes
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de comerciantes
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const data = await merchantService.getMerchants();
        setMerchants(data);
        setError(null);
      } catch (err) {
        console.error('Error loading merchants:', err);
        setError('Error al cargar los datos');
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  // Calcular métricas para Inspector (filtradas por usuario actual)
  const getInspectorMetrics = () => {
    const myMerchants = merchants.filter(m => m.registered_by === user?.id);
    const total = myMerchants.length;
    const sinFoco = myMerchants.filter(m => m.status === 'sin-foco').length;
    const enObservacion = myMerchants.filter(m => m.status === 'en-observacion').length;
    const focos = myMerchants.filter(m => m.status === 'foco-detectado').length;

    return [
      {
        title: 'Mis Registros',
        value: total.toString(),
        subtitle: 'Total de comerciantes',
        icon: Store,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Sin Foco',
        value: sinFoco.toString(),
        subtitle: total > 0 ? `${Math.round((sinFoco / total) * 100)}% del total` : '0%',
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        title: 'En Observación',
        value: enObservacion.toString(),
        subtitle: total > 0 ? `${Math.round((enObservacion / total) * 100)}% del total` : '0%',
        icon: Eye,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        title: 'Focos Detectados',
        value: focos.toString(),
        subtitle: total > 0 ? `${Math.round((focos / total) * 100)}% del total` : '0%',
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
      },
    ];
  };

  // Calcular métricas para Coordinador (todos los comerciantes)
  const getCoordinatorMetrics = () => {
    const total = merchants.length;
    const sinFoco = merchants.filter(m => m.status === 'sin-foco').length;
    const enObservacion = merchants.filter(m => m.status === 'en-observacion').length;
    const focos = merchants.filter(m => m.status === 'foco-detectado').length;

    return [
      {
        title: 'Total Comerciantes',
        value: total.toString(),
        subtitle: 'En todo el sistema',
        icon: Store,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        trend: 'up',
      },
      {
        title: 'Sin Foco',
        value: sinFoco.toString(),
        subtitle: total > 0 ? `${Math.round((sinFoco / total) * 100)}% del total` : '0%',
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        trend: 'up',
      },
      {
        title: 'En Observación',
        value: enObservacion.toString(),
        subtitle: total > 0 ? `${Math.round((enObservacion / total) * 100)}% del total` : '0%',
        icon: Eye,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        trend: 'neutral',
      },
      {
        title: 'Focos Detectados',
        value: focos.toString(),
        subtitle: total > 0 ? `${Math.round((focos / total) * 100)}% del total` : '0%',
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        trend: 'down',
      },
    ];
  };

  // Función helper para calcular tiempo relativo
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Hace un momento';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-PE');
  };

  // Obtener actividad reciente del inspector (datos reales filtrados)
  const getInspectorActivity = () => {
    const myMerchants = merchants
      .filter(m => m.registered_by === user?.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return myMerchants.map((merchant, index) => ({
      id: merchant.id,
      merchant: merchant.name,
      action: index === 0 ? 'Registré nuevo comerciante' : 'Actualicé inspección',
      status: merchant.status || 'sin-foco',
      time: getRelativeTime(merchant.created_at),
    }));
  };

  // Obtener actividad reciente del coordinador (datos reales)
  const getCoordinatorActivity = () => {
    return merchants
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(merchant => ({
        id: merchant.id,
        inspector: merchant.inspector_name || 'Inspector',
        action: 'Registró nuevo comerciante',
        merchant: merchant.name,
        status: merchant.status || 'sin-foco',
        time: getRelativeTime(merchant.created_at),
      }));
  };

  // Datos personales del inspector (usa datos reales del user)
  const inspectorProfile = {
    name: user?.name || 'Inspector',
    email: user?.email || 'inspector@sirecovip.gob.pe',
    role: 'Inspector de Campo',
    zone: 'Centro', // TODO: Obtener de la base de datos
    dni: '12345678', // TODO: Obtener de la base de datos
    startDate: '2024-01-15', // TODO: Obtener de la base de datos
  };

  // Inspectores activos (solo para coordinador) - TODO: Obtener de la base de datos
  const activeInspectors = [
    { id: 1, name: 'Juan Pérez', zone: 'Centro', merchants: 45, status: 'active' },
    { id: 2, name: 'María García', zone: 'Norte', merchants: 38, status: 'active' },
    { id: 3, name: 'Carlos López', zone: 'Sur', merchants: 52, status: 'active' },
    { id: 4, name: 'Ana Torres', zone: 'Este', merchants: 41, status: 'offline' },
  ];

  // Seleccionar datos según el rol
  const metrics = isInspector ? getInspectorMetrics() : getCoordinatorMetrics();
  const recentActivity = isInspector ? getInspectorActivity() : getCoordinatorActivity();

  // Loading state
  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-900">Error al cargar datos</h3>
                <p className="text-xs text-red-800 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-semibold text-gray-900">
            {isInspector ? 'Mi Perfil' : 'Dashboard'}
          </h1>
          <p className="text-base text-gray-600 mt-2">
            {isInspector
              ? 'Información personal y estadísticas de tu trabajo'
              : 'Resumen general del sistema de monitoreo'
            }
          </p>
        </div>

        {/* Métricas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} variant="elevated" className="hover:shadow-lg transition-shadow duration-200">
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium mb-2">
                        {metric.title}
                      </p>
                      <p className="text-3xl font-semibold text-gray-900 mb-1">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' && (
                          <TrendingUp size={14} className="text-green-600" />
                        )}
                        <p className="text-xs text-gray-500">
                          {metric.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className={`${metric.bgColor} p-3 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>

        {/* Layout específico por rol */}
        {isInspector ? (
          // Vista de Inspector
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Datos Personales - 1/3 width */}
            <div className="xl:col-span-1">
              <Card variant="default">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div>
                      <Card.Title>Datos Personales</Card.Title>
                      <Card.Description>
                        Información del inspector
                      </Card.Description>
                    </div>
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                      {inspectorProfile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {inspectorProfile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Inspector de Campo
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Correo Electrónico</p>
                        <p className="text-sm font-medium text-gray-900">
                          {inspectorProfile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Rol</p>
                        <p className="text-sm font-medium text-gray-900">
                          {inspectorProfile.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Zona Asignada</p>
                        <p className="text-sm font-medium text-gray-900">
                          {inspectorProfile.zone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Activity size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Estado</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p className="text-sm font-medium text-green-700">Activo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Mi Actividad Reciente - 2/3 width */}
            <div className="xl:col-span-2">
              <Card variant="default">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div>
                      <Card.Title>Mi Actividad Reciente</Card.Title>
                      <Card.Description>
                        Últimas acciones realizadas
                      </Card.Description>
                    </div>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </Card.Header>
                <Card.Content className="p-0">
                  {recentActivity.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {activity.merchant}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                            <Badge variant={activity.status} size="sm">
                              {activity.status === 'sin-foco' && 'Sin Foco'}
                              {activity.status === 'en-observacion' && 'En Observación'}
                              {activity.status === 'foco-detectado' && 'Foco Detectado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No hay registros todavía</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Comienza registrando comerciantes en el mapa
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          </div>
        ) : (
          // Vista de Coordinador
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Actividad Reciente - 2/3 width */}
            <div className="xl:col-span-2">
              <Card variant="default">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div>
                      <Card.Title>Actividad Reciente</Card.Title>
                      <Card.Description>
                        Últimas acciones de los inspectores
                      </Card.Description>
                    </div>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </Card.Header>
                <Card.Content className="p-0">
                  {recentActivity.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {activity.inspector}
                                </p>
                                <span className="text-sm text-gray-500">·</span>
                                <p className="text-sm text-gray-600">
                                  {activity.action}
                                </p>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {activity.merchant}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                            <Badge variant={activity.status} size="sm">
                              {activity.status === 'sin-foco' && 'Sin Foco'}
                              {activity.status === 'en-observacion' && 'En Observación'}
                              {activity.status === 'foco-detectado' && 'Foco Detectado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No hay actividad reciente</p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>

            {/* Inspectores Activos - 1/3 width */}
            <div className="xl:col-span-1">
              <Card variant="default">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div>
                      <Card.Title>Inspectores</Card.Title>
                      <Card.Description>
                        Estado actual del equipo
                      </Card.Description>
                    </div>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                </Card.Header>
                <Card.Content className="p-0">
                  <div className="divide-y divide-gray-200">
                    {activeInspectors.map((inspector) => (
                      <div key={inspector.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                              {inspector.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {inspector.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Zona {inspector.zone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${
                              inspector.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-13">
                          <p className="text-xs text-gray-600">
                            {inspector.merchants} comerciantes asignados
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
