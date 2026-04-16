const prisma = require('../config/prisma');

// Obtener el perfil del paciente logueado
exports.getProfile = async (req, res) => {
  try {
    // Buscamos el perfil del paciente usando el userId que el middleware 'protect' guardó en req.user
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil de paciente no encontrado.' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error al obtener los datos del perfil.' });
  }
};

// Actualizar el perfil del paciente logueado (RF03, RF05)
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, address, age, allergies } = req.body;

    const updatedProfile = await prisma.patientProfile.update({
      where: { userId: req.user.userId },
      data: {
        firstName,
        lastName,
        address,
        age: age ? parseInt(age) : undefined,
        allergies
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error al actualizar los datos del perfil.' });
  }
};
