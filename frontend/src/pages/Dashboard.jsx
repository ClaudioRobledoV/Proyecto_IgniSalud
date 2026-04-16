import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, ClipboardList, Settings, LogOut, User as UserIcon, Mic } from 'lucide-react';
import Logo from '../components/Logo';
import authService from '../services/authService';
import appointmentService from '../services/appointmentService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Error al cargar citas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'PATIENT' ? [
    { icon: <LayoutDashboard size={20} />, label: 'Resumen', active: true, path: '/dashboard' },
    { icon: <ClipboardList size={20} />, label: 'Triage IA', path: '/triage' },
    { icon: <Calendar size={20} />, label: 'Mis Citas' },
    { icon: <Settings size={20} />, label: 'Configuración' },
  ] : [
    { icon: <LayoutDashboard size={20} />, label: 'Resumen', active: true, path: '/dashboard' },
    { icon: <Mic size={20} />, label: 'Notas Médicas', path: '/doctor-console' },
    { icon: <Calendar size={20} />, label: 'Mi Agenda' },
    { icon: <Settings size={20} />, label: 'Configuración' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={120} />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={() => item.path && navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-search">
            <input type="text" placeholder="Buscar citas, médicos..." />
          </div>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user?.firstName || 'Usuario'}</span>
              <span className="user-role">{user?.role === 'PATIENT' ? 'Paciente' : 'Médico'}</span>
            </div>
            <div className="user-avatar">
              <UserIcon size={24} />
            </div>
          </div>
        </header>

        <section className="content-area">
          <div className="welcome-banner animate-fade">
            <h1>Bienvenido a tu Espacio de Salud</h1>
            <p>Aquí puedes gestionar tus citas, ver tus resultados de triage y más.</p>
          </div>

          <div className="status-grid animate-fade">
            <div className="status-card">
              <h3>{user?.role === 'PATIENT' ? 'Próxima Cita' : 'Siguiente Paciente'}</h3>
              {appointments.length > 0 ? (
                <>
                  <p className="card-value">
                    {new Date(appointments[0].date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="card-desc">
                    {user?.role === 'PATIENT'
                      ? `Dr. ${appointments[0].doctor?.firstName || ''} ${appointments[0].doctor?.lastName || ''} - ${appointments[0].doctor?.specialty || ''}`
                      : `${appointments[0].patient?.firstName || ''} ${appointments[0].patient?.lastName || ''} - RUT: ${appointments[0].patient?.user?.rut || ''}`
                    }
                  </span>
                </>
              ) : (
                <p className="card-value">Sin citas pendientes</p>
              )}
            </div>

            {user?.role === 'PATIENT' ? (
              <div className="status-card highlight">
                <h3>Reserva de Atención</h3>
                <p className="card-value">Agenda hoy tu hora</p>
                <button
                  className="btn-primary"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => navigate('/booking')}
                >
                  <Calendar size={18} style={{ marginRight: '8px' }} />
                  Agendar Nueva Cita
                </button>
              </div>
            ) : (
              <div className="status-card highlight">
                <h3>Notas Médicas</h3>
                <p className="card-value">Voz a Texto</p>
                <button
                  className="btn-primary"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => navigate('/doctor-console')}
                >
                  <Mic size={18} style={{ marginRight: '8px' }} />
                  Grabar Nota Médica
                </button>
              </div>
            )}
          </div>

          {user?.role === 'DOCTOR' && (
            <div className="agenda-section animate-fade">
              <div className="section-header">
                <h2>Agenda del Día</h2>
                <span className="badge">{appointments.length} Citas</span>
              </div>

              <div className="agenda-table-container">
                <table className="agenda-table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>RUT</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td className="time-cell">
                          {new Date(apt.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="patient-cell">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </td>
                        <td>{apt.patient?.user?.rut}</td>
                        <td>
                          <span className={`status-pill ${apt.status.toLowerCase()}`}>
                            {apt.status === 'PENDING' ? 'Pendiente' : apt.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-action"
                            onClick={() => navigate('/doctor-console', { state: { appointmentId: apt.id, patient: apt.patient } })}
                          >
                            Iniciar Atención
                          </button>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                          No hay citas programadas para hoy.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #F1F5F9;
        }

        .sidebar {
          width: 280px;
          background: var(--secondary);
          color: white;
          display: flex;
          flex-direction: column;
          padding: 32px 20px;
          box-shadow: 4px 0 10px rgba(0,0,0,0.05);
        }

        .sidebar-logo {
          margin-bottom: 48px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: transparent;
          color: #A0AEC0;
          transition: var(--transition);
          text-align: left;
          width: 100%;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(38, 198, 218, 0.3);
        }

        .logout {
          margin-top: auto;
          color: #FC8181;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .main-header {
          height: 80px;
          background: white;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E2E8F0;
        }

        .header-search input {
          padding: 10px 20px;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          width: 300px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-name { font-weight: 600; display: block; }
        .user-role { font-size: 12px; color: var(--text-light); }
        .user-avatar { 
          width: 40px; height: 40px; 
          background: #EDF2F7; 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center;
          color: var(--secondary);
        }

        .content-area {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .welcome-banner {
          background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
          padding: 40px;
          border-radius: 24px;
          color: white;
          box-shadow: var(--shadow-premium);
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .status-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: var(--shadow);
        }

        .status-card h3 { font-size: 16px; color: var(--text-light); margin-bottom: 16px; }
        .card-value { font-size: 20px; font-weight: 700; color: var(--secondary); margin-bottom: 4px; }
        .card-desc { font-size: 14px; color: var(--text-light); }

        .agenda-section { margin-top: 16px; }
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .section-header h2 { font-size: 22px; }
        .badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }

        .agenda-table-container { 
          background: white; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: var(--shadow);
        }
        .agenda-table { width: 100%; border-collapse: collapse; text-align: left; }
        .agenda-table th { background: #F8FAFC; padding: 16px 24px; font-size: 13px; color: var(--text-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .agenda-table td { padding: 16px 24px; border-bottom: 1px solid #F1F5F9; font-size: 15px; }
        .time-cell { font-weight: 700; color: var(--primary-dark); }
        .patient-cell { font-weight: 600; color: var(--secondary); }

        .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .status-pill.pending { background: #FEF3C7; color: #92400E; }
        .status-pill.completed { background: #D1FAE5; color: #065F46; }

        .btn-action { 
          background: #F1F5F9; color: var(--secondary); border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; transition: var(--transition); 
        }
        .btn-action:hover { background: var(--primary); color: white; }
      ` }} />
    </div>
  );
};

export default Dashboard;
