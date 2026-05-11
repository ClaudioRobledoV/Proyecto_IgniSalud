import api from './api';

const appointmentService = {
  createAppointment: async (doctorId, date, reason) => {
    try {
      const response = await api.post(`/appointments`, { doctorId, date, reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyAppointments: async () => {
    try {
      const response = await api.get(`/appointments/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (appointmentId, status) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/slots`, { 
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDoctors: async () => {
    try {
      const response = await api.get(`/doctors`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSpecialties: async () => {
    try {
      const response = await api.get(`/admin/specialties`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default appointmentService;
