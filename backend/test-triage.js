const axios = require('axios');

async function testTriageSystem() {
  const baseUrl = 'http://localhost:4000/api';
  const patientData = { rut: '12345678-9', password: 'password123' };

  try {
    console.log('--- PRUEBA DE TRIAGE IA (MODO SIMULACIÓN) ---');

    // 1. Login Paciente
    console.log('\nPaso 1: Login del Paciente...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, patientData);
    const token = loginRes.data.token;
    console.log('✅ Login exitoso.');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Analizar Síntomas (Simulación)
    console.log('\nPaso 2: Enviando descripción de síntomas a la IA...');
    const symptomsInput = "Me duele mucho el pecho y me cuesta respirar desde hace una hora.";
    
    const analyzeRes = await axios.post(`${baseUrl}/ai/analyze`, { symptomsInput }, config);
    console.log('✅ Respuesta de la IA:', analyzeRes.data.analysis);

    const { symptomsSummary, priority } = analyzeRes.data.analysis;

    // 3. Vincular con una cita (Necesitamos una cita previa del test anterior)
    console.log('\nPaso 3: Buscando cita para vincular resultados...');
    const appointmentsRes = await axios.get(`${baseUrl}/appointments/me`, config);
    
    if (appointmentsRes.data.length > 0) {
        const appointmentId = appointmentsRes.data[0].id;
        console.log(`✅ Vinculando con Cita ID: ${appointmentId}`);

        const linkRes = await axios.post(`${baseUrl}/ai/link`, {
            appointmentId,
            symptomsSummary,
            priority
        }, config);

        console.log('✅ Datos guardados en registro médico:', linkRes.data.message);
        console.table({
            Sintomas: linkRes.data.record.symptoms,
            Prioridad: linkRes.data.record.priority
        });
    } else {
        console.log('⚠️ No se encontraron citas para vincular. Prueba agendar una primero.');
    }

    console.log('\n--- PRUEBA DE TRIAGE FINALIZADA ---');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response ? error.response.data : error.message);
  }
}

testTriageSystem();
