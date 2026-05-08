const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas requieren autenticación
router.use(protect);

// GET /api/medical-records/my-history (Pacientes)
router.get('/my-history', authorize('PATIENT'), medicalRecordController.getMyHistory);

// GET /api/medical-records/patient/:patientId (Médicos)
router.get('/patient/:patientId', authorize('DOCTOR'), medicalRecordController.getPatientHistory);

module.exports = router;
