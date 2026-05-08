// Este archivo concentra la configuración PRINCIPAL de nuestra aplicación Express (Backend).
// Aquí le decimos a Node.js qué herramientas usar (como leer JSON o permitir peticiones de React).

const express = require('express');
const cors = require('cors'); // Asegúrate de haber instalado cors: npm install cors

// Inicializamos la aplicación
const app = express();

// --- MIDDLEWARES (Intermediarios) ---
// Estos códigos se ejecutan ANTES de que la petición llegue a nuestras rutas.

// 1. CORS: Permite que nuestro Frontend (React) que estará en otro puerto pueda comunicarse con este Backend sin que el navegador lo bloquee por seguridad (Cross-Origin Resource Sharing).
app.use(cors());

// 2. express.json(): Esencial para que nuestro servidor pueda leer los datos que enviemos desde el frontend (por ejemplo, los datos del usuario al registrarse) en formato JSON.
app.use(express.json());

// --- CONFIGURACIÓN DE RUTAS ---
// Importamos las rutas de autenticación
const authRoutes = require('./routes/authRoutes');

// Usamos las rutas con el prefijo /api/auth
app.use('/api/auth', authRoutes);

// Importamos las rutas de pacientes
const patientRoutes = require('./routes/patientRoutes');

// Usamos las rutas con el prefijo /api/patients
app.use('/api/patients', patientRoutes);

// Importamos las rutas de médicos
const doctorRoutes = require('./routes/doctorRoutes');

// Usamos las rutas con el prefijo /api/doctors
app.use('/api/doctors', doctorRoutes);

// Importamos las rutas de citas
const appointmentRoutes = require('./routes/appointmentRoutes');

// Usamos las rutas con el prefijo /api/appointments
app.use('/api/appointments', appointmentRoutes);

// Importamos las rutas de IA (Triage y Voz)
const aiRoutes = require('./routes/aiRoutes');

// Usamos las rutas con el prefijo /api/ai
app.use('/api/ai', aiRoutes);

// Importamos las rutas de registros médicos
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

// Usamos las rutas con el prefijo /api/medical-records
app.use('/api/medical-records', medicalRecordRoutes);

// Importamos las rutas de administración
const adminRoutes = require('./routes/adminRoutes');

// Usamos las rutas con el prefijo /api/admin
app.use('/api/admin', adminRoutes);

// --- RUTAS BASE ---
// Ruta de prueba para verificar que el servidor está vivo y funcionando correctamente.
// Esta ruta nos servirá más adelante para comprobar si el backend está en línea.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor IgniSalud funcionando correctamente 🚀' });
});

// Exportamos "app" para poder levantar el servidor desde otro archivo (server.js).
// Esto ayuda a mantener el código ordenado y es muy útil para realizar pruebas automáticas después.
module.exports = app;
