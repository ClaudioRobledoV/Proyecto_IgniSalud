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

function App() {
  
  useEffect(() => {
    // Configuración del tiempo de inactividad (30 minutos)
    const INACTIVITY_LIMIT = 30 * 60 * 1000; 
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Solo activamos el temporizador si hay un usuario logueado
      if (authService.getToken()) {
        timeoutId = setTimeout(() => {
          console.warn("Cerrando sesión por inactividad...");
          authService.logout();
          window.location.href = '/login?expired=true';
        }, INACTIVITY_LIMIT);
      }
    };

    // Eventos que reinician el contador
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar el contador al cargar
    resetTimer();

    return () => {
      // Limpiar al desmontar
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/doctor-console" element={<DoctorConsole />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/history" element={<MedicalHistory />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
