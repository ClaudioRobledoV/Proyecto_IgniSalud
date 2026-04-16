const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas de perfil médico requieren estar autenticado
router.use(protect);

// Obtener y actualizar mi propio perfil (Solo DOCTOR)
router.get('/me', authorize('DOCTOR'), doctorController.getProfile);
router.put('/me', authorize('DOCTOR'), doctorController.updateProfile);

// Obtener lista de todos los médicos
router.get('/', doctorController.getAllDoctors);

// Obtener disponibilidad de un médico
router.get('/:id/slots', doctorController.getAvailableSlots);

module.exports = router;
