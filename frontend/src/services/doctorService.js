import api from './api';

const doctorService = {
  getProfile: async () => {
    try {
      const response = await api.get(`/doctors/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put(`/doctors/me`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default doctorService;
