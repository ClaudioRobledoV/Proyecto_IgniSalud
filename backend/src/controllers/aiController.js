const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require('../config/prisma');
const fs = require('fs');

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Función principal de Triage (RF10, RF11)
exports.getTriageAnalysis = async (req, res) => {
  try {
    const { symptomsInput } = req.body;

    if (!symptomsInput) {
      return res.status(400).json({ message: "Por favor, describe tus síntomas." });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "Configuración incompleta: Falta la API Key de Gemini." });
    }

    // 1. Configurar el modelo (usamos gemini-1.5-flash por ser rápido y eficiente)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Definir el "Prompt" (las instrucciones que le damos a la IA)
    const prompt = `
      Eres un asistente médico experto en triage inicial. 
      Analiza el siguiente texto de un paciente y responde ÚNICAMENTE en formato JSON plano:
      {
        "symptomsSummary": "Breve resumen médico de los síntomas",
        "priority": "LOW" | "MEDIUM" | "HIGH",
        "reasoning": "Explicación breve del porqué de la prioridad"
      }

      Texto del paciente: "${symptomsInput}"
    `;

    // 3. Llamar a la IA
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Limpiar y parsear el JSON (Gemini a veces rodea el JSON con ```json)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    res.json({
      message: "Análisis de IA completado",
      analysis
    });

  } catch (error) {
    console.error("Error en Triage IA:", error);
    res.status(500).json({ message: "Error al procesar el análisis de síntomas con IA." });
  }
};

// Vincular el resultado a una cita y crear registro médico (RF10)
exports.saveTriageToAppointment = async (req, res) => {
    try {
        const { appointmentId, symptomsSummary, priority } = req.body;

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }

        // Crear o actualizar historial médico vinculado a la cita
        const record = await prisma.medicalRecord.upsert({
            where: { appointmentId: appointmentId },
            update: {
                symptoms: symptomsSummary,
                priority: priority
            },
            create: {
                appointmentId: appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                symptoms: symptomsSummary,
                priority: priority
            }
        });

        res.json({
            message: "Triage guardado exitosamente en la ficha médica.",
            record
        });
    } catch (error) {
        console.error("Error guardando triage:", error);
        res.status(500).json({ message: "Error al vincular el triage con la cita." });
    }
};

// Transcribir audio a texto (RF12)
exports.transcribeVoice = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo de audio." });
        }

        // Si no hay API Key real, error
        if (!process.env.GEMINI_API_KEY) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: "Configuración incompleta: Falta la API Key de Gemini." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Leer el archivo de audio
        const audioBuffer = fs.readFileSync(req.file.path);
        
        const part = {
            inlineData: {
                data: audioBuffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const prompt = "Transcribe el siguiente audio médico a texto de forma clara y precisa.";

        const result = await model.generateContent([prompt, part]);
        const response = await result.response;
        const text = response.text();

        // Limpiar el archivo temporal
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({
            message: "Transcripción completada",
            text
        });

    } catch (error) {
        console.error("Error en transcripción:", error);
        res.status(500).json({ message: "Error al procesar el audio con la IA." });
    }
};

// Guardar nota médica final y completar cita (RF12)
exports.saveMedicalNote = async (req, res) => {
    try {
        const { appointmentId, notes } = req.body;

        if (!appointmentId || !notes) {
            return res.status(400).json({ message: "Faltan datos obligatorios (ID de cita o notas)." });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }

        // 1. Crear o actualizar el registro médico
        const record = await prisma.medicalRecord.upsert({
            where: { appointmentId: appointmentId },
            update: {
                notes: notes,
                doctorId: req.user.userId // Asegurar que el doctor actual es el que firma
            },
            create: {
                appointmentId: appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                notes: notes
            }
        });

        // 2. Marcar la cita como completada
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' }
        });

        res.json({
            message: "Atención finalizada y nota guardada exitosamente.",
            record
        });
    } catch (error) {
        console.error("Error al guardar nota médica:", error);
        res.status(500).json({ message: "Error interno al guardar la atención." });
    }
};
