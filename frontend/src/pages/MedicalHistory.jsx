import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, User, Clipboard, FileText, ChevronRight } from 'lucide-react';
import aiService from '../services/aiService';
import authService from '../services/authService';

const MedicalHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { patientId, patientName } = location.state || {}; // Si viene de la consola de doctor
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                let data;
                if (currentUser?.role === 'DOCTOR' && patientId) {
                    data = await aiService.getPatientHistory(patientId);
                } else {
                    data = await aiService.getHistory();
                }
                setHistory(data);
            } catch (err) {
                console.error('Error al cargar historial:', err);
                setError('No se pudo cargar el historial médico.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [patientId, currentUser?.role]);

    return (
        <div className="history-container">
            <div className="history-content animate-fade">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    <ArrowLeft size={20} />
                    <span>Volver al Panel</span>
                </button>

                <header className="history-header">
                    <h1>
                        {currentUser?.role === 'DOCTOR' && patientName 
                            ? `Historial Médico: ${patientName}` 
                            : 'Mi Historial Médico'}
                    </h1>
                    <p>Consulta el registro de tus atenciones pasadas y diagnósticos.</p>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <span>Cargando registros...</span>
                    </div>
                ) : error ? (
                    <div className="error-box">{error}</div>
                ) : history.length === 0 ? (
                    <div className="empty-history">
                        <Clipboard size={48} />
                        <h3>No hay registros aún</h3>
                        <p>Las atenciones completadas aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((record) => (
                            <div key={record.id} className="history-card">
                                <div className="card-header">
                                    <div className="date-badge">
                                        <Clock size={16} />
                                        <span>{new Date(record.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
                                    </div>
                                    {record.priority && (
                                        <span className={`priority-tag ${record.priority.toLowerCase()}`}>
                                            Triage: {record.priority}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="card-body">
                                    <div className="doc-info-row">
                                        <div className="doc-info">
                                            <User size={18} />
                                            <span>Atendido por: Dr. {record.doctor?.firstName} {record.doctor?.lastName}</span>
                                        </div>
                                        
                                        {currentUser?.role === 'DOCTOR' && record.patient && (
                                            <div className="patient-extra-info">
                                                <span className="info-badge">Edad: {record.patient.age || 'N/A'} años</span>
                                                <span className="info-badge warning">Alergias: {record.patient.allergies || 'Ninguna'}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {record.symptoms && (
                                        <div className="record-section">
                                            <h4><Clipboard size={16} /> Síntomas reportados (Triage)</h4>
                                            <p>{record.symptoms}</p>
                                        </div>
                                    )}
                                    
                                    <div className="record-section">
                                        <h4><FileText size={16} /> Notas del Profesional</h4>
                                        <p>{record.notes || 'Sin observaciones registradas.'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .history-container {
                    min-height: 100vh;
                    background: #F1F5F9;
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                }

                .history-content {
                    width: 100%;
                    max-width: 800px;
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
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .back-btn:hover { color: var(--primary); }

                .history-header { margin-bottom: 40px; }
                .history-header h1 { font-size: 32px; color: var(--secondary); margin-bottom: 8px; }
                .history-header p { color: var(--text-light); font-size: 16px; }

                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    padding-bottom: 40px;
                }

                .history-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                }

                .history-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-premium); }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #F1F5F9;
                }

                .date-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #F1F5F9;
                    padding: 6px 12px;
                    border-radius: 8px;
                    color: var(--secondary);
                    font-size: 14px;
                    font-weight: 600;
                }

                .priority-tag {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .priority-tag.high { background: #FEE2E2; color: #B91C1C; }
                .priority-tag.medium { background: #FEF3C7; color: #B45309; }
                .priority-tag.low { background: #D1FAE5; color: #047857; }

                .doc-info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .doc-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--primary-dark);
                    font-weight: 600;
                    font-size: 15px;
                }

                .patient-extra-info {
                    display: flex;
                    gap: 8px;
                }

                .info-badge {
                    background: #E0F2FE;
                    color: #0369A1;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .info-badge.warning {
                    background: #FFF7ED;
                    color: #9A3412;
                    border: 1px solid #FFEDD5;
                }

                .record-section {
                    margin-bottom: 20px;
                }

                .record-section:last-child { margin-bottom: 0; }

                .record-section h4 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    text-transform: uppercase;
                    color: var(--text-light);
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                .record-section p {
                    color: var(--secondary);
                    line-height: 1.6;
                    background: #F8FAFC;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 15px;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    padding: 60px;
                    color: var(--text-light);
                }

                .empty-history {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 24px;
                    color: var(--text-light);
                }

                .empty-history h3 { color: var(--secondary); margin-top: 16px; margin-bottom: 8px; }

                .spinner-large {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(38, 198, 218, 0.1);
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            ` }} />
        </div>
    );
};

export default MedicalHistory;
