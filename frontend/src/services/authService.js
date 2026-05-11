import api from './api';

const authService = {
  login: async (rut, password) => {
    try {
      const response = await api.post(`/auth/login`, { rut, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post(`/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error;
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
      const response = await api.post(`/auth/change-password`, passwords);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
