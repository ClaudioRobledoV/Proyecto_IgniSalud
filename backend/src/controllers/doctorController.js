const prisma = require('../config/prisma');

// Obtener el perfil del doctor logueado
exports.getProfile = async (req, res) => {
  try {
    // Buscamos el perfil del doctor usando el userId que el middleware 'protect' guardó en req.user
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil de médico no encontrado.' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error obteniendo perfil del médico:', error);
    res.status(500).json({ message: 'Error al obtener los datos del perfil del médico.' });
  }
};

// Actualizar el perfil del doctor logueado
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, specialty, email, phone } = req.body;

    const updatedProfile = await prisma.doctorProfile.update({
      where: { userId: req.user.userId },
      data: {
        firstName,
        lastName,
        specialty,
        email,
        phone
      }
    });

    res.json({
      message: 'Perfil de médico actualizado exitosamente',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error actualizando perfil del médico:', error);
    res.status(500).json({ message: 'Error al actualizar los datos del perfil del médico.' });
  }
};

// Obtener lista de todos los doctores (útil para que los pacientes agenden)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany();
    res.json(doctors);
  } catch (error) {
    console.error('Error obteniendo lista de médicos:', error);
    res.status(500).json({ message: 'Error al obtener la lista de médicos.' });
  }
};

// Obtener slots disponibles para un médico en una fecha (RF07)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD (Ej: 2024-03-31)

    if (!date) {
      return res.status(400).json({ message: 'Indique una fecha válida.' });
    }

    // 1. Validar Fin de Semana (Lunes 1 - Viernes 5 en JS getDay() es Domingo 0 - Sábado 6)
    const queryDate = new Date(date);
    const dayOfWeek = queryDate.getUTCDay(); // Usamos UTC para consistencia con el input YYYY-MM-DD

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json([]); // Fin de semana no hay atención
    }

    // 2. Generar Slots Base (Mañana: 09:00-13:00, Tarde: 14:00-18:40)
    const baseSlots = [];
    
    // Función auxiliar para generar bloques
    const addBlocks = (startH, startM, endH, endM) => {
      let h = startH;
      let m = startM;
      while (h < endH || (h === endH && m <= endM)) {
        baseSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += 40;
        if (m >= 60) {
          h += 1;
          m -= 60;
        }
      }
    };

    addBlocks(9, 0, 12, 20); // Mañana: Última a las 12:20 (termina 13:00)
    addBlocks(14, 0, 18, 0); // Tarde: Última a las 18:00 (termina 18:40)

    // 3. Rango del día para buscar citas (Explicitamente UTC)
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // 4. Buscar citas ocupadas
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
  } catch (error) {
    console.error('Error calculando slots:', error);
    res.status(500).json({ message: 'Error al obtener disponibilidad.' });
  }
};
