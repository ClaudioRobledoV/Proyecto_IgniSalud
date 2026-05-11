const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Obtener todas las especialidades
 */
exports.getAllSpecialties = asyncHandler(async (req, res) => {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(specialties);
});

/**
 * Crear una nueva especialidad
 */
exports.createSpecialty = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('El nombre de la especialidad es obligatorio.');
  }

  const specialty = await prisma.specialty.create({
    data: { name }
  });

  res.status(201).json(specialty);
});

/**
 * Eliminar una especialidad
 */
exports.deleteSpecialty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.specialty.delete({
    where: { id }
  });

  res.json({ message: 'Especialidad eliminada correctamente.' });
});
