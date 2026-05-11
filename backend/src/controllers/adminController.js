const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * 1. Obtener estadísticas globales para el Dashboard
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [patients, doctors, appointments, completed] = await Promise.all([
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'COMPLETED' } })
  ]);

  res.json({
    totalPatients: patients,
    totalDoctors: doctors,
    totalAppointments: appointments,
    completedAppointments: completed
  });
});

/**
 * 2. Obtener todos los usuarios con sus perfiles
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: { patientProfile: true, doctorProfile: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(users);
});

/**
 * 3. Cambiar el rol de un usuario
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { userId, newRole } = req.body;

  if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(newRole)) {
    res.status(400);
    throw new Error('Rol inválido.');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  res.json({ message: 'Rol actualizado exitosamente.', user: updatedUser });
});

/**
 * 4. Restablecer contraseña de un usuario
 */
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.json({ message: 'Contraseña restablecida exitosamente.' });
});

/**
 * 5. Eliminar un usuario
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user.userId) {
    res.status(400);
    throw new Error('No puedes eliminar tu propia cuenta.');
  }

  await prisma.user.delete({ where: { id: userId } });

  res.json({ message: 'Usuario eliminado permanentemente.' });
});
