import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:4001/api';

const appointmentService = {
  createAppointment: async (doctorId, date, reason) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/appointments`,
        { doctorId, date, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al agendar la cita' };
    }
  },

  getMyAppointments: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/appointments/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener tus citas' };
    }
  },

  updateStatus: async (appointmentId, status) => {
    try {
      const token = authService.getToken();
      const response = await axios.patch(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el estado de la cita' };
    }
  },

  getAvailableSlots: async (doctorId, date) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/doctors/${doctorId}/slots`,
        { 
          params: { date },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener horarios disponibles' };
    }
  },

  // Obtener lista de doctores (para que el paciente elija)
  getDoctors: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/doctors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener la lista de médicos' };
    }
  }
};

export default appointmentService;
