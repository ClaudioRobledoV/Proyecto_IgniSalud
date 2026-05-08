import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:4001/api/doctors';

const doctorService = {
  getProfile: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el perfil del médico' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/me`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el perfil del médico' };
    }
  }
};

export default doctorService;
