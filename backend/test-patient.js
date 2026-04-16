const axios = require('axios');

async function testPatientFeatures() {
  const loginUrl = 'http://127.0.0.1:4001/api/auth/login';
  const profileUrl = 'http://127.0.0.1:4001/api/patients/profile';

  const loginData = {
    rut: '12345678-9',
    password: 'password123'
  };

  try {
    // 1. Iniciar Sesión para obtener Token
    console.log(`Paso 1: Iniciando sesión con: ${loginData.rut}...`);
    const loginResponse = await axios.post(loginUrl, loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso. Token obtenido.');

    // Configuramos el header de Autorización para las siguientes peticiones
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Obtener Perfil Actual
    console.log('\nPaso 2: Consultando perfil actual...');
    const getResponse = await axios.get(profileUrl, config);
    console.log('✅ Datos actuales:', {
      Nombre: getResponse.data.firstName,
      Direccion: getResponse.data.address || 'Sin datos',
      Alergias: getResponse.data.allergies || 'Sin datos'
    });

    // 3. Actualizar Perfil (RF03)
    console.log('\nPaso 3: Actualizando dirección y alergias...');
    const updateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      address: 'Calle Falsa 123, Santiago',
      age: 30,
      allergies: 'Penicilina y polen'
    };
    const updateResponse = await axios.put(profileUrl, updateData, config);
    console.log('✅', updateResponse.data.message);
    console.log('📦 Nuevos datos guardados:', {
      Direccion: updateResponse.data.profile.address,
      Alergias: updateResponse.data.profile.allergies
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response ? error.response.data : error.message);
  }
}

testPatientFeatures();
