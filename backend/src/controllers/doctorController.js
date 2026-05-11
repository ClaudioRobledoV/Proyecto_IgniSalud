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

  const queryDate = new Date(date);
  const dayOfWeek = queryDate.getUTCDay();

  // Fines de semana no hay atención
  if (dayOfWeek === 0 || dayOfWeek === 6) return res.json([]);

  // Generar slots base (bloques de 40 min)
  const baseSlots = [];
  const addBlocks = (startH, startM, endH, endM) => {
    let h = startH, m = startM;
    while (h < endH || (h === endH && m <= endM)) {
      baseSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      m += 40;
      if (m >= 60) { h += 1; m -= 60; }
    }
  };

  addBlocks(9, 0, 12, 20); // Mañana
  addBlocks(14, 0, 18, 0); // Tarde

  // Buscar citas ocupadas
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

  const availableSlots = baseSlots.filter(s => !busyHours.includes(s));
  res.json(availableSlots);
});
