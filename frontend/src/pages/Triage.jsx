import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertTriangle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import aiService from '../services/aiService';

const Triage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          <h1>Análisis de Síntomas con IA</h1>
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

        .triage-btn { width: 100%; height: 56px; display: flex; align-items: center; justify-content: center; gap: 12px; }

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
