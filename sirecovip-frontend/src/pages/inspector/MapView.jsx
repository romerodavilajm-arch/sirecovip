import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Filter, Search, MapPin, Store, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui';
import SidebarLayout from '../../components/layouts/SidebarLayout';
import merchantService from '../../services/merchantService';

// Fix para los iconos por defecto de Leaflet - con validación
try {
  if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
} catch (error) {
  console.error('❌ Error inicializando iconos de Leaflet:', error);
}

// Función para obtener el color del marcador según el estatus
const getMarkerColor = (status) => {
  switch (status) {
    case 'sin-foco':
      return '#10B981'; // Verde (green-500)
    case 'en-observacion':
      return '#F59E0B'; // Ámbar (amber-500)
    case 'prioritario':
      return '#EF4444'; // Rojo (red-500)
    default:
      return '#3B82F6'; // Azul por defecto
  }
};

// Función para crear iconos personalizados según el estatus
const createCustomIcon = (status) => {
  const color = getMarkerColor(status);

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 25px; height: 41px;">
        <svg width="25" height="41" viewBox="0 0 25 41">
          <path fill="${color}" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.867.41 3.638 1.14 5.225L12.5 41l11.36-23.275A12.465 12.465 0 0 0 25 12.5C25 5.596 19.404 0 12.5 0z"/>
          <circle fill="white" cx="12.5" cy="12.5" r="7"/>
        </svg>
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const MapView = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [merchants, setMerchants] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Coordenadas del centro de Querétaro
  const queretaroCenter = [20.5888, -100.3899];

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [merchantsData, orgsData] = await Promise.all([
          merchantService.getMerchants(),
          merchantService.getOrganizations(),
        ]);
        setMerchants(merchantsData);
        setOrganizations(orgsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Opciones de filtro (solo estatus válidos según el schema de BD)
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'sin-foco', label: 'Sin Foco' },
    { value: 'en-observacion', label: 'En Observación' },
    { value: 'prioritario', label: 'Prioritario' },
  ];

  const organizationOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Todas las organizaciones' },
      ...organizations.map((org) => ({
        value: org.id.toString(),
        label: org.name,
      })),
    ];
  }, [organizations]);

  // Filtrar comerciantes
  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      // Filtro de búsqueda
      const matchesSearch =
        searchQuery === '' ||
        merchant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.business?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de estatus
      const matchesStatus = filterStatus === 'all' || merchant.status === filterStatus;

      // Filtro de organización
      const matchesOrg =
        filterOrganization === 'all' ||
        merchant.organization_id?.toString() === filterOrganization;

      // Solo mostrar comerciantes con coordenadas válidas
      const hasValidCoordinates =
        merchant.latitude != null &&
        merchant.longitude != null &&
        !isNaN(parseFloat(merchant.latitude)) &&
        !isNaN(parseFloat(merchant.longitude));

      return matchesSearch && matchesStatus && matchesOrg && hasValidCoordinates;
    });
  }, [merchants, searchQuery, filterStatus, filterOrganization]);

  // Calcular estadísticas rápidas
  const quickStats = useMemo(() => {
    const stats = {
      'sin-foco': 0,
      'en-observacion': 0,
      'prioritario': 0,
    };

    filteredMerchants.forEach((merchant) => {
      if (stats.hasOwnProperty(merchant.status)) {
        stats[merchant.status]++;
      }
    });

    return [
      {
        label: 'Sin Foco',
        value: stats['sin-foco'],
        color: 'text-green-600',
        icon: CheckCircle,
      },
      {
        label: 'En Observación',
        value: stats['en-observacion'],
        color: 'text-amber-600',
        icon: Eye,
      },
      {
        label: 'Prioritarios',
        value: stats['prioritario'],
        color: 'text-red-600',
        icon: AlertTriangle,
      },
    ];
  }, [filteredMerchants]);

  // Comerciantes para el panel lateral (primeros 10)
  const sidebarMerchants = useMemo(() => {
    return filteredMerchants.slice(0, 10);
  }, [filteredMerchants]);

  // Función para obtener el label del estatus
  const getStatusLabel = (status) => {
    switch (status) {
      case 'sin-foco':
        return 'Sin Foco';
      case 'en-observacion':
        return 'En Observación';
      case 'prioritario':
        return 'Prioritario';
      default:
        return status;
    }
  };

  return (
    <SidebarLayout>
      <div className="flex h-full">
        {/* Map Container - Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Header con controles */}
          <div className="bg-white border-b border-gray-200 p-4 space-y-4">
            <div>
              <h1 className="text-h2 text-gray-900">Mapa de Comerciantes</h1>
              <p className="text-body-sm text-gray-600 mt-1">
                Vista geográfica de comerciantes en tu zona
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  icon={Search}
                  iconPosition="left"
                  placeholder="Buscar por nombre, dirección o giro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="sm:w-56">
                <Select
                  icon={Filter}
                  options={organizationOptions}
                  value={filterOrganization}
                  onChange={(e) => setFilterOrganization(e.target.value)}
                />
              </div>
              <div className="sm:w-56">
                <Select
                  icon={Filter}
                  options={statusOptions}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon size={18} className={stat.color} />
                    <span className="text-body-sm text-gray-700">
                      <span className="font-semibold">{stat.value}</span> {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 bg-gray-100 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-body text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-h3 text-gray-900 mb-2">Error al cargar</h3>
                  <p className="text-body text-gray-600">{error}</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={queretaroCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marcadores de comerciantes */}
                {filteredMerchants.map((merchant) => {
                  const lat = parseFloat(merchant.latitude);
                  const lng = parseFloat(merchant.longitude);

                  return (
                    <Marker
                      key={merchant.id}
                      position={[lat, lng]}
                      icon={createCustomIcon(merchant.status)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-start gap-2 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                {merchant.name}
                              </h3>
                              {merchant.business && (
                                <p className="text-xs text-gray-600">
                                  {merchant.business}
                                </p>
                              )}
                            </div>
                          </div>

                          {merchant.address && (
                            <p className="text-xs text-gray-600 mb-2 flex items-start gap-1">
                              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                              <span>{merchant.address}</span>
                            </p>
                          )}

                          <div className="mb-3">
                            <Badge variant={merchant.status} size="sm">
                              {getStatusLabel(merchant.status)}
                            </Badge>
                          </div>

                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/app/merchants/${merchant.id}`)}
                          >
                            Ver Detalle
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}

            {/* Botón flotante de agregar */}
            <div className="absolute bottom-6 right-6 z-[1000]">
              <Button
                variant="default"
                size="lg"
                className="rounded-full shadow-xl hover:shadow-2xl gap-2"
                onClick={() => navigate('/app/merchants/new')}
              >
                <Plus size={24} />
                <span className="hidden sm:inline">Nuevo Comerciante</span>
              </Button>
            </div>

            {/* Leyenda del mapa */}
            <Card className="absolute top-4 right-4 w-64 z-[1000] shadow-lg">
              <Card.Header className="pb-3">
                <Card.Title as="h4">Leyenda</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-2 pt-0">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-body-sm text-gray-700">Sin Foco</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-body-sm text-gray-700">En Observación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-body-sm text-gray-700">Prioritario</span>
                </div>
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <p className="text-xs text-gray-500">
                    {filteredMerchants.length} comerciante(s) mostrado(s)
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Panel Lateral - Lista de Comerciantes */}
        <div className="hidden lg:block w-96 border-l border-gray-200 bg-white overflow-y-auto scrollbar-thin">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-h4 text-gray-900">Comerciantes en Mapa</h2>
            <p className="text-caption text-gray-600 mt-1">
              {filteredMerchants.length} en total
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-body-sm text-gray-600">Cargando...</p>
            </div>
          ) : sidebarMerchants.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-body-sm text-gray-600">
                No se encontraron comerciantes con coordenadas válidas
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {sidebarMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className="p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                    onClick={() => navigate(`/app/merchants/${merchant.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Store className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body-sm font-semibold text-gray-900 truncate">
                            {merchant.name}
                          </h3>
                          <p className="text-caption text-gray-600 mt-0.5 truncate">
                            {merchant.address || 'Sin dirección'}
                          </p>
                          {merchant.business && (
                            <p className="text-caption text-gray-500 mt-0.5 truncate">
                              {merchant.business}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between ml-13">
                      <Badge variant={merchant.status} size="sm">
                        {getStatusLabel(merchant.status)}
                      </Badge>
                      {merchant.updated_at && (
                        <span className="text-caption text-gray-500">
                          {new Date(merchant.updated_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ver todos */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/app/merchants')}
                >
                  Ver todos los comerciantes
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default MapView;
