import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import authService from '../services/authService';
import { User, Lock, ArrowRight, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    rut: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    
    try {
      await authService.register({
        rut: formData.rut,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      });

      // Login automático
      await authService.login(formData.rut, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al registrar cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-mesh"></div>
      
      <div className="login-card animate-fade" style={{ maxWidth: '480px' }}>
        <Logo size={140} />
        
        <div className="login-header">
          <h2>Crea tu cuenta</h2>
          <p>Únete a IgniSalud y gestiona tu salud hoy mismo.</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input 
                name="firstName"
                type="text" 
                placeholder="Nombre" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input 
                name="lastName"
                type="text" 
                placeholder="Apellido" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <User size={20} className="input-icon" />
            <input 
              name="rut"
              type="text" 
              placeholder="RUT (ej: 12345678-9)" 
              value={formData.rut}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              name="password"
              type="password" 
              placeholder="Contraseña" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              name="confirmPassword"
              type="password" 
              placeholder="Confirmar Contraseña" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse ahora'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
