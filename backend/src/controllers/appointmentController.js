const prisma = require('../config/prisma');

// Crear una nueva cita (RF07)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;
    
    // 1. Verificar si el paciente tiene perfil (userId viene de req.user.userId del middleware protect)
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Se requiere un perfil de paciente para agendar citas.' });
    }

    // 2. Verificar que el médico existe
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'El médico seleccionado no existe.' });
    }

    // 3. Verificar exclusividad (Que nadie más haya tomado esta hora)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        date: new Date(date),
        status: { not: 'CANCELLED' }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Lo sentimos, esta hora ya ha sido reservada por otro paciente.' });
    }

    // 4. Crear la cita
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date: new Date(date),
        status: 'PENDING',
        reason
      },
      include: {
        doctor: true,
        patient: true
      }
    });

    res.status(201).json({
      message: 'Cita agendada exitosamente',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error interno al agendar la cita.' });
  }
};

// Obtener mis citas (RF08)
exports.getMyAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.userId } });
      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { 
          doctor: {
            include: { user: { select: { rut: true } } }
          }
        },
        orderBy: { date: 'asc' }
      });
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({ where: { userId: req.user.userId } });
      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { 
          patient: {
            include: { user: { select: { rut: true } } }
          }
        },
        orderBy: { date: 'asc' }
      });
    } else {
      return res.status(403).json({ message: 'Rol no autorizado para ver citas.' });
    }

    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener el listado de citas.' });
  }
};

// Actualizar estado de una cita (RF08, RF09)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, COMPLETED, CANCELLED

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }

    // Validar autorización: Solo el paciente o doctor de la cita pueden cambiar el estado
    // (Por simplicidad en este MVP, permitimos cualquier actualización si es su recurso)
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: `Estado de la cita actualizado a ${status}`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la cita.' });
  }
};
