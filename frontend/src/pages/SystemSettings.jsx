import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Clock, Shield, Mic, LayoutGrid, CheckCircle, AlertCircle } from 'lucide-react';
import adminService from '../services/adminService';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    appointmentDuration: 20,
    clinicOpenTime: '08:00',
    clinicCloseTime: '20:00',
    aiTranscriptionEnabled: true,
    sessionTimeout: 30
  });
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Usamos el adminService para estas llamadas (asumiendo que las rutas están en /admin)
      // Nota: Necesitamos actualizar adminService.js con estos métodos más adelante
      const [settingsData, specialtiesData] = await Promise.all([
        adminService.getSystemSettings(),
        adminService.getSpecialties()
      ]);
      
      if (settingsData) setSettings(settingsData);
      setSpecialties(specialtiesData);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al cargar los ajustes del sistema.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await adminService.updateSystemSettings(settings);
      setMessage({ type: 'success', text: '¡Ajustes actualizados correctamente!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSpecialty = async (e) => {
    e.preventDefault();
    if (!newSpecialty.trim()) return;
    try {
      const data = await adminService.createSpecialty(newSpecialty);
      setSpecialties([...specialties, data]);
      setNewSpecialty('');
    } catch (err) {
      alert('Error al añadir especialidad');
    }
  };

  const handleDeleteSpecialty = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta especialidad?')) return;
    try {
      await adminService.deleteSpecialty(id);
      setSpecialties(specialties.filter(s => s.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="loading-screen">Cargando ajustes...</div>;

  return (
    <div className="settings-page-container">
      <div className="settings-content animate-fade">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={18} />
          <span>Volver al Panel Control</span>
        </button>

        <header className="settings-header">
          <h1>Ajustes del Sistema</h1>
          <p>Configura las reglas globales, especialidades y políticas de seguridad.</p>
        </header>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-grid">
          {/* Columna Izquierda: Reglas y Seguridad */}
          <div className="settings-column">
            <form onSubmit={handleSaveSettings} className="settings-card">
              <div className="card-header">
                <Clock size={20} />
                <h2>Reglas de Agenda Global</h2>
              </div>
              
              <div className="form-group">
                <label>Duración por defecto de Cita (minutos)</label>
                <input 
                  type="number" 
                  value={settings.appointmentDuration}
                  onChange={(e) => setSettings({...settings, appointmentDuration: e.target.value})}
                  min="5" max="120"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora Apertura Clínica</label>
                  <input 
                    type="time" 
                    value={settings.clinicOpenTime}
                    onChange={(e) => setSettings({...settings, clinicOpenTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Cierre Clínica</label>
                  <input 
                    type="time" 
                    value={settings.clinicCloseTime}
                    onChange={(e) => setSettings({...settings, clinicCloseTime: e.target.value})}
                  />
                </div>
              </div>

              <hr />

              <div className="card-header" style={{marginTop: '20px'}}>
                <Shield size={20} />
                <h2>Políticas de Seguridad</h2>
              </div>
              <div className="form-group">
                <label>Cierre de sesión por inactividad (minutos)</label>
                <input 
                  type="number" 
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                />
              </div>

              <hr />

              <div className="card-header" style={{marginTop: '20px'}}>
                <Mic size={20} />
                <h2>Inteligencia Artificial</h2>
              </div>
              <div className="toggle-group">
                <div className="toggle-info">
                  <label>Modo de Transcripción (Gemini)</label>
                  <p>Si se apaga, los doctores no podrán procesar audio.</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.aiTranscriptionEnabled}
                    onChange={(e) => setSettings({...settings, aiTranscriptionEnabled: e.target.checked})}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <button type="submit" className="btn-save" disabled={submitting}>
                <Save size={18} /> {submitting ? 'Guardando...' : 'Guardar Ajustes'}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Especialidades */}
          <div className="settings-column">
            <div className="settings-card">
              <div className="card-header">
                <LayoutGrid size={20} />
                <h2>Gestión de Especialidades</h2>
              </div>
              
              <form onSubmit={handleAddSpecialty} className="add-specialty-form">
                <input 
                  type="text" 
                  placeholder="Nueva especialidad (ej: Nutrición)"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                />
                <button type="submit" className="btn-add">
                  <Plus size={20} />
                </button>
              </form>

              <div className="specialties-list">
                {specialties.map(s => (
                  <div key={s.id} className="specialty-item">
                    <span>{s.name}</span>
                    <button onClick={() => handleDeleteSpecialty(s.id)} className="btn-delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {specialties.length === 0 && <p className="empty-text">No hay especialidades registradas.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .settings-page-container { min-height: 100vh; background: #F1F5F9; padding: 40px 20px; display: flex; justify-content: center; }
        .settings-content { width: 100%; max-width: 1100px; }
        
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; color: #64748B; border: none; margin-bottom: 24px; cursor: pointer; transition: 0.3s; }
        .back-btn:hover { color: var(--primary); }

        .settings-header { margin-bottom: 32px; }
        .settings-header h1 { font-size: 32px; color: var(--secondary); margin-bottom: 8px; }
        .settings-header p { color: #64748B; }

        .settings-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; }
        .settings-card { background: white; padding: 32px; border-radius: 24px; box-shadow: var(--shadow-premium); }
        
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: var(--secondary); }
        .card-header h2 { font-size: 18px; margin: 0; }

        .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .form-group label { font-size: 14px; font-weight: 700; color: #475569; }
        .form-group input { padding: 12px; border: 2px solid #F1F5F9; border-radius: 12px; font-size: 16px; outline: none; }
        .form-group input:focus { border-color: var(--primary); }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        hr { border: none; border-top: 1px solid #F1F5F9; margin: 24px 0; }

        .btn-save { width: 100%; background: var(--secondary); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; margin-top: 12px; }
        .btn-save:hover { background: var(--primary); }

        .add-specialty-form { display: flex; gap: 10px; margin-bottom: 24px; }
        .add-specialty-form input { flex: 1; padding: 12px; border: 2px solid #F1F5F9; border-radius: 12px; outline: none; }
        .btn-add { background: var(--primary); color: white; border: none; padding: 10px; border-radius: 12px; cursor: pointer; }

        .specialties-list { display: flex; flex-direction: column; gap: 10px; }
        .specialty-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; }
        .specialty-item span { font-weight: 600; color: var(--secondary); }
        .btn-delete { color: #EF4444; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; transition: 0.3s; }
        .btn-delete:hover { background: #FEE2E2; }

        /* Switch Toggle */
        .toggle-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .toggle-info p { font-size: 13px; color: #64748B; margin: 4px 0 0 0; }
        .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(24px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .message-banner { padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-weight: 600; }
        .message-banner.success { background: #DCFCE7; color: #166534; }
        .message-banner.error { background: #FEE2E2; color: #991B1B; }
      `}} />
    </div>
  );
};

export default SystemSettings;
