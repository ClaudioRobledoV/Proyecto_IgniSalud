import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mic, FileText } from 'lucide-react';
import authService from '../services/authService';
import appointmentService from '../services/appointmentService';
import adminService from '../services/adminService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return navigate('/login');
    setUser(currentUser);

    const fetchData = async () => {
      try {
        if (currentUser.role === 'ADMIN') {
          const stats = await adminService.getStats();
          setAdminStats(stats);
        } else {
          const data = await appointmentService.getMyAppointments();
          setAppointments(data);
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Cargando...</div>;

  const lastCompletedApt = user?.role === 'PATIENT' 
    ? [...appointments].reverse().find(a => a.status?.trim().toUpperCase() === 'COMPLETED' && a.medicalRecord?.notes)
    : null;

  return (
    <div className="dashboard-container">
      <Sidebar user={user} activePath="/dashboard" />
      
      <main className="main-content">
        <Header user={user} />

        <section className="content-area">
          <div className="welcome-banner animate-fade">
            <h1>Bienvenido, {user?.profile?.firstName || 'Usuario'}</h1>
            <p>Gestiona tu salud y tus citas de forma sencilla y segura.</p>
          </div>

          <div className="status-grid animate-fade">
            {/* Tarjeta de Próxima Cita (Pacientes y Doctores) */}
            {user?.role !== 'ADMIN' && (
              <div className="status-card">
                <h3>{user?.role === 'PATIENT' ? 'Próxima Cita' : 'Siguiente Paciente'}</h3>
                {appointments.length > 0 ? (
                  <>
                    <p className="card-value">
                      {new Date(appointments[0].date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </p>
                    <span className="card-desc">
                      {user?.role === 'PATIENT'
                        ? `Dr. ${appointments[0].doctor?.firstName} ${appointments[0].doctor?.lastName}`
                        : `${appointments[0].patient?.firstName} ${appointments[0].patient?.lastName}`
                      }
                    </span>
                  </>
                ) : <p className="card-value">Sin citas pendientes</p>}
              </div>
            )}

            {/* Estadísticas para Administrador */}
            {user?.role === 'ADMIN' && adminStats && (
              <>
                <div className="status-card highlight-admin">
                  <h3>Total Pacientes</h3>
                  <p className="card-value">{adminStats.totalPatients}</p>
                </div>
                <div className="status-card">
                  <h3>Médicos Activos</h3>
                  <p className="card-value">{adminStats.totalDoctors}</p>
                </div>
                <div className="status-card" onClick={() => navigate('/admin/appointments')} style={{cursor: 'pointer'}}>
                  <h3>Citas Totales</h3>
                  <p className="card-value">{adminStats.totalAppointments}</p>
                </div>
              </>
            )}

            {/* Acciones Rápidas */}
            <div className="status-card highlight">
              <h3>Acciones Rápidas</h3>
              {user?.role === 'PATIENT' && (
                <button className="btn-primary" onClick={() => navigate('/booking')} style={{width: '100%', marginTop: '10px'}}>
                  <Calendar size={18} style={{marginRight: '8px'}} /> Agendar Cita
                </button>
              )}
              {user?.role === 'DOCTOR' && (
                <button className="btn-primary" onClick={() => navigate('/doctor-console')} style={{width: '100%', marginTop: '10px'}}>
                  <Mic size={18} style={{marginRight: '8px'}} /> Grabar Nota
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <button className="btn-primary" onClick={() => navigate('/users')} style={{width: '100%', marginTop: '10px'}}>
                    Gestionar Usuarios
                  </button>
                  <button className="btn-primary" onClick={() => navigate('/admin/appointments')} style={{width: '100%', marginTop: '10px', background: 'var(--secondary)'}}>
                    Ver Citas Globales
                  </button>
                </>
              )}
            </div>

            {/* Último Diagnóstico (Paciente) */}
            {user?.role === 'PATIENT' && lastCompletedApt && (
              <div className="status-card" style={{ gridColumn: 'span 2', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <h3 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} /> Último Diagnóstico e Instrucciones
                </h3>
                <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                  <p style={{ color: '#14532D', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {lastCompletedApt.medicalRecord.notes}
                  </p>
                </div>
                <span className="card-desc" style={{ marginTop: '12px', display: 'block', color: '#166534', fontWeight: '600' }}>
                  Atendido por: Dr. {lastCompletedApt.doctor?.firstName} {lastCompletedApt.doctor?.lastName} el {new Date(lastCompletedApt.date).toLocaleDateString('es-CL')}
                </span>
              </div>
            )}
          </div>

          {/* Listado de Citas según Rol */}
          {user?.role !== 'ADMIN' && (
            <div className="agenda-section animate-fade">
              <div className="section-header">
                <h2>{user?.role === 'PATIENT' ? 'Mis Próximas Citas' : 'Agenda del Día'}</h2>
                <span className="badge">{appointments.length} Citas</span>
              </div>

              <div className="agenda-table-container">
                <table className="agenda-table">
                  <thead>
                    <tr>
                      <th>Fecha/Hora</th>
                      <th>{user?.role === 'PATIENT' ? 'Especialista' : 'Paciente'}</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => {
                      const status = apt.status?.trim().toUpperCase();
                      return (
                        <tr key={apt.id}>
                          <td className="time-cell">
                            {new Date(apt.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                          </td>
                          <td className="patient-cell">
                            {user?.role === 'PATIENT' 
                              ? `Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`
                              : `${apt.patient?.firstName} ${apt.patient?.lastName}`}
                          </td>
                          <td>
                            <span className={`status-pill ${status?.toLowerCase()}`}>
                              {status?.includes('PENDING') ? 'Pendiente' : 
                               status?.includes('COMPLETED') ? 'Completada' : 
                               status?.includes('CANCELLED') ? 'Cancelada' : status}
                            </span>
                          </td>
                          <td>
                            {user?.role === 'PATIENT' ? (
                              status?.includes('COMPLETED') ? (
                                <button className="btn-action" onClick={() => navigate('/history')}>Ver Resumen</button>
                              ) : (
                                <button className="btn-action secondary" onClick={() => navigate('/triage', { state: { appointmentId: apt.id } })}>Evaluación</button>
                              )
                            ) : (
                              status?.includes('COMPLETED') ? (
                                <button className="btn-action" onClick={() => navigate('/history', { 
                                  state: { 
                                    patientId: apt.patientId, 
                                    patientName: `${apt.patient?.firstName} ${apt.patient?.lastName}` 
                                  } 
                                })}>Ver Registro</button>
                              ) : (
                                <button className="btn-action" onClick={() => navigate('/doctor-console', { state: { appointmentId: apt.id, patient: apt.patient } })}>Atender</button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
