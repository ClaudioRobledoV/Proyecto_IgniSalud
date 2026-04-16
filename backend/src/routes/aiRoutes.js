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

// Transcribir voz a texto (Solo médicos, por ejemplo RF12)
router.post('/transcribe', authorize('DOCTOR'), upload.single('audio'), aiController.transcribeVoice);

module.exports = router;
