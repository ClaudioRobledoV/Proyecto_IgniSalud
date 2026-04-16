const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para Registrarse (RF01)
// POST /api/auth/register
router.post('/register', authController.register);

// Ruta para Iniciar Sesión (RF02)
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
