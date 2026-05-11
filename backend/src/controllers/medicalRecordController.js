const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Obtener mi propio historial médico (Para Pacientes)
 */
exports.getMyHistory = asyncHandler(async (req, res) => {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!patient) {
    res.status(404);
    throw new Error("Perfil de paciente no encontrado.");
  }

  const history = await prisma.medicalRecord.findMany({
    where: { patientId: patient.id },
    include: { doctor: true, appointment: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json(history);
});

/**
 * Obtener historial de un paciente específico (Para Médicos)
 */
exports.getPatientHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const history = await prisma.medicalRecord.findMany({
    where: { patientId: patientId },
    include: { doctor: true, appointment: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json(history);
});
