import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Square, Save, FileText, Loader2, ArrowLeft, Upload } from 'lucide-react';
import aiService from '../services/aiService';

const DoctorConsole = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, appointmentId } = location.state || {};

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        handleTranscription(audioBlob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setError('');
    } catch (err) {
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
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
    setLoading(true);
    setError('');
    
    try {
      // Validar tamaño mínimo de audio (evitar envíos vacíos)
      if (audioBlob.size < 100) {
        throw new Error('El audio es muy corto o no se detectó sonido.');
      }

      console.log('Enviando audio para transcripción...', audioBlob);
      const data = await aiService.transcribeVoice(audioBlob);
      setNoteText(prev => prev ? `${prev}\n${data.text}` : data.text);
    } catch (err) {
      console.error('Error en transcripción:', err);
      setError(err.message || 'Error en la transcripción. Asegúrate de que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!appointmentId || !noteText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await aiService.saveMedicalNote(appointmentId, noteText);
      alert('Atención guardada exitosamente. La cita ha sido marcada como completada.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al guardar la nota médica.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleTranscription(file);
  };

  return (
    <div className="doctor-console">
      <div className="console-card animate-fade">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>

        <header className="console-header">
          <h1>Atención: {patient ? `${patient.firstName} ${patient.lastName}` : 'Nota Médica Libre'}</h1>
          {patient && <p style={{ color: 'var(--primary-dark)', fontWeight: '600' }}>Paciente RUT: {patient.user?.rut}</p>}
          <p>Graba o sube un audio de la consulta para generar una transcripción automática.</p>
        </header>

        <div className="note-section animate-fade">
          <div className="section-header">
            <div className="title-with-icon">
              <FileText size={20} />
              <h3>Nota Médica del Paciente</h3>
            </div>
            {loading && (
              <div className="loading-mini">
                <Loader2 className="spinner" size={16} />
                <span>Transcribiendo...</span>
              </div>
            )}
          </div>

          <textarea 
            className="medical-note-area"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribe aquí los detalles del diagnóstico o usa el botón de voz para dictar..."
          />

          <div className="dual-controls">
            <div className="recorder-controls">
              {!recording ? (
                <button onClick={startRecording} className="record-mini-btn start" disabled={loading}>
                  <Mic size={18} />
                  <span>Dictar Nota</span>
                </button>
              ) : (
                <button onClick={stopRecording} className="record-mini-btn stop">
                  <Square size={18} />
                  <span>Detener</span>
                </button>
              )}
              
              <label className="upload-mini-btn" title="Subir archivo de audio">
                <Upload size={18} />
                <input type="file" accept="audio/*" onChange={handleFileUpload} hidden disabled={loading} />
              </label>
            </div>

            <button 
              className="btn-primary save-btn" 
              disabled={!noteText.trim() || loading}
              onClick={handleSave}
            >
              <Save size={18} />
              Finalizar Atención y Guardar
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .doctor-console {
          min-height: 100vh;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .console-card {
          background: white;
          width: 100%;
          max-width: 700px;
          padding: 40px;
          border-radius: 24px;
          box-shadow: var(--shadow-premium);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          color: var(--text-light);
          padding: 0;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .back-btn:hover { color: var(--primary); }

        .console-header h1 { font-size: 28px; margin-bottom: 8px; }
        .console-header p { color: var(--text-light); margin-bottom: 32px; }

        .note-section {
          background: #F8FAFC;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #E2E8F0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--secondary);
        }

        .loading-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
        }

        .medical-note-area {
          width: 100%;
          height: 300px;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #CBD5E1;
          background: white;
          font-family: inherit;
          line-height: 1.6;
          resize: none;
          font-size: 16px;
          margin-bottom: 20px;
          transition: var(--transition);
        }

        .medical-note-area:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(38, 198, 218, 0.1);
        }

        .dual-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .recorder-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .record-mini-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition);
        }

        .record-mini-btn.start {
          background: white;
          border: 1px solid var(--primary);
          color: var(--primary);
        }

        .record-mini-btn.start:hover {
          background: rgba(38, 198, 218, 0.05);
        }

        .record-mini-btn.stop {
          background: #FFF5F5;
          border: 1px solid #FC8181;
          color: #E53E3E;
          animation: pulse-mini 1.5s infinite;
        }

        @keyframes pulse-mini {
          0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
          100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }

        .upload-mini-btn {
          background: white;
          border: 1px solid #CBD5E1;
          color: var(--text-light);
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: var(--transition);
        }

        .upload-mini-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .save-btn {
          height: 44px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .error-text { color: #E53E3E; text-align: center; margin-top: 16px; font-size: 14px; }
      ` }} />
    </div>
  );
};

export default DoctorConsole;
