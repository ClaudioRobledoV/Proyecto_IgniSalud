import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertTriangle, CheckCircle2, Loader2, ArrowLeft, Mic, Square } from 'lucide-react';
import aiService from '../services/aiService';

const Triage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current.mimeType;
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
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
      if (audioBlob.size < 100) throw new Error('El audio es muy corto.');
      console.log('Enviando audio de síntomas para transcripción...', audioBlob);
      const data = await aiService.transcribeVoice(audioBlob);
      console.log('Transcripción recibida:', data);
      setSymptoms(prev => prev ? `${prev} ${data.text}`.trim() : data.text);
    } catch (err) {
      console.error('Error en transcripción:', err);
      setError(err.message || 'Error en la transcripción por voz.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await aiService.analyzeSymptoms(symptoms);
      setResult(data.analysis);
    } catch (err) {
      setError(err.message || 'Error al procesar el análisis.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    LOW: '#48BB78',
    MEDIUM: '#ECC94B',
    HIGH: '#F56565'
  };

  return (
    <div className="triage-container">
      <div className="triage-card animate-fade">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>

        <header className="triage-header">
          <h1>Evaluación de Síntomas con IA</h1>
          <p>Describe cómo te sientes y nuestra IA te ayudará a determinar la prioridad de tu atención.</p>
        </header>

        {!result ? (
          <form onSubmit={handleAnalyze} className="triage-form">
            <textarea
              placeholder="Ej: Siento un dolor fuerte en el pecho y me falta el aire..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={loading}
              required
            />
            <div className="triage-controls">
              <button 
                type="button" 
                onClick={recording ? stopRecording : startRecording} 
                className={`dictate-btn ${recording ? 'recording' : ''}`}
                disabled={loading}
              >
                {recording ? (
                  <>
                    <Square size={20} /> Detener Grabación
                  </>
                ) : (
                  <>
                    <Mic size={20} /> Dictar Síntomas
                  </>
                )}
              </button>
              
              <button type="submit" className="btn-primary triage-btn" disabled={loading || !symptoms.trim()}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Análisis
                </>
              )}
            </button>
          </div>
        </form>
        ) : (
          <div className="triage-result animate-fade">
            <div className="priority-badge" style={{ backgroundColor: priorityColors[result.priority] }}>
              Prioridad: {result.priority}
            </div>
            
            <div className="result-section">
              <h3>Resumen Médico:</h3>
              <p>{result.symptomsSummary}</p>
            </div>

            <div className="result-section">
              <h3>Razonamiento:</h3>
              <p>{result.reasoning}</p>
            </div>

            <div className="result-actions">
              <button onClick={() => setResult(null)} className="btn-secondary">
                Nuevo Análisis
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Finalizar
              </button>
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .triage-container {
          min-height: 100vh;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .triage-card {
          background: white;
          width: 100%;
          max-width: 600px;
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

        .triage-header h1 { font-size: 28px; margin-bottom: 12px; }
        .triage-header p { color: var(--text-light); line-height: 1.6; margin-bottom: 32px; }

        .triage-form textarea {
          width: 100%;
          height: 160px;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          font-family: inherit;
          font-size: 16px;
          resize: none;
          margin-bottom: 20px;
          transition: var(--transition);
        }

        .triage-form textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(38, 198, 218, 0.1);
        }

        .triage-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .dictate-btn {
          flex: 1;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          background: white;
          border: 1px solid var(--primary);
          color: var(--primary);
          transition: var(--transition);
        }

        .dictate-btn:hover {
          background: rgba(38, 198, 218, 0.05);
        }

        .dictate-btn.recording {
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

        .triage-btn { flex: 1; height: 56px; display: flex; align-items: center; justify-content: center; gap: 12px; }

        .triage-result { display: flex; flex-direction: column; gap: 24px; }

        .priority-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 700;
          font-size: 14px;
          align-self: flex-start;
        }

        .result-section h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); margin-bottom: 8px; }
        .result-section p { font-size: 16px; line-height: 1.6; color: var(--secondary); background: #F8FAFC; padding: 16px; border-radius: 12px; }

        .result-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }

        .error-text { color: #E53E3E; font-size: 14px; margin-top: 16px; text-align: center; }

        .spinner { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
};

export default Triage;
