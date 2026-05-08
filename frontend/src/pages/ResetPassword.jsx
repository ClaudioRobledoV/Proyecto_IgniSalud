import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener el RUT desde la URL
  const query = new URLSearchParams(location.search);
  const rut = query.get('rut');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:4001/api/auth/reset-password', { 
        rut, 
        newPassword 
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card animate-fade">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <CheckCircle size={60} color="#10B981" />
          </div>
          <h2>Contraseña Restablecida</h2>
          <p style={{ color: '#64748B', margin: '16px 0 32px' }}>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  if (!rut) {
    return (
      <div className="login-container">
        <div className="login-card">
            <AlertCircle size={40} color="#EF4444" style={{ marginBottom: '16px' }} />
            <h2>Enlace Inválido</h2>
            <p>El enlace de recuperación es incorrecto o ha expirado.</p>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: '24px' }}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card animate-fade">
        <Logo size={120} />
        <div className="login-header">
          <h2>Nueva Contraseña</h2>
          <p>Estás restableciendo la contraseña para el RUT: <strong>{rut}</strong></p>
        </div>

        {error && <div className="error-alert-reset">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Lock size={18} className="input-icon-reset" />
            <input 
              type="password" 
              placeholder="Nueva Contraseña" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon-reset" />
            <input 
              type="password" 
              placeholder="Confirmar Contraseña" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Guardando...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F8FAFC; padding: 20px; }
        .login-card { width: 100%; max-width: 440px; padding: 40px; background: white; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); text-align: center; }
        .login-header h2 { font-size: 24px; margin-bottom: 8px; color: #1E293B; }
        .login-header p { color: #64748B; font-size: 15px; margin-bottom: 32px; }
        .error-alert-reset { background: #FFF5F5; color: #C53030; padding: 12px; border-radius: 12px; font-size: 14px; margin-bottom: 20px; border: 1px solid #FEB2B2; }
        .input-group { position: relative; margin-bottom: 16px; }
        .input-icon-reset { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .input-group input { width: 100%; padding: 14px 16px 14px 48px; border-radius: 12px; border: 1px solid #E2E8F0; font-size: 16px; transition: 0.2s; }
        .login-btn { width: 100%; height: 52px; font-size: 16px; margin-top: 10px; }
      `}} />
    </div>
  );
};

export default ResetPassword;
