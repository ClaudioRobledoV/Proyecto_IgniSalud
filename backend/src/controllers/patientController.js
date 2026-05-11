const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Obtener el perfil del paciente logueado
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!profile) {
    res.status(404);
    throw new Error('Perfil de paciente no encontrado.');
  }

  res.json(profile);
});

/**
 * Actualizar el perfil del paciente logueado (RF03, RF05)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, address, age, allergies, email, phone } = req.body;

  const updatedProfile = await prisma.patientProfile.update({
    where: { userId: req.user.userId },
    data: {
      firstName,
      lastName,
      address,
      age: age ? parseInt(age) : undefined,
      allergies,
      email,
      phone
    }
  });

  res.json({ message: 'Perfil actualizado exitosamente', profile: updatedProfile });
});
