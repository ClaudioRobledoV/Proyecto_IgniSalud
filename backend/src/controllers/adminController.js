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

  // Obtener el usuario actual con sus perfiles
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { patientProfile: true, doctorProfile: true }
  });

  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado.');
  }

  // Preparar datos para el nuevo perfil si es necesario
  const baseProfile = user.patientProfile || user.doctorProfile;
  const firstName = baseProfile?.firstName || 'Usuario';
  const lastName = baseProfile?.lastName || 'Sistema';

  // Actualizar rol y crear perfil si falta
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { 
      role: newRole,
      // Si el rol cambia a DOCTOR y no tiene perfil de doctor, crearlo
      doctorProfile: (newRole === 'DOCTOR' && !user.doctorProfile) ? {
        create: {
          firstName,
          lastName,
          specialty: 'Medicina General' // Valor por defecto
        }
      } : undefined,
      // Si el rol cambia a PATIENT y no tiene perfil de paciente, crearlo
      patientProfile: (newRole === 'PATIENT' && !user.patientProfile) ? {
        create: {
          firstName,
          lastName
        }
      } : undefined
    },
    include: { patientProfile: true, doctorProfile: true }
  });

  res.json({ message: 'Rol y perfil actualizados exitosamente.', user: updatedUser });
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

/**
 * 6. Obtener todas las citas del sistema (Citas Globales)
 */
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true
    },
    orderBy: { date: 'desc' }
  });
  res.json(appointments);
});
