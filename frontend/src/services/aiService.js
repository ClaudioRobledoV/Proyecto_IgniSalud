import api from './api';

const aiService = {
  analyzeSymptoms: async (symptomsInput) => {
    try {
      const response = await api.post(`/ai/analyze`, { symptomsInput });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  linkTriageToAppointment: async (appointmentId, symptomsSummary, priority) => {
    try {
      const response = await api.post(`/ai/link`, { appointmentId, symptomsSummary, priority });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  transcribeVoice: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio_record');

      const response = await api.post(`/ai/transcribe`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  saveMedicalNote: async (appointmentId, notes) => {
    try {
      const response = await api.post(`/ai/save-note`, { appointmentId, notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMedicalRecord: async (appointmentId) => {
    try {
      const response = await api.get(`/ai/record/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get(`/medical-records/my-history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPatientHistory: async (patientId) => {
    try {
      const response = await api.get(`/medical-records/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default aiService;
