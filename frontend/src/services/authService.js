import axios from 'axios';

const API_URL = 'http://localhost:4001/api';

const authService = {
  login: async (rut, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { rut, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión con el servidor' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el registro del usuario' };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  changePassword: async (passwords) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/auth/change-password`, passwords, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar la contraseña' };
    }
  }
};

export default authService;
