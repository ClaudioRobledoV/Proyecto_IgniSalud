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
      formData.append('audio', audioBlob, 'audio_record');

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
  },

  getMedicalRecord: async (appointmentId) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/ai/record/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el registro médico' };
    }
  },

  getHistory: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/medical-records/my-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el historial clínico' };
    }
  },

  getPatientHistory: async (patientId) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/medical-records/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el historial del paciente' };
    }
  }
};

export default aiService;
