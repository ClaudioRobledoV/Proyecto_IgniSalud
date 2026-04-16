import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:4001/api';

const aiService = {
  analyzeSymptoms: async (symptomsInput) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/ai/analyze`, 
        { symptomsInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al analizar síntomas con la IA' };
    }
  },

  linkTriageToAppointment: async (appointmentId, symptomsSummary, priority) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/ai/link`,
        { appointmentId, symptomsSummary, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al vincular el triage' };
    }
  },

  transcribeVoice: async (audioBlob) => {
    try {
      const token = authService.getToken();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'note.wav');

      const response = await axios.post(
        `${API_URL}/ai/transcribe`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          } 
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en la transcripción de voz' };
    }
  },

  saveMedicalNote: async (appointmentId, notes) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/ai/save-note`,
        { appointmentId, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al guardar la nota médica' };
    }
  }
};

export default aiService;
