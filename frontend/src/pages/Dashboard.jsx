import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, ClipboardList, Settings, LogOut, User as UserIcon, Mic, FileText, User } from 'lucide-react';
import Logo from '../components/Logo';
import authService from '../services/authService';
import appointmentService from '../services/appointmentService';
import adminService from '../services/adminService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
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
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = {
    PATIENT: [
      { icon: <LayoutDashboard size={20} />, label: 'Resumen', active: true, path: '/dashboard' },
      { icon: <ClipboardList size={20} />, label: 'Evaluación de Síntomas', path: '/triage' },
      { icon: <Calendar size={20} />, label: 'Mis Citas' },
      { icon: <FileText size={20} />, label: 'Historia Clínica', path: '/history' },
      { 
        icon: <Settings size={20} />, 
        label: 'Configuración',
        subItems: [
          { label: 'Editar Datos', path: '/profile' },
          { label: 'Ficha Médica', path: '/profile#health' },
          { label: 'Seguridad', path: '/profile#security' }
        ]
      },
    ],
    DOCTOR: [
      { icon: <LayoutDashboard size={20} />, label: 'Resumen', active: true, path: '/dashboard' },
      { icon: <Mic size={20} />, label: 'Notas Médicas', path: '/doctor-console' },
      { icon: <Calendar size={20} />, label: 'Mi Agenda' },
      { icon: <FileText size={20} />, label: 'Historial Pacientes', path: '/history' },
      { 
        icon: <Settings size={20} />, 
        label: 'Configuración',
        subItems: [
          { label: 'Mi Perfil', path: '/profile' },
          { label: 'Seguridad', path: '/security' }
        ]
      },
    ],
    ADMIN: [
      { icon: <LayoutDashboard size={20} />, label: 'Panel Control', active: true, path: '/dashboard' },
      { icon: <User size={20} />, label: 'Usuarios', path: '/users' },
      { icon: <Calendar size={20} />, label: 'Citas Globales' },
      { 
        icon: <Settings size={20} />, 
        label: 'Configuración',
        subItems: [
          { label: 'Perfil Admin', path: '/profile' },
          { label: 'Ajustes Sistema', path: '/settings' }
        ]
      },
    ]
  };

  const currentMenu = menuItems[user?.role] || menuItems.PATIENT;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={120} />
        </div>

        <nav className="sidebar-nav">
          {currentMenu.map((item, index) => (
            <React.Fragment key={index}>
              <button
                className={`nav-item ${item.active ? 'active' : ''}`}
                onClick={() => {
                  if (item.subItems) {
                    setSettingsOpen(!settingsOpen);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.subItems && (
                  <span style={{ marginLeft: 'auto', transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                    ▼
                  </span>
                )}
              </button>
              
              {item.subItems && settingsOpen && (
                <div className="submenu animate-fade-down">
                  {item.subItems.map((sub, i) => (
                    <button 
                      key={i} 
                      className="submenu-item"
                      onClick={() => sub.path && navigate(sub.path)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
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
              <span className="user-name">
                {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Usuario'}
              </span>
              <span className="user-role">
                {user?.role === 'PATIENT' ? 'Paciente' : user?.role === 'ADMIN' ? 'Administrador' : 'Médico'}
              </span>
            </div>
            <div className="user-avatar">
              <UserIcon size={24} />
            </div>
          </div>
        </header>

        <section className="content-area">
          <div className="welcome-banner animate-fade">
            <h1>Bienvenido a tu Espacio de Salud</h1>
            <p>Aquí puedes gestionar tus citas, ver tus resultados de evaluación de síntomas y más.</p>
          </div>

          <div className="status-grid animate-fade">
            <div className="status-card">
              <h3>{user?.role === 'PATIENT' ? 'Próxima Cita' : 'Siguiente Paciente'}</h3>
              {appointments.length > 0 ? (
                <>
                  <p className="card-value">
                    {new Date(appointments[0].date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
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

            {user?.role === 'ADMIN' && adminStats && (
              <>
                <div className="status-card highlight-admin">
                  <h3>Total Pacientes</h3>
                  <p className="card-value">{adminStats.totalPatients}</p>
                  <span className="card-desc">Registrados en sistema</span>
                </div>
                <div className="status-card">
                  <h3>Médicos Activos</h3>
                  <p className="card-value">{adminStats.totalDoctors}</p>
                  <span className="card-desc">Personal de salud</span>
                </div>
                <div className="status-card">
                  <h3>Citas Totales</h3>
                  <p className="card-value">{adminStats.totalAppointments}</p>
                  <span className="card-desc">{adminStats.completedAppointments} Finalizadas</span>
                </div>
              </>
            )}

            {user?.role === 'PATIENT' && (
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
            )}

            {user?.role === 'DOCTOR' && (
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

          {user?.role === 'PATIENT' && (
            <div className="agenda-section animate-fade">
              <div className="section-header">
                <h2>Mis Próximas Citas</h2>
                <span className="badge">{appointments.filter(a => a.status === 'PENDING').length} Pendientes</span>
              </div>

              <div className="agenda-table-container">
                <table className="agenda-table">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Especialista</th>
                      <th>Especialidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter(a => a.status === 'PENDING').map((apt) => (
                      <tr key={apt.id}>
                        <td className="time-cell">
                          {new Date(apt.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </td>
                        <td className="patient-cell">
                          Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                        </td>
                        <td>{apt.doctor?.specialty}</td>
                        <td>
                          <span className={`status-pill ${apt.status.toLowerCase()}`}>
                            Pendiente
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-action secondary"
                            onClick={() => navigate('/triage', { state: { appointmentId: apt.id } })}
                          >
                            Evaluación de Síntomas
                          </button>
                        </td>
                      </tr>
                    ))}
                    {appointments.filter(a => a.status === 'PENDING').length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                          No tienes citas pendientes. ¡Agenda una nueva!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                      <th>Motivo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td className="time-cell">
                          {new Date(apt.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </td>
                        <td className="patient-cell">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </td>
                        <td style={{ fontSize: '13px', color: '#64748B', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apt.reason || 'Sin motivo especificado'}>
                          {apt.reason || 'Sin motivo'}
                        </td>
                        <td>
                          <span className={`status-pill ${apt.status.toLowerCase()}`}>
                            {apt.status === 'PENDING' ? 'Pendiente' : 
                             apt.status === 'COMPLETED' ? 'Completado' : 
                             apt.status === 'CANCELLED' ? 'Cancelado' : apt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn-action"
                              onClick={() => navigate('/doctor-console', { state: { appointmentId: apt.id, patient: apt.patient, reason: apt.reason } })}
                            >
                              Iniciar Atención
                            </button>
                            <button
                              className="btn-action secondary"
                              onClick={() => navigate('/history', { state: { patientId: apt.patientId, patientName: `${apt.patient?.firstName} ${apt.patient?.lastName}` } })}
                            >
                              Ver Historia
                            </button>
                          </div>
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

        .submenu {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 48px;
          margin-top: -4px;
          margin-bottom: 8px;
        }

        .submenu-item {
          background: transparent;
          border: none;
          color: #A0AEC0;
          text-align: left;
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 8px;
          transition: var(--transition);
          cursor: pointer;
        }

        .submenu-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .animate-fade-down {
          animation: fade-down 0.3s ease-out;
        }

        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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
          color: #FFFFFF;
          box-shadow: var(--shadow-premium);
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .welcome-banner h1 {
          color: #FFFFFF;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .welcome-banner p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
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
        .btn-action.secondary { background: #EEF2FF; color: #4338CA; }
        .btn-action.secondary:hover { background: #4338CA; color: white; }

        .highlight-admin {
          border-left: 5px solid #EF4444;
          background: #FEF2F2 !important;
        }
        .admin-label { color: #B91C1C; font-weight: 700; }
      ` }} />
    </div>
  );
};

export default Dashboard;
