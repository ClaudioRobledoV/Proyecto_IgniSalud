import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:4001/api';

const adminService = {
  getStats: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/admin/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener estadísticas del sistema' };
    }
  },

  getAllUsers: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener lista de usuarios' };
    }
  },

  updateUserRole: async (userId, newRole) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/admin/update-role`,
        { userId, newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el rol del usuario' };
    }
  },

  resetPassword: async (userId, newPassword) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/admin/reset-password`,
        { userId, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al restablecer la contraseña' };
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = authService.getToken();
      const response = await axios.delete(
        `${API_URL}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el usuario' };
    }
  }
};

export default adminService;
