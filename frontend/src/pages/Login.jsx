import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import authService from '../services/authService';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authService.login(rut, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-mesh"></div>
      
      <div className="login-card animate-fade" style={{ maxWidth: '480px' }}>
        <Logo size={180} />
        
        <div className="login-header">
          <h2>¡Bienvenido de nuevo!</h2>
          <p>Tu salud en las mejores manos.</p>
        </div>

        {error && (
          <div className="error-alert animate-fade" style={{
            background: '#FFF5F5',
            color: '#C53030',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #FEB2B2'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="RUT (ej: 12345678-9)" 
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
            <Link to="/forgot-password" style={{ 
              fontSize: '13px', 
              color: 'var(--text-light)', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate como Paciente</Link></p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .login-mesh {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 10% 20%, rgba(38, 198, 218, 0.1) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(21, 67, 96, 0.05) 0%, transparent 40%);
          z-index: 0;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          box-shadow: var(--shadow-premium);
          text-align: center;
          z-index: 1;
        }

        .login-header {
          margin: 24px 0;
        }

        .login-header h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .login-header p {
          color: var(--text-light);
          font-size: 15px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-light);
        }

        .input-group input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: var(--radius);
          border: 1px solid #E2E8F0;
          background: white;
          font-family: inherit;
          font-size: 16px;
          transition: var(--transition);
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(38, 198, 218, 0.1);
        }

        .login-btn {
          margin-top: 8px;
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 16px;
        }

        .login-footer {
          margin-top: 32px;
          font-size: 14px;
          color: var(--text-light);
        }

        .login-footer a {
          color: var(--primary-dark);
          text-decoration: none;
          font-weight: 600;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }
      ` }} />
    </div>
  );
};

export default Login;
