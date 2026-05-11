const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require('../config/prisma');
const fs = require('fs');
const asyncHandler = require('../middleware/asyncHandler');

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1beta" });

/**
 * Función principal de Triage (RF10, RF11)
 * Limpieza: Uso de gemini-2.5-flash y manejo de errores centralizado.
 */
exports.getTriageAnalysis = asyncHandler(async (req, res) => {
  const { symptomsInput } = req.body;

  if (!symptomsInput) {
    res.status(400);
    throw new Error("Por favor, describe tus síntomas.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const cleanJson = response.text().replace(/```json|```/g, "").trim();
  const analysis = JSON.parse(cleanJson);

  res.json({ message: "Análisis de IA completado", analysis });
});

/**
 * Vincular el resultado a una cita y crear registro médico (RF10)
 */
exports.saveTriageToAppointment = asyncHandler(async (req, res) => {
  const { appointmentId, symptomsSummary, priority } = req.body;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    res.status(404);
    throw new Error("Cita no encontrada.");
  }

  const record = await prisma.medicalRecord.upsert({
    where: { appointmentId },
    update: { symptoms: symptomsSummary, priority },
    create: {
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      symptoms: symptomsSummary,
      priority
    }
  });

  res.json({ message: "Triage guardado exitosamente.", record });
});

/**
 * Transcribir audio a texto (RF12)
 */
exports.transcribeVoice = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No se subió ningún archivo de audio.");
  }

  console.log("Iniciando transcripción con Gemini (gemini-2.5-flash)...");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const audioBuffer = fs.readFileSync(req.file.path);
  const cleanMimeType = req.file.mimetype ? req.file.mimetype.split(';')[0] : 'audio/webm';

  const part = {
    inlineData: {
      data: audioBuffer.toString("base64"),
      mimeType: cleanMimeType
    }
  };

  const prompt = "Transcribe el siguiente audio médico a texto de forma clara y precisa.";
  const result = await model.generateContent([prompt, part]);
  const response = await result.response;
  const text = response.text();

  // Limpiar el archivo temporal
  if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

  res.json({ message: "Transcripción completada", text });
});

/**
 * Guardar nota médica final y completar cita (RF12)
 */
exports.saveMedicalNote = asyncHandler(async (req, res) => {
  const { appointmentId, notes } = req.body;

  if (!appointmentId || !notes) {
    res.status(400);
    throw new Error("Faltan datos obligatorios.");
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });

  if (!appointment) {
    res.status(404);
    throw new Error("Cita no encontrada.");
  }

  const record = await prisma.medicalRecord.upsert({
    where: { appointmentId },
    update: { notes, doctorId: req.user.userId },
    create: {
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      notes
    }
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'COMPLETED' }
  });

  res.json({ message: "Atención finalizada.", record });
});

/**
 * Obtener registro médico por ID de cita
 */
exports.getMedicalRecordByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const record = await prisma.medicalRecord.findUnique({ where: { appointmentId } });

  if (!record) {
    res.status(404);
    throw new Error("Registro no encontrado.");
  }

  res.json(record);
});
