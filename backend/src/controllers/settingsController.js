const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Obtener todos los ajustes del sistema
 */
exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await prisma.systemSettings.findUnique({
    where: { id: 'singleton' }
  });

  // Si no existen, crearlos con valores por defecto
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { id: 'singleton' }
    });
  }

  res.json(settings);
});

/**
 * Actualizar ajustes del sistema
 */
exports.updateSettings = asyncHandler(async (req, res) => {
  const { appointmentDuration, clinicOpenTime, clinicCloseTime, aiTranscriptionEnabled, sessionTimeout } = req.body;

  const settings = await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {
      appointmentDuration: appointmentDuration ? parseInt(appointmentDuration) : undefined,
      clinicOpenTime,
      clinicCloseTime,
      aiTranscriptionEnabled: aiTranscriptionEnabled !== undefined ? aiTranscriptionEnabled : undefined,
      sessionTimeout: sessionTimeout ? parseInt(sessionTimeout) : undefined,
    },
    create: {
      id: 'singleton',
      appointmentDuration: appointmentDuration ? parseInt(appointmentDuration) : 20,
      clinicOpenTime: clinicOpenTime || '08:00',
      clinicCloseTime: clinicCloseTime || '20:00',
      aiTranscriptionEnabled: aiTranscriptionEnabled !== undefined ? aiTranscriptionEnabled : true,
      sessionTimeout: sessionTimeout ? parseInt(sessionTimeout) : 30,
    }
  });

  res.json({ message: 'Ajustes actualizados correctamente', settings });
});
