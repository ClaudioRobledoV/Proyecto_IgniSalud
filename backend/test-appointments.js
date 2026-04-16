const axios = require('axios');

async function testAppointmentSystem() {
  const baseUrl = 'http://localhost:4000/api';
  
  // Datos de prueba (Paciente y Doctor ya registrados en pasos anteriores)
  const patientData = { rut: '12345678-9', password: 'password123' };
  const doctorData = { rut: '87654321-0', password: 'password456' };

  try {
    console.log('--- INICIO DE PRUEBAS DE CITAS ---');

    console.log('\nPaso 0: Preparando usuarios (Paciente y Médico)...');
    try {
      await axios.post(`${baseUrl}/auth/register`, { ...patientData, firstName: 'Juan', lastName: 'Pérez', role: 'PATIENT' });
      console.log('✅ Paciente registrado.');
    } catch(e) {} // Ignorar si ya existe
    
    try {
      await axios.post(`${baseUrl}/auth/register`, { ...doctorData, firstName: 'Elena', lastName: 'García', role: 'DOCTOR' });
      console.log('✅ Médico registrado.');
    } catch(e) {} // Ignorar si ya existe

    // 1. Login Paciente
    console.log('\nPaso 1: Login del Paciente...');
    const pLogin = await axios.post(`${baseUrl}/auth/login`, patientData);
    const pToken = pLogin.data.token;
    console.log('✅ Login paciente exitoso.');

    // 2. Obtener lista de doctores para elegir uno
    console.log('\nPaso 2: Buscando médicos disponibles...');
    const docsRes = await axios.get(`${baseUrl}/doctors`, {
      headers: { Authorization: `Bearer ${pToken}` }
    });
    const doctor = docsRes.data[0]; 
    console.log(`✅ Médico seleccionado: Dr. ${doctor.lastName} (ID: ${doctor.id})`);

    // 3. Agendar una cita
    console.log('\nPaso 3: Agendando cita...');
    const appointmentDate = new Date();
    appointmentDate.setHours(appointmentDate.getHours() + 24); // Cita para mañana
    
    const appointRes = await axios.post(`${baseUrl}/appointments`, {
      doctorId: doctor.id,
      date: appointmentDate
    }, {
      headers: { Authorization: `Bearer ${pToken}` }
    });
    const appointmentId = appointRes.data.appointment.id;
    console.log('✅ Cita creada:', appointRes.data.message);

    // 4. Ver mis citas (Paciente)
    console.log('\nPaso 4: Verificando agenda del paciente...');
    const pList = await axios.get(`${baseUrl}/appointments/me`, {
      headers: { Authorization: `Bearer ${pToken}` }
    });
    console.log(`✅ El paciente tiene ${pList.data.length} citas agendadas.`);

    // 5. Login Doctor
    console.log('\nPaso 5: Login del Médico...');
    const dLogin = await axios.post(`${baseUrl}/auth/login`, doctorData);
    const dToken = dLogin.data.token;
    console.log('✅ Login médico exitoso.');

    // 6. Ver mis citas (Doctor)
    console.log('\nPaso 6: Verificando agenda del médico...');
    const dList = await axios.get(`${baseUrl}/appointments/me`, {
      headers: { Authorization: `Bearer ${dToken}` }
    });
    console.log(`✅ El médico tiene ${dList.data.length} citas pendientes.`);

    // 7. Actualizar estado (Doctor completa la cita)
    console.log('\nPaso 7: El médico completa la cita...');
    const statusRes = await axios.patch(`${baseUrl}/appointments/${appointmentId}/status`, {
      status: 'COMPLETED'
    }, {
      headers: { Authorization: `Bearer ${dToken}` }
    });
    console.log('✅', statusRes.data.message);

    console.log('\n--- PRUEBAS FINALIZADAS CON ÉXITO ---');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response ? error.response.data : error.message);
  }
}

testAppointmentSystem();
