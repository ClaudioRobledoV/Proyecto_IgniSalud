import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Llamada al backend para solicitar reseteo
      await axios.post('http://localhost:4001/api/auth/forgot-password', { email, rut });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo procesar la solicitud. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card animate-fade">
          <div className="success-icon-container">
            <CheckCircle size={60} color="#10B981" />
          </div>
          <h2 style={{ marginBottom: '16px' }}>¡Correo Enviado!</h2>
          <p style={{ color: '#64748B', marginBottom: '32px' }}>
            Si los datos coinciden con nuestra base de datos, recibirás un correo con las instrucciones para restablecer tu contraseña.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
            Volver al Inicio
          </button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            .success-icon-container { display: flex; justify-content: center; margin-bottom: 24px; }
        `}} />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-mesh"></div>
      
      <div className="login-card animate-fade">
        <Logo size={150} />
        
        <button onClick={() => navigate('/login')} className="back-btn-forgot">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <div className="login-header">
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu RUT y el correo asociado a tu cuenta para continuar.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <div className="input-icon-forgot">RUT</div>
            <input 
              type="text" 
              placeholder="12345678-9" 
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
              style={{ paddingLeft: '60px' }}
            />
          </div>

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="correo@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Enviar Instrucciones'}
            {!loading && <Send size={18} />}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          text-align: center;
        }

        .back-btn-forgot {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #94A3B8;
          font-weight: 600; cursor: pointer; margin-bottom: 20px;
          padding: 0;
        }
        .back-btn-forgot:hover { color: var(--primary); }

        .login-header h2 { font-size: 24px; margin-bottom: 8px; color: #1E293B; }
        .login-header p { color: #64748B; font-size: 15px; margin-bottom: 32px; }

        .error-alert {
          background: #FFF5F5; color: #C53030; padding: 12px; border-radius: 12px;
          font-size: 14px; margin-bottom: 20px; border: 1px solid #FEB2B2;
        }

        .input-group { position: relative; margin-bottom: 16px; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .input-icon-forgot { 
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%); 
          font-weight: 800; font-size: 12px; color: #64748B;
        }

        .input-group input {
          width: 100%; padding: 14px 16px 14px 48px;
          border-radius: 12px; border: 1px solid #E2E8F0;
          font-size: 16px; transition: 0.2s;
        }
        .input-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(38, 198, 218, 0.1); }

        .login-btn { 
          width: 100%; height: 52px; display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 16px; margin-top: 10px;
        }
      `}} />
    </div>
  );
};

export default ForgotPassword;
