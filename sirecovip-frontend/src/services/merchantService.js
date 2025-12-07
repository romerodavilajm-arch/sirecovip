import axiosInstance from '../api/axios';

/**
 * Servicio para operaciones relacionadas con comerciantes
 */
const merchantService = {
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
   * Obtiene un comerciante por ID
   * @param {string} id - ID del comerciante
   * @returns {Promise} Datos del comerciante
   */
  getMerchantById: async (id) => {
    try {
      const response = await axiosInstance.get(`/merchants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching merchant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo comerciante
   * @param {Object} merchantData - Datos del comerciante
   * @returns {Promise} Comerciante creado
   */
  createMerchant: async (merchantData) => {
    try {
      const response = await axiosInstance.post('/merchants', merchantData);
      return response.data;
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  },

  /**
   * Actualiza un comerciante existente
   * @param {string} id - ID del comerciante
   * @param {Object} merchantData - Datos actualizados
   * @returns {Promise} Comerciante actualizado
   */
  updateMerchant: async (id, merchantData) => {
    try {
      const response = await axiosInstance.put(`/merchants/${id}`, merchantData);
      return response.data;
    } catch (error) {
      console.error(`Error updating merchant ${id}:`, error);
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
