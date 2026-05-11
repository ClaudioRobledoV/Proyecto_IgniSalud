import api from './api';

const patientService = {
  getProfile: async () => {
    try {
      const response = await api.get(`/patients/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put(`/patients/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default patientService;
