import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, ClipboardList, Settings, LogOut, Mic, FileText, User } from 'lucide-react';
import Logo from './Logo';
import authService from '../services/authService';

const Sidebar = ({ user, activePath }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = {
    PATIENT: [
      { icon: <LayoutDashboard size={20} />, label: 'Resumen', path: '/dashboard' },
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
      { icon: <LayoutDashboard size={20} />, label: 'Resumen', path: '/dashboard' },
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
      { icon: <LayoutDashboard size={20} />, label: 'Panel Control', path: '/dashboard' },
      { icon: <User size={20} />, label: 'Usuarios', path: '/users' },
      { icon: <Calendar size={20} />, label: 'Citas Globales', path: '/admin/appointments' },
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

  const currentMenu = menuItems[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo size={120} />
      </div>

      <nav className="sidebar-nav">
        {currentMenu.map((item, index) => (
          <React.Fragment key={index}>
            <button
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => {
                if (item.subItems) setSettingsOpen(!settingsOpen);
                else if (item.path) navigate(item.path);
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
                  <button key={i} className="submenu-item" onClick={() => sub.path && navigate(sub.path)}>
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
  );
};

export default Sidebar;
