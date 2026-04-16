const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testVoiceSystem() {
  const baseUrl = 'http://localhost:4000/api';
  const doctorData = { rut: '87654321-0', password: 'password456' };

  try {
    console.log('--- PRUEBA DE VOZ A TEXTO (MODO SIMULACIÓN) ---');

    // 1. Login Médico
    console.log('\nPaso 1: Login del Médico...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, doctorData);
    const token = loginRes.data.token;
    console.log('✅ Login exitoso.');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Transcribir Audio (Simulación)
    console.log('\nPaso 2: Enviando audio para transcripción...');
    
    // Como estamos en simulación, no necesitamos un archivo de audio real válido,
    // pero el servidor espera un archivo 'audio' en el form-data.
    // Creamos un archivo temporal vacío para la prueba.
    const tempFilePath = './temp_audio_test.txt';
    fs.writeFileSync(tempFilePath, 'Contenido de audio simulado');

    const form = new FormData();
    form.append('audio', fs.createReadStream(tempFilePath));

    const voiceRes = await axios.post(`${baseUrl}/ai/transcribe`, form, {
      headers: {
        ...config.headers,
        ...form.getHeaders()
      }
    });

    console.log('✅ Respuesta de la IA:', voiceRes.data.message);
    console.log('📝 Texto transcrito:', voiceRes.data.text);

    // Limpiar archivo temporal
    fs.unlinkSync(tempFilePath);

    console.log('\n--- PRUEBA DE VOZ FINALIZADA ---');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response ? error.response.data : error.message);
  }
}

testVoiceSystem();
