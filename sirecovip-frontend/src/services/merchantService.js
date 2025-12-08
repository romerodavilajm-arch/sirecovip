import axiosInstance from '../api/axios';

/**
 * Servicio para operaciones relacionadas con comerciantes
 */
const merchantService = {
  /**
   * Obtiene todas las organizaciones para el catálogo
   * @returns {Promise} Lista de organizaciones
   */
  getOrganizations: async () => {
    try {
      const response = await axiosInstance.get('/organizations');
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los comerciantes
   * @returns {Promise} Lista de comerciantes
   */
  getMerchants: async () => {
    try {
      const response = await axiosInstance.get('/merchants');
      return response.data;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  },

  /**
   * Obtiene un comerciante por ID con transformación de documentos
   * @param {string} id - ID del comerciante
   * @returns {Promise} Datos del comerciante con documentos transformados
   */
  getMerchantById: async (id) => {
    try {
      const response = await axiosInstance.get(`/merchants/${id}`);
      const data = response.data;

      // Transformar documentos si existen para que coincidan con la estructura esperada
      if (data.documents && Array.isArray(data.documents)) {
        data.documents = data.documents.map(doc => ({
          id: doc.id,
          name: doc.name || `Documento ${doc.id}`,
          file_url: doc.file_url,
          document_type: doc.document_type || 'general',
          uploaded_at: doc.uploaded_at || doc.created_at,
          // Mapeo crítico de propiedades
          size: doc.file_size || null,
          uploadDate: doc.upload_date || doc.uploaded_at || doc.created_at,
          url: doc.file_url
        }));
      }

      return data;
    } catch (error) {
      console.error(`Error fetching merchant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo comerciante con soporte para FormData (archivos)
   * @param {FormData|Object} merchantData - Datos del comerciante o FormData con archivos
   * @returns {Promise} Comerciante creado
   */
  createMerchant: async (merchantData) => {
    try {
      // Si es FormData, axios automáticamente establece el Content-Type correcto
      const config = merchantData instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

      const response = await axiosInstance.post('/merchants', merchantData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  },

  /**
   * Actualiza un comerciante existente con soporte para FormData (archivos)
   * @param {string} id - ID del comerciante
   * @param {FormData|Object} merchantData - Datos actualizados o FormData con archivos
   * @returns {Promise} Comerciante actualizado
   */
  updateMerchant: async (id, merchantData) => {
    try {
      console.log('🔧 merchantService.updateMerchant called:', {
        id,
        isFormData: merchantData instanceof FormData,
        url: `/merchants/${id}`
      });

      // Si es FormData, axios automáticamente establece el Content-Type correcto
      const config = merchantData instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

      const response = await axiosInstance.put(`/merchants/${id}`, merchantData, config);
      console.log('✅ Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating merchant ${id}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  },

  /**
   * Elimina un comerciante
   * @param {string} id - ID del comerciante
   * @returns {Promise} Confirmación de eliminación
   */
  deleteMerchant: async (id) => {
    try {
      const response = await axiosInstance.delete(`/merchants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting merchant ${id}:`, error);
      throw error;
    }
  },
};

export default merchantService;
