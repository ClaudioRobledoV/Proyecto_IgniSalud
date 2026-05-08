import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, Shield, Key, Trash2, Check, X } from 'lucide-react';
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

  const handleRoleChange = async (userId, currentRole) => {
    const roles = ['PATIENT', 'DOCTOR', 'ADMIN'];
    const newRole = prompt(`Cambiar rol de "${currentRole}" a: (PATIENT, DOCTOR, ADMIN)`, currentRole);

    if (newRole && roles.includes(newRole.toUpperCase()) && newRole.toUpperCase() !== currentRole) {
      setActionLoading(userId);
      try {
        await adminService.updateUserRole(userId, newRole.toUpperCase());
        fetchUsers();
        alert('Rol actualizado.');
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(null);
      }
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
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario de forma permanente? Esta acción no se puede deshacer.')) {
      setActionLoading(userId);
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        alert('Usuario eliminado.');
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(null);
      }
    }
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
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="rut-cell">{user.rut}</td>
                    <td>
                      {user.role === 'PATIENT' ? (
                        `${user.patientProfile?.firstName || ''} ${user.patientProfile?.lastName || ''}`
                      ) : user.role === 'DOCTOR' ? (
                        `Dr. ${user.doctorProfile?.firstName || ''} ${user.doctorProfile?.lastName || ''}`
                      ) : (
                        <span className="admin-label">Administrador Principal</span>
                      )}
                    </td>
                    <td>
                      <span className={`role-pill ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="btn-icon" 
                          title="Cambiar Rol" 
                          onClick={() => handleRoleChange(user.id, user.role)}
                          disabled={actionLoading === user.id}
                        >
                          <Shield size={18} />
                        </button>
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
        .admin-label { color: var(--primary-dark); font-weight: 700; font-style: italic; }

        .role-pill { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
        .role-pill.patient { background: #E0F2FE; color: #0369A1; }
        .role-pill.doctor { background: #D1FAE5; color: #047857; }
        .role-pill.admin { background: #FEE2E2; color: #B91C1C; }

        .action-btns { display: flex; gap: 8px; }
        .btn-icon { background: #F1F5F9; border: none; padding: 8px; border-radius: 8px; color: var(--secondary); cursor: pointer; transition: var(--transition); }
        .btn-icon:hover { background: var(--primary); color: white; }
        .btn-icon.delete:hover { background: #EF4444; }
        .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-state, .empty-row { padding: 40px; text-align: center; color: var(--text-light); }
      `}} />
    </div>
  );
};

export default UserManagement;
