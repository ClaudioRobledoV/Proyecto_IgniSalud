const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

// 1. Obtener estadísticas globales para el Dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } });
    const totalDoctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
    const totalAppointments = await prisma.appointment.count();
    const completedAppointments = await prisma.appointment.count({ where: { status: 'COMPLETED' } });

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno al obtener estadísticas.' });
  }
};

// 2. Obtener todos los usuarios con sus perfiles
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        patientProfile: true,
        doctorProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno al obtener la lista de usuarios.' });
  }
};

// 3. Cambiar el rol de un usuario
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(newRole)) {
      return res.status(400).json({ message: 'Rol inválido.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    res.json({ message: 'Rol actualizado exitosamente.', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error interno al actualizar el rol.' });
  }
};

// 4. Restablecer contraseña de un usuario
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error interno al restablecer la contraseña.' });
  }
};

// 5. Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // No permitir eliminarse a sí mismo
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Usuario eliminado de forma permanente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno al eliminar el usuario.' });
  }
};
