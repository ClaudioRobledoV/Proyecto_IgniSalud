import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, XCircle } from 'lucide-react';
import authService from '../services/authService';
import appointmentService from '../services/appointmentService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const MyAppointments = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'PATIENT') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error al cargar las citas:', err);
      setError('Error al cargar el historial de citas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta cita?')) return;
    
    try {
      await appointmentService.updateStatus(id, 'CANCELLED');
      fetchAppointments();
    } catch (err) {
      console.error('Error al cancelar cita:', err);
      alert('Hubo un error al intentar cancelar la cita.');
    }
  };

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Cargando...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar user={user} activePath="/my-appointments" />
      
      <main className="main-content">
        <Header user={user} />

        <section className="content-area">
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <div>
              <h2>Mis Citas</h2>
              <p style={{ color: '#64748B', marginTop: '4px' }}>Gestiona tu historial médico y tus próximas atenciones.</p>
            </div>
            <button className="btn-primary flex-center" onClick={() => navigate('/booking')} style={{ gap: '8px' }}>
              <Calendar size={18} /> Agendar Cita
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="agenda-section animate-fade" style={{ marginTop: '0' }}>
            <div className="agenda-table-container">
              <table className="agenda-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Especialista</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        No tienes citas registradas.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => {
                      const status = apt.status?.trim().toUpperCase();
                      const isPending = status?.includes('PENDING');
                      const isCompleted = status?.includes('COMPLETED');
                      
                      return (
                        <tr key={apt.id}>
                          <td className="time-cell" style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                            {new Date(apt.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                          </td>
                          <td className="patient-cell">
                            Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                          </td>
                          <td style={{ color: '#475569' }}>
                            {apt.reason || 'Sin motivo especificado'}
                          </td>
                          <td>
                            <span className={`status-pill ${status?.toLowerCase()}`}>
                              {isPending ? 'Pendiente' : 
                               isCompleted ? 'Completada' : 
                               status?.includes('CANCELLED') ? 'Cancelada' : status}
                            </span>
                          </td>
                          <td>
                            {isPending && (
                              <button 
                                className="btn-action" 
                                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}
                                onClick={() => handleCancelAppointment(apt.id)}
                                title="Cancelar Cita"
                              >
                                <XCircle size={16} style={{ marginRight: '4px' }} /> Cancelar
                              </button>
                            )}
                            {isCompleted && (
                              <button 
                                className="btn-action secondary" 
                                onClick={() => navigate('/history')}
                              >
                                Ver Ficha
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyAppointments;
