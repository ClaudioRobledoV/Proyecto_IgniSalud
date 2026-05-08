const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Ruta para Registrarse (RF01)
// POST /api/auth/register
router.post('/register', authController.register);

// Ruta para Iniciar Sesión (RF02)
// POST /api/auth/login
router.post('/login', authController.login);

// Cambio de Contraseña (RF15)
// POST /api/auth/change-password
router.post('/change-password', protect, authController.changePassword);

// Recuperación de Contraseña
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
