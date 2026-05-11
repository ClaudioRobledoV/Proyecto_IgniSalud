import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import authService from './services/authService'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Triage from './pages/Triage'
import DoctorConsole from './pages/DoctorConsole'
import Booking from './pages/Booking'
import Register from './pages/Register'
import MedicalHistory from './pages/MedicalHistory'
import UserManagement from './pages/UserManagement'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import GlobalAppointments from './pages/GlobalAppointments'
import SystemSettings from './pages/SystemSettings'

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!authService.getToken();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para evitar entrar al login si ya estás autenticado
const PublicRoute = ({ children }) => {
  const isAuthenticated = !!authService.getToken();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {

  useEffect(() => {
    let timeoutId;
    let inactivityLimit = 30 * 60 * 1000; // 30 min por defecto

    // Función para obtener el tiempo de sesión desde la base de datos
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ignisalud-backend.onrender.com/api'}/admin/settings`, {
          headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        if (response.ok) {
          const settings = await response.json();
          if (settings && settings.sessionTimeout) {
            inactivityLimit = settings.sessionTimeout * 60 * 1000;
            console.log(`Sesión configurada: ${settings.sessionTimeout} minutos.`);
          }
        }
      } catch (err) {
        console.warn("Usando tiempo de sesión por defecto (30m).");
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (authService.getToken()) {
        timeoutId = setTimeout(() => {
          authService.logout();
          window.location.href = '/login?expired=true';
        }, inactivityLimit);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    fetchSettings().then(() => resetTimer());

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas Privadas (Protegidas) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/triage" element={<PrivateRoute><Triage /></PrivateRoute>} />
        <Route path="/doctor-console" element={<PrivateRoute><DoctorConsole /></PrivateRoute>} />
        <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><MedicalHistory /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin/appointments" element={<PrivateRoute><GlobalAppointments /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SystemSettings /></PrivateRoute>} />

        {/* Redirección por defecto */}
        <Route path="/" element={
          authService.getToken() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  )
}

export default App
