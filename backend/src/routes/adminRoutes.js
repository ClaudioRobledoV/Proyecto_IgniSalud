const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas de administración requieren estar logueado y ser ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

// GET /api/admin/stats
router.get('/stats', adminController.getDashboardStats);

// GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// POST /api/admin/update-role
router.post('/update-role', adminController.updateUserRole);

// POST /api/admin/reset-password
router.post('/reset-password', adminController.resetUserPassword);

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
