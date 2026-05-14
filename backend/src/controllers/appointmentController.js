const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Crear una nueva cita (RF07)
 */
exports.createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, reason } = req.body;
  
  // 1. Verificar perfil de paciente
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!patient) {
    res.status(404);
    throw new Error('Se requiere un perfil de paciente para agendar citas.');
  }

  // 2. Verificar exclusividad de horario
  const appointmentDate = new Date(date);
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: appointmentDate,
      status: { not: 'CANCELLED' }
    }
  });

  if (existingAppointment) {
    res.status(400);
    throw new Error('Lo sentimos, esta hora ya ha sido reservada.');
  }

  // 3. Crear la cita
  const newAppointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId,
      date: appointmentDate,
      status: 'PENDING',
      reason
    },
    include: { doctor: true, patient: true }
  });

  res.status(201).json({ message: 'Cita agendada exitosamente', appointment: newAppointment });
});

/**
 * Obtener mis citas (RF08)
 */
exports.getMyAppointments = asyncHandler(async (req, res) => {
  let appointments;

  if (req.user.role === 'PATIENT') {
    const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.userId } });
    appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: { select: { rut: true } } } }, medicalRecord: true },
      orderBy: { date: 'asc' }
    });
  } else if (req.user.role === 'DOCTOR') {
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: req.user.userId } });
    appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { include: { user: { select: { rut: true } } } }, medicalRecord: true },
      orderBy: { date: 'asc' }
    });
  } else {
    res.status(403);
    throw new Error('Rol no autorizado para ver citas.');
  }

  res.json(appointments);
});

/**
 * Actualizar estado de una cita (RF08, RF09)
 */
exports.updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    res.status(404);
    throw new Error('Cita no encontrada.');
  }
  
  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: { status }
  });

  res.json({ message: `Estado actualizado a ${status}`, appointment: updatedAppointment });
});
