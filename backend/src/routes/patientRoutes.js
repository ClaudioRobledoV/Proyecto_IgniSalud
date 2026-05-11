const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas estas rutas requieren estar logueado y ser PATIENT
router.use(protect);
// Permitimos que PATIENT y ADMIN accedan a estas rutas (un admin puede tener perfil de paciente)
router.use(authorize('PATIENT', 'ADMIN'));

// GET /api/patients/profile
router.get('/profile', patientController.getProfile);

// PUT /api/patients/profile
router.put('/profile', patientController.updateProfile);

module.exports = router;
