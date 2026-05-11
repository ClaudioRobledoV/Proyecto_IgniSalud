import api from './api';

const adminService = {
  getStats: async () => {
    try {
      const response = await api.get(`/admin/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get(`/admin/users`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserRole: async (userId, newRole) => {
    try {
      const response = await api.post(`/admin/update-role`, { userId, newRole });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (userId, newPassword) => {
    try {
      const response = await api.post(`/admin/reset-password`, { userId, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllAppointments: async () => {
    try {
      const response = await api.get(`/admin/appointments`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminService;
