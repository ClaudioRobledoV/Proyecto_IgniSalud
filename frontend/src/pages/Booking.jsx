import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, CheckCircle, ArrowLeft, Loader2, CalendarDays } from 'lucide-react';
import appointmentService from '../services/appointmentService';

const Booking = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // 1. Cargar Médicos
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await appointmentService.getDoctors();
        setDoctors(data);
      } catch (err) {
        setError('No se pudo cargar la lista de médicos.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Cargar Slots cuando cambie Doctor o Fecha
  useEffect(() => {
    if (selectedDoctor && date) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        setSelectedSlot('');
        try {
          const slots = await appointmentService.getAvailableSlots(selectedDoctor, date);
          setAvailableSlots(slots);
        } catch (err) {
          setError('Error al consultar horarios.');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, date]);

  const handleBooking = async () => {
    if (!selectedDoctor || !date || !selectedSlot) return;
    
    setError('');
    try {
      const appointmentDate = `${date}T${selectedSlot}:00Z`;
      await appointmentService.createAppointment(selectedDoctor, appointmentDate, reason);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Error al agendar la cita.');
    }
  };

  if (success) {
    return (
      <div className="booking-container">
        <div className="booking-card animate-fade success-view">
          <div className="success-icon">
            <CheckCircle size={60} color="white" />
          </div>
          <h2>¡Cita Confirmada!</h2>
          <p>Tu atención ha sido reservada con éxito. Revisa tu dashboard para ver los detalles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-card animate-fade">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={18} />
          <span>Volver al Inicio</span>
        </button>

        <header className="booking-header">
          <h1>Reserva de Atención</h1>
          <p>Agenda tu hora con nuestros especialistas disponibles.</p>
        </header>

        <div className="booking-steps">
          
          {/* Paso 1: Médico */}
          <div className="step-field">
            <label><User size={16} /> 1. Selecciona un Especialista</label>
            {loading ? <div className="loading-small"><Loader2 className="spinner" /> Cargando...</div> : (
              <select 
                value={selectedDoctor} 
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="booking-select"
              >
                <option value="">-- Elige un doctor --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.firstName} {doc.lastName} {doc.specialty ? `(${doc.specialty})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Paso 2: Fecha */}
          <div className={`step-field ${!selectedDoctor ? 'disabled' : ''}`}>
            <label><CalendarDays size={16} /> 2. Elige el Día</label>
            <input 
              type="date" 
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              disabled={!selectedDoctor}
              className="booking-date"
            />
          </div>

          {/* Paso 3: Horarios */}
          <div className={`step-field ${!date ? 'disabled' : ''}`}>
            <label><Clock size={16} /> 3. Selecciona el Horario</label>
            {loadingSlots ? (
              <div className="slots-loading"><Loader2 className="spinner" /> Buscando horas...</div>
            ) : date ? (
              <div className="slots-grid">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <button 
                      key={slot}
                      className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p className="no-slots">No hay horas disponibles para este día.</p>
                )}
              </div>
            ) : (
              <p className="hint">Selecciona una fecha primero.</p>
            )}
          </div>

          {/* Paso 4: Motivo */}
          <div className={`step-field ${!selectedSlot ? 'disabled' : ''}`}>
            <label>4. Motivo de la Consulta (Opcional)</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe brevemente el motivo de tu visita..."
              className="booking-reason"
              rows="3"
            />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button 
          className="btn-primary booking-submit" 
          disabled={!selectedSlot || !selectedDoctor || !date}
          onClick={handleBooking}
        >
          {loadingSlots ? 'Cargando horas...' : 'Confirmar Reserva'}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .booking-container { min-height: 100vh; background: #F8FAFC; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .booking-card { background: white; width: 100%; max-width: 540px; padding: 48px; border-radius: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; color: #94A3B8; margin-bottom: 32px; font-weight: 500; font-size: 14px; border: none; cursor: pointer; }
        .booking-header h1 { font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 8px; }
        .booking-header p { color: #64748B; margin-bottom: 40px; }
        .booking-steps { display: flex; flex-direction: column; gap: 32px; margin-bottom: 40px; }
        .step-field label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .booking-select, .booking-date { width: 100%; padding: 14px 18px; border-radius: 12px; border: 2px solid #F1F5F9; background: #F8FAFC; font-size: 16px; color: #1E293B; outline: none; transition: 0.2s; }
        .booking-select:focus, .booking-date:focus { border-color: var(--primary); }
        .disabled { opacity: 0.4; pointer-events: none; }
        .slots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .slot-btn { padding: 12px; border: 2px solid #F1F5F9; border-radius: 10px; background: white; color: #475569; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .slot-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
        .booking-reason { width: 100%; padding: 14px 18px; border-radius: 12px; border: 2px solid #F1F5F9; background: #F8FAFC; resize: none; outline: none; }
        .booking-submit { width: 100%; height: 60px; font-size: 16px; }
        .error-msg { color: #EF4444; font-size: 14px; text-align: center; margin-bottom: 16px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
};

export default Booking;
