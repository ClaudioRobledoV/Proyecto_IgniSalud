const prisma = require('../config/prisma');

// Obtener mi propio historial médico (Para Pacientes)
exports.getMyHistory = async (req, res) => {
    try {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!patient) {
            return res.status(404).json({ message: "Perfil de paciente no encontrado." });
        }

        const history = await prisma.medicalRecord.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: true,
                appointment: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(history);
    } catch (error) {
        console.error("Error obteniendo historial propio:", error);
        res.status(500).json({ message: "Error al obtener el historial médico." });
    }
};

// Obtener historial de un paciente específico (Para Médicos)
exports.getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        const history = await prisma.medicalRecord.findMany({
            where: { patientId: patientId },
            include: {
                doctor: true,
                appointment: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(history);
    } catch (error) {
        console.error("Error obteniendo historial de paciente:", error);
        res.status(500).json({ message: "Error al obtener el historial médico del paciente." });
    }
};
