const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // Todas las rutas requieren token

// Reservar cita (Solo pacientes)
router.post('/', authorize('PATIENT'), appointmentController.createAppointment);

// Ver mis propias citas (Cualquier rol autenticado, el controlador filtra por rol)
router.get('/me', appointmentController.getMyAppointments);

// Actualizar estado (Cancelación por paciente/doctor, o Completada por doctor)
router.patch('/:id/status', appointmentController.updateStatus);

module.exports = router;
