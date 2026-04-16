const axios = require('axios');

async function testDoctorFeatures() {
  const registerUrl = 'http://localhost:4000/api/auth/register';
  const loginUrl = 'http://localhost:4000/api/auth/login';
  const profileMeUrl = 'http://localhost:4000/api/doctors/me';
  const allDoctorsUrl = 'http://localhost:4000/api/doctors';

  const doctorData = {
    rut: '87654321-0',
    password: 'password456',
    role: 'DOCTOR',
    firstName: 'Elena',
    lastName: 'García'
  };

  try {
    // 1. Registro de Médico
    console.log(`Paso 1: Registrando médico: ${doctorData.rut}...`);
    try {
        const regRes = await axios.post(registerUrl, doctorData);
        console.log('✅ Registro exitoso:', regRes.data.message);
    } catch (err) {
        if (err.response && err.response.data.message.includes('ya está registrado')) {
            console.log('ℹ️ El médico ya estaba registrado, procediendo al login.');
        } else {
            throw err;
        }
    }

    // 2. Login
    console.log('\nPaso 2: Iniciando sesión...');
    const loginRes = await axios.post(loginUrl, {
        rut: doctorData.rut,
        password: doctorData.password
    });
    const token = loginRes.data.token;
    console.log('✅ Login exitoso. Token obtenido.');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 3. Obtener Perfil Propio
    console.log('\nPaso 3: Consultando perfil actual (me)...');
    const getRes = await axios.get(profileMeUrl, config);
    console.log('✅ Datos actuales:', {
      Nombre: getRes.data.firstName,
      Especialidad: getRes.data.specialty || 'Sin definir'
    });

    // 4. Actualizar Perfil
    console.log('\nPaso 4: Actualizando especialidad...');
    const updateData = {
      firstName: 'Elena',
      lastName: 'García',
      specialty: 'Pediatría'
    };
    const updateRes = await axios.put(profileMeUrl, updateData, config);
    console.log('✅', updateRes.data.message);
    console.log('📦 Nuevos datos:', updateRes.data.profile);

    // 5. Listar todos los médicos (público/autenticado)
    console.log('\nPaso 5: Listando todos los médicos del sistema...');
    const allRes = await axios.get(allDoctorsUrl, config);
    console.log(`✅ Se encontraron ${allRes.data.length} médicos.`);
    console.table(allRes.data);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response ? error.response.data : error.message);
  }
}

testDoctorFeatures();
