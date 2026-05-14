const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Obtener el perfil del doctor logueado
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!profile) {
    res.status(404);
    throw new Error('Perfil de médico no encontrado.');
  }

  res.json(profile);
});

/**
 * Actualizar el perfil del doctor logueado
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, specialty, email, phone } = req.body;

  const updatedProfile = await prisma.doctorProfile.update({
    where: { userId: req.user.userId },
    data: { firstName, lastName, specialty, email, phone }
  });

  res.json({ message: 'Perfil actualizado exitosamente', profile: updatedProfile });
});

/**
 * Obtener lista de todos los doctores
 */
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await prisma.doctorProfile.findMany();
  res.json(doctors);
});

/**
 * Obtener slots disponibles para un médico en una fecha (RF07)
 */
exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error('Indique una fecha válida.');
  }

  // 1. Obtener ajustes del sistema (Duración y Horario)
  let settings = await prisma.systemSettings.findUnique({
    where: { id: 'singleton' }
  });

  // Valores por defecto si no existen ajustes
  if (!settings) {
    settings = {
      appointmentDuration: 20,
      clinicOpenTime: '08:00',
      clinicCloseTime: '20:00'
    };
  }

  const queryDate = new Date(date);
  const dayOfWeek = queryDate.getUTCDay();

  // Fines de semana no hay atención
  if (dayOfWeek === 0 || dayOfWeek === 6) return res.json([]);

  // 2. Generar slots basados en los ajustes de la clínica
  const baseSlots = [];
  const [startH, startM] = settings.clinicOpenTime.split(':').map(Number);
  const [endH, endM] = settings.clinicCloseTime.split(':').map(Number);
  const duration = settings.appointmentDuration;

  let currentH = startH;
  let currentM = startM;

  // Generar bloques hasta llegar a la hora de cierre
  while (currentH < endH || (currentH === endH && currentM < endM)) {
    // Solo agregamos el slot si el bloque termina antes o justo en la hora de cierre
    const nextM = currentM + duration;
    const nextH = currentH + Math.floor(nextM / 60);
    const finalM = nextM % 60;

    if (nextH < endH || (nextH === endH && finalM <= endM)) {
      baseSlots.push(`${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
    }

    currentH = nextH;
    currentM = finalM;
  }

  // 3. Buscar citas ya reservadas para filtrar
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: id,
      date: { gte: startOfDay, lte: endOfDay },
      status: { not: 'CANCELLED' }
    }
  });

  const busyHours = appointments.map(a => {
    const d = new Date(a.date);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  });

  // Filtrar los slots base que no estén ocupados
  const availableSlots = baseSlots.filter(s => !busyHours.includes(s));
  res.json(availableSlots);
});
