const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const specialtyController = require('../controllers/specialtyController');
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas de administración requieren estar logueado y ser ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

// Gestión de Usuarios
router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.post('/update-role', adminController.updateUserRole);
router.post('/reset-password', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);

// Citas Globales
router.get('/appointments', adminController.getAllAppointments);

// Gestión de Especialidades
router.get('/specialties', specialtyController.getAllSpecialties);
router.post('/specialties', specialtyController.createSpecialty);
router.delete('/specialties/:id', specialtyController.deleteSpecialty);

// Ajustes del Sistema
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router;
