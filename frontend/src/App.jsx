import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

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
