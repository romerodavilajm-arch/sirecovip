import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, MapPin, Upload, Camera, Loader, AlertCircle, CheckCircle, FileText, Edit, X
} from 'lucide-react';
import { Button, Input, Select, Card, Textarea } from '../../components/ui';
import SidebarLayout from '../../components/layouts/SidebarLayout';
import merchantService from '../../services/merchantService';

const MerchantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Estado para controlar modo lectura/edición
  const [isEditing, setIsEditing] = useState(!isEditMode); // false si existe id (modo lectura), true si es nuevo

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    address: '',
    address_references: '',
    delegation: '',
    latitude: '',
    longitude: '',
    schedule_start: '',
    schedule_end: '',
    organization_id: '',
    stand_type: 'semifijo',
    operating_days: [],
    license_number: '',
    notes: '',
  });

  // Catálogos
  const [organizations, setOrganizations] = useState([]);

  // Estado de archivos
  const [stallPhoto, setStallPhoto] = useState(null);
  const [stallPhotoPreview, setStallPhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]); // Nuevos documentos a subir
  const [existingDocuments, setExistingDocuments] = useState([]); // Documentos existentes en BD

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Opciones para stand_type
  const standTypes = [
    { value: 'semifijo', label: 'Semifijo' },
    { value: 'fijo', label: 'Fijo' },
    { value: 'rotativo', label: 'Rotativo' },
  ];

  // Opciones para delegations (Querétaro)
  const delegations = [
    { value: 'Centro Historico', label: 'Centro Histórico' },
    { value: 'Epigmenio Gonzalez', label: 'Epigmenio González' },
    { value: 'Santa Rosa Jáuregui', label: 'Santa Rosa Jáuregui' },
    { value: 'Felix Osores Sotomayor', label: 'Felix Osores Sotomayor' },
    { value: 'Felipe Carrillo Puerto', label: 'Felipe Carrillo Puerto' },
  ];

  // Días de la semana
  const daysOfWeek = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  // Cargar organizaciones
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const data = await merchantService.getOrganizations();
        setOrganizations(data.map(org => ({
          value: org.id,
          label: org.name
        })));
      } catch (err) {
        console.error('Error loading organizations:', err);
      }
    };
    fetchOrganizations();
  }, []);

  // Cargar datos si es modo edición
  useEffect(() => {
    if (isEditMode) {
      const fetchMerchant = async () => {
        try {
          setLoading(true);
          const data = await merchantService.getMerchantById(id);
          setFormData({
            name: data.name || '',
            business: data.business || '',
            address: data.address || '',
            address_references: data.address_references || '',
            delegation: data.delegation || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            schedule_start: data.schedule_start || '',
            schedule_end: data.schedule_end || '',
            organization_id: data.organization_id || '',
            stand_type: data.stand_type || 'semifijo',
            operating_days: data.operating_days || [],
            license_number: data.license_number || '',
            notes: data.notes || '',
          });
          if (data.stall_photo_url) {
            setStallPhotoPreview(data.stall_photo_url);
          }
          // Cargar documentos existentes
          if (data.documents && Array.isArray(data.documents)) {
            setExistingDocuments(data.documents);
          }
        } catch (err) {
          setError('Error al cargar el comerciante');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMerchant();
    }
  }, [id, isEditMode]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Manejar cambios en días de operación
  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.operating_days.includes(day)
        ? prev.operating_days.filter(d => d !== day)
        : [...prev.operating_days, day];
      return { ...prev, operating_days: days };
    });
  };

  // Obtener ubicación actual
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada en tu navegador');
      return;
    }

    setLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Error al obtener la ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
          default:
            errorMessage = 'Error desconocido al obtener ubicación';
        }

        setError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Manejar selección de foto del puesto
  const handleStallPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      setStallPhoto(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setStallPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Manejar selección de documentos
  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);

    // Validar que sean imágenes o PDFs
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!isValid) {
        setError(`El archivo ${file.name} no es válido. Solo se aceptan imágenes y PDFs.`);
      }
      return isValid;
    });

    setDocuments(prev => [...prev, ...validFiles]);
    setError(null);
  };

  // Eliminar documento
  const handleRemoveDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Validar formulario
  const validateForm = () => {
    const validationErrors = [];

    if (!formData.name.trim()) {
      validationErrors.push('El nombre del comerciante es obligatorio');
    }
    if (!formData.business.trim()) {
      validationErrors.push('El giro del negocio es obligatorio');
    }
    if (!formData.address.trim()) {
      validationErrors.push('La dirección es obligatoria');
    }
    if (!formData.delegation) {
      validationErrors.push('La delegación es obligatoria');
    }
    if (!formData.latitude || !formData.longitude) {
      validationErrors.push('Las coordenadas de ubicación son obligatorias');
    }
    if (!formData.schedule_start || !formData.schedule_end) {
      validationErrors.push('El horario de operación es obligatorio');
    }

    // Si hay errores, mostrarlos
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join('\n• ');
      setError(`Por favor completa los siguientes campos:\n• ${errorMessage}`);
      // Scroll al inicio para ver el error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug logging
    console.log('🔄 Iniciando guardado...', {
      isEditMode,
      formData,
      hasStallPhoto: !!stallPhoto,
      documentsCount: documents.length
    });

    if (!validateForm()) {
      console.log('❌ Validación fallida');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();

      // Agregar campos del formulario
      formDataToSend.append('name', formData.name);
      formDataToSend.append('business', formData.business);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('address_references', formData.address_references);
      formDataToSend.append('delegation', formData.delegation);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('schedule_start', formData.schedule_start);
      formDataToSend.append('schedule_end', formData.schedule_end);
      formDataToSend.append('stand_type', formData.stand_type);
      formDataToSend.append('license_number', formData.license_number);
      formDataToSend.append('notes', formData.notes);

      // Agregar organization_id solo si existe
      if (formData.organization_id) {
        formDataToSend.append('organization_id', formData.organization_id);
      }

      // Convertir operating_days a JSON string para enviar como array
      formDataToSend.append('operating_days', JSON.stringify(formData.operating_days));

      // Agregar foto del puesto si existe
      if (stallPhoto) {
        formDataToSend.append('image', stallPhoto);
      }

      // Agregar documentos si existen (todos con el mismo nombre 'documents')
      documents.forEach((doc) => {
        formDataToSend.append('documents', doc);
      });

      // Enviar datos
      console.log('📤 Enviando datos al servidor...', isEditMode ? 'UPDATE' : 'CREATE');
      console.log('📊 FormData contents:', {
        id,
        endpoint: isEditMode ? `PUT /api/merchants/${id}` : 'POST /api/merchants',
        hasNewPhoto: !!stallPhoto,
        newDocumentsCount: documents.length
      });

      let response;
      if (isEditMode) {
        response = await merchantService.updateMerchant(id, formDataToSend);
        console.log('✅ Comerciante actualizado:', response);
      } else {
        response = await merchantService.createMerchant(formDataToSend);
        console.log('✅ Comerciante creado:', response);
      }

      setSuccess(true);
      console.log('✅ Guardado exitoso, redirigiendo...');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/app/merchants');
      }, 2000);

    } catch (err) {
      console.error('❌ Error saving merchant:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al guardar el comerciante';
      setError(errorMessage);
      // Mostrar alert adicional para debugging
      alert(`Error al guardar:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    if (isEditMode) {
      setIsEditing(false);
      // Recargar datos originales
      window.location.reload();
    } else {
      navigate('/app/merchants');
    }
  };

  // Obtener el label de una organización por ID
  const getOrganizationLabel = (orgId) => {
    const org = organizations.find(o => o.value === orgId);
    return org ? org.label : 'Sin organización';
  };

  // Obtener el label de una delegación
  const getDelegationLabel = (delValue) => {
    const del = delegations.find(d => d.value === delValue);
    return del ? del.label : delValue;
  };

  // Obtener el label del tipo de puesto
  const getStandTypeLabel = (type) => {
    const stand = standTypes.find(s => s.value === type);
    return stand ? stand.label : type;
  };

  // Mensaje de éxito
  if (success) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card variant="elevated" className="max-w-md w-full">
            <Card.Content className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {isEditMode ? 'Comerciante Actualizado' : 'Comerciante Registrado'}
              </h2>
              <p className="text-gray-600 mb-4">
                Los datos se han guardado correctamente
              </p>
              <p className="text-sm text-gray-500">Redirigiendo a la lista...</p>
            </Card.Content>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Volver
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">
                {isEditMode ? (isEditing ? 'Editar Comerciante' : 'Detalles del Comerciante') : 'Nuevo Comerciante'}
              </h1>
              <p className="text-base text-gray-600 mt-2">
                {isEditMode
                  ? (isEditing ? 'Actualiza los datos del comerciante' : 'Información completa del comerciante')
                  : 'Registra un nuevo comerciante en el sistema'
                }
              </p>
            </div>

            {/* Botón de editar en el header (solo en modo lectura) */}
            {isEditMode && !isEditing && (
              <Button
                variant="default"
                size="md"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit size={20} />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Mensaje de error global */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-md p-4 shadow-md">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error de Validación</h3>
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card variant="default">
            <Card.Header>
              <Card.Title>Información General</Card.Title>
              <Card.Description>
                Datos básicos del comerciante
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    id="name"
                    name="name"
                    label="Nombre del Comerciante *"
                    placeholder="Ej: Juan Pérez López"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    id="business"
                    name="business"
                    label="Giro / Actividad Comercial *"
                    placeholder="Ej: Venta de comida preparada, accesorios, ropa, etc."
                    value={formData.business}
                    onChange={handleInputChange}
                    required
                  />

                  <Select
                    id="organization_id"
                    name="organization_id"
                    label="Organización"
                    placeholder="Seleccionar organización (opcional)"
                    options={organizations}
                    value={formData.organization_id}
                    onChange={handleInputChange}
                  />

                  <Input
                    id="license_number"
                    name="license_number"
                    label="Número de Licencia"
                    placeholder="Ej: LIC-2024-00123"
                    value={formData.license_number}
                    onChange={handleInputChange}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nombre del Comerciante</label>
                    <p className="text-base text-gray-900">{formData.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Giro / Actividad Comercial</label>
                    <p className="text-base text-gray-900">{formData.business || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Organización</label>
                    <p className="text-base text-gray-900">{getOrganizationLabel(formData.organization_id)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Número de Licencia</label>
                    <p className="text-base text-gray-900">{formData.license_number || 'N/A'}</p>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Ubicación */}
          <Card variant="default">
            <Card.Header>
              <Card.Title>Ubicación</Card.Title>
              <Card.Description>
                Dirección y coordenadas del comerciante
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    id="address"
                    name="address"
                    label="Dirección *"
                    placeholder="Ej: Av. 5 de Febrero #123"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    id="address_references"
                    name="address_references"
                    label="Referencias de Ubicación"
                    placeholder="Ej: Frente al Mercado Municipal, entre calle X y Y"
                    value={formData.address_references}
                    onChange={handleInputChange}
                  />

                  <Select
                    id="delegation"
                    name="delegation"
                    label="Delegación *"
                    placeholder="Seleccionar delegación"
                    options={delegations}
                    value={formData.delegation}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      label="Latitud *"
                      placeholder="20.588793"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                    />

                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      label="Longitud *"
                      placeholder="-100.389880"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className="w-full"
                  >
                    {loadingLocation ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Obteniendo ubicación...
                      </>
                    ) : (
                      <>
                        <MapPin size={20} />
                        Obtener Ubicación Actual
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                    <p className="text-base text-gray-900">{formData.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Referencias de Ubicación</label>
                    <p className="text-base text-gray-900">{formData.address_references || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Delegación</label>
                    <p className="text-base text-gray-900">{getDelegationLabel(formData.delegation)}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Latitud</label>
                      <p className="text-base text-gray-900">{formData.latitude || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Longitud</label>
                      <p className="text-base text-gray-900">{formData.longitude || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Detalles del Puesto */}
          <Card variant="default">
            <Card.Header>
              <Card.Title>Detalles del Puesto</Card.Title>
              <Card.Description>
                Información sobre el tipo y días de operación
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {isEditing ? (
                <>
                  <Select
                    id="stand_type"
                    name="stand_type"
                    label="Tipo de Puesto *"
                    options={standTypes}
                    value={formData.stand_type}
                    onChange={handleInputChange}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Operación
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {daysOfWeek.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleDayToggle(day.value)}
                          className={`
                            px-3 py-2 text-sm rounded-md border transition-colors
                            ${formData.operating_days.includes(day.value)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            }
                          `}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="schedule_start"
                      name="schedule_start"
                      type="time"
                      label="Hora de Inicio *"
                      value={formData.schedule_start}
                      onChange={handleInputChange}
                      required
                    />

                    <Input
                      id="schedule_end"
                      name="schedule_end"
                      type="time"
                      label="Hora de Cierre *"
                      value={formData.schedule_end}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Puesto</label>
                    <p className="text-base text-gray-900">{getStandTypeLabel(formData.stand_type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Días de Operación</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.operating_days.length > 0 ? (
                        formData.operating_days.map(day => {
                          const dayObj = daysOfWeek.find(d => d.value === day);
                          return (
                            <span key={day} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                              {dayObj?.label || day}
                            </span>
                          );
                        })
                      ) : (
                        <p className="text-base text-gray-900">N/A</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Hora de Inicio</label>
                      <p className="text-base text-gray-900">{formData.schedule_start || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Hora de Cierre</label>
                      <p className="text-base text-gray-900">{formData.schedule_end || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Evidencias */}
          <Card variant="default">
            <Card.Header>
              <Card.Title>Evidencias</Card.Title>
              <Card.Description>
                Fotografía del puesto y documentos adicionales
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto del Puesto
                    </label>

                    {/* Preview de la foto */}
                    {stallPhotoPreview && (
                      <div className="mb-4 relative">
                        <img
                          src={stallPhotoPreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setStallPhoto(null);
                            setStallPhotoPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}

                    {/* Input de foto */}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {stallPhotoPreview ? (
                            <>
                              <Camera className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">
                                Click para cambiar la imagen
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click para subir</span> o arrastra una imagen
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                            </>
                          )}
                        </div>
                        <input
                          id="stallPhoto"
                          type="file"
                          accept="image/*"
                          onChange={handleStallPhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documentos Adicionales
                    </label>

                    {/* Lista de documentos seleccionados */}
                    {documents.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-700">{doc.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input de documentos */}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-6 h-6 mb-1 text-gray-500" />
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">Click para subir documentos</span>
                          </p>
                          <p className="text-xs text-gray-400">PDF, Imágenes</p>
                        </div>
                        <input
                          id="documents"
                          type="file"
                          accept="image/*,application/pdf"
                          multiple
                          onChange={handleDocumentsChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Foto del Puesto</label>
                    {stallPhotoPreview ? (
                      <img
                        src={stallPhotoPreview}
                        alt="Foto del puesto"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                    ) : (
                      <p className="text-base text-gray-900">Sin foto</p>
                    )}
                  </div>

                  {/* Mostrar documentos existentes */}
                  {existingDocuments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Documentos Registrados ({existingDocuments.length})
                      </label>
                      <div className="space-y-2">
                        {existingDocuments.map((doc, index) => (
                          <div key={doc.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Documento {index + 1}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.document_type || 'General'} • {new Date(doc.uploaded_at).toLocaleDateString('es-MX')}
                                </p>
                              </div>
                            </div>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Ver
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Observaciones */}
          <Card variant="default">
            <Card.Header>
              <Card.Title>Observaciones</Card.Title>
              <Card.Description>
                Notas adicionales sobre el comerciante o el puesto
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {isEditing ? (
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Escribe cualquier observación relevante..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notas</label>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{formData.notes || 'Sin observaciones'}</p>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Botones de acción */}
          {isEditing && (
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1"
                disabled={loading}
              >
                <X size={20} />
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? 'Guardar Cambios' : 'Crear Comerciante'}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </SidebarLayout>
  );
};

export default MerchantDetail;
