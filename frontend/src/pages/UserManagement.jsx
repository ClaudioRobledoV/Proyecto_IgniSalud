import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Shield, Key, Trash2, Loader2 } from 'lucide-react';
import adminService from '../services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole) return;
    
    setActionLoading(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      // Actualizar el estado local para reflejar el cambio inmediato
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err) {
      alert('Error al actualizar el rol: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Ingrese la nueva contraseña (mínimo 6 caracteres):');
    if (newPassword && newPassword.length >= 6) {
      setActionLoading(userId);
      try {
        await adminService.resetPassword(userId, newPassword);
        alert('Contraseña restablecida con éxito.');
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setActionLoading(userId);
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Función para traducir roles
  const translateRole = (role) => {
    const roles = {
      'PATIENT': 'Paciente',
      'DOCTOR': 'Médico',
      'ADMIN': 'Administrador'
    };
    return roles[role] || role;
  };

  const filteredUsers = users.filter(user => 
    user.rut.includes(searchTerm) || 
    (user.patientProfile?.firstName + ' ' + user.patientProfile?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.doctorProfile?.firstName + ' ' + user.doctorProfile?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      <div className="management-content animate-fade">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>

        <header className="management-header">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los roles y credenciales de los usuarios de la plataforma.</p>
        </header>

        <div className="search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por RUT o nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">Cargando usuarios...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>RUT</th>
                  <th>Nombre completo</th>
                  <th>Rol / Nivel de Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="rut-cell">{user.rut}</td>
                    <td>
                      {(() => {
                        const profile = user.patientProfile || user.doctorProfile;
                        const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Sin nombre';
                        
                        if (user.role === 'ADMIN') return <span className="admin-label">Administrador: {fullName}</span>;
                        if (user.role === 'DOCTOR') return <strong>Dr. {fullName}</strong>;
                        return fullName;
                      })()}
                    </td>
                    <td>
                      <div className="role-selector-container">
                        <select 
                          className={`role-select ${user.role.toLowerCase()}`}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                        >
                          <option value="PATIENT">Paciente</option>
                          <option value="DOCTOR">Médico</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                        {actionLoading === user.id && <Loader2 size={16} className="spinner" />}
                      </div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="btn-icon" 
                          title="Restablecer Contraseña"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          <Key size={18} />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          title="Eliminar Usuario"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .management-container { min-height: 100vh; background: #F1F5F9; padding: 40px 20px; display: flex; justify-content: center; }
        .management-content { width: 100%; max-width: 1000px; }
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; color: var(--text-light); border: none; margin-bottom: 24px; cursor: pointer; transition: var(--transition); }
        .back-btn:hover { color: var(--primary); }
        .management-header h1 { font-size: 32px; color: var(--secondary); margin-bottom: 8px; }
        .management-header p { color: var(--text-light); margin-bottom: 32px; }

        .search-bar { background: white; padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; box-shadow: var(--shadow); }
        .search-bar input { border: none; outline: none; width: 100%; font-size: 16px; }

        .users-table-container { background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); }
        .users-table { width: 100%; border-collapse: collapse; text-align: left; }
        .users-table th { background: #F8FAFC; padding: 16px 24px; font-size: 13px; color: var(--text-light); font-weight: 600; text-transform: uppercase; }
        .users-table td { padding: 16px 24px; border-bottom: 1px solid #F1F5F9; }

        .rut-cell { font-weight: 700; color: var(--secondary); }
        .admin-label { color: var(--primary-dark); font-weight: 700; }

        .role-selector-container { display: flex; align-items: center; gap: 8px; }
        
        .role-select {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          outline: none;
          transition: var(--transition);
        }

        .role-select.patient { background: #E0F2FE; color: #0369A1; }
        .role-select.doctor { background: #D1FAE5; color: #047857; }
        .role-select.admin { background: #FEE2E2; color: #B91C1C; }
        
        .role-select:focus { border-color: var(--primary); }

        .action-btns { display: flex; gap: 8px; }
        .btn-icon { background: #F1F5F9; border: none; padding: 8px; border-radius: 8px; color: var(--secondary); cursor: pointer; transition: var(--transition); }
        .btn-icon:hover { background: var(--primary); color: white; }
        .btn-icon.delete:hover { background: #EF4444; }
        .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-state, .empty-row { padding: 40px; text-align: center; color: var(--text-light); }
        
        .spinner { animation: spin 1s linear infinite; color: var(--primary); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default UserManagement;
