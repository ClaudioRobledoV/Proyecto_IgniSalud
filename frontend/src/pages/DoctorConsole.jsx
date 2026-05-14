import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Square, Save, FileText, Loader2, ArrowLeft, Upload } from 'lucide-react';
import aiService from '../services/aiService';
import authService from '../services/authService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './DoctorConsole.css';

const DoctorConsole = () => {
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');
  const [triageData, setTriageData] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, appointmentId, reason } = location.state || {};

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return navigate('/login');
    setUser(currentUser);

    const fetchTriage = async () => {
      if (!appointmentId) return;
      try {
        const data = await aiService.getMedicalRecord(appointmentId);
        setTriageData(data);
      } catch (err) {
        console.log('No se encontró triage previo:', err);
      }
    };
    fetchTriage();
  }, [appointmentId, navigate]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => handleTranscription(new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType }));
      mediaRecorderRef.current.start();
      setRecording(true);
      setError('');
    } catch (err) {
      setError('No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTranscription = async (audioBlob) => {
    if (audioBlob.size < 100) return setError('Audio demasiado corto.');
    setLoading(true);
    try {
      const data = await aiService.transcribeVoice(audioBlob);
      setNoteText(prev => prev ? `${prev}\n${data.text}` : data.text);
    } catch (err) {
      setError('Error en la transcripción.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!appointmentId) {
        setError('Error crítico: ID de cita no encontrado.');
        return;
    }
    if (!noteText.trim()) {
        setError('Por favor, escribe o dicta una nota médica antes de guardar.');
        return;
    }

    setLoading(true);
    try {
      await aiService.saveMedicalNote(appointmentId, noteText);
      alert('Atención guardada exitosamente.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al guardar nota médica:', err);
      const msg = err.response?.data?.message || err.message || 'Error desconocido';
      setError(`Error al guardar la nota médica: ${msg}`);
      alert(`No se pudo guardar: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="console-container">
      <Sidebar user={user} activePath="/doctor-console" />
      
      <main className="console-content">
        <Header user={user} />
        
        <section className="console-area">
          <div className="console-card animate-fade">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              <ArrowLeft size={20} /> <span>Volver al Panel</span>
            </button>

            <header className="console-header">
              <h1>Atención: {patient ? `${patient.firstName} ${patient.lastName}` : 'Nota Médica'}</h1>
              <p>Graba o dicta la consulta para generar el registro médico automático.</p>
            </header>

            {reason && (
              <div className="reason-info-box animate-fade">
                <span className="reason-title">Motivo de Consulta:</span>
                <p>{reason}</p>
              </div>
            )}

            {triageData && (
              <div className="triage-info-box animate-fade">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <strong>Resumen de Triage:</strong>
                  <span className={`priority-pill ${triageData.priority?.toLowerCase()}`}>
                    {triageData.priority === 'LOW' ? 'Baja' : 
                     triageData.priority === 'MEDIUM' ? 'Media' : 'Alta'}
                  </span>
                </div>
                <p>{triageData.symptoms}</p>
              </div>
            )}

            <div className="note-section animate-fade">
              <div className="section-header">
                <div className="title-with-icon"><FileText size={20} /> <h3>Nota Médica</h3></div>
                {loading && <div className="loading-mini"><Loader2 className="spinner" size={16} /> <span>Procesando...</span></div>}
              </div>

              <textarea 
                className="medical-note-area"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Diagnóstico, indicaciones..."
              />

              <div className="dual-controls">
                <div className="recorder-controls">
                  {!recording ? (
                    <button onClick={startRecording} className="record-mini-btn start" disabled={loading}><Mic size={18} /> Dictar</button>
                  ) : (
                    <button onClick={stopRecording} className="record-mini-btn stop"><Square size={18} /> Detener</button>
                  )}
                  <label className="upload-mini-btn"><Upload size={18} /><input type="file" accept="audio/*" onChange={(e) => handleTranscription(e.target.files[0])} hidden disabled={loading} /></label>
                </div>
                <button className="btn-primary" disabled={!noteText.trim() || loading} onClick={handleSave}><Save size={18} /> Guardar Atención</button>
              </div>
            </div>
            {error && <p className="error-text" style={{color: '#E53E3E', fontWeight: 'bold'}}>{error}</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorConsole;
