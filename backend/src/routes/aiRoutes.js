const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configuración de multer para subida de archivos temporales
const upload = multer({ dest: 'uploads/' });

router.use(protect); // Todas las rutas requieren token

// Analizar síntomas con la IA (Cualquier usuario autenticado puede usarlo)
router.post('/analyze', aiController.getTriageAnalysis);

// Vincular los resultados a una cita
router.post('/link', aiController.saveTriageToAppointment);

// Transcribir voz a texto (Doctores en consola, Pacientes en Triage)
router.post('/transcribe', upload.single('audio'), aiController.transcribeVoice);

// Guardar nota médica final y completar cita (RF12)
router.post('/save-note', authorize('DOCTOR'), aiController.saveMedicalNote);

// Obtener registro médico por cita
router.get('/record/:appointmentId', aiController.getMedicalRecordByAppointment);

module.exports = router;
