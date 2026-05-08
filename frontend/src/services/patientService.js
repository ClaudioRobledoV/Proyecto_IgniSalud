import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:4001/api/patients';

const patientService = {
  getProfile: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el perfil' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el perfil' };
    }
  }
};

export default patientService;
