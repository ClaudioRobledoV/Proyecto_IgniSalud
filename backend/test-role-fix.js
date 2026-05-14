const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRoleChange() {
  console.log('--- Testing Role Change Auto-Profile Creation ---');
  
  // 1. Encontrar o crear un usuario de prueba (Paciente)
  const testRut = '99999999-9';
  let user = await prisma.user.upsert({
    where: { rut: testRut },
    update: { role: 'PATIENT' },
    create: { 
      rut: testRut, 
      password: 'testpassword', 
      role: 'PATIENT',
      patientProfile: { create: { firstName: 'Test', lastName: 'User' } }
    },
    include: { patientProfile: true, doctorProfile: true }
  });

  console.log(`User created: ${user.rut}, Role: ${user.role}, DoctorProfile: ${!!user.doctorProfile}`);

  // 2. Cambiar rol a DOCTOR (Simulando adminController)
  // Nota: No llamamos al controlador directamente para evitar dependencias de req/res en este script, 
  // pero usaremos la misma lógica.
  
  const newRole = 'DOCTOR';
  const baseProfile = user.patientProfile || user.doctorProfile;
  const firstName = baseProfile?.firstName || 'Usuario';
  const lastName = baseProfile?.lastName || 'Sistema';

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { 
      role: newRole,
      doctorProfile: (newRole === 'DOCTOR' && !user.doctorProfile) ? {
        create: { firstName, lastName, specialty: 'Medicina General' }
      } : undefined
    },
    include: { patientProfile: true, doctorProfile: true }
  });

  console.log(`User updated: ${updatedUser.rut}, Role: ${updatedUser.role}, DoctorProfile: ${!!updatedUser.doctorProfile}`);
  
  if (updatedUser.doctorProfile) {
    console.log(`DoctorProfile created for ${updatedUser.doctorProfile.firstName} ${updatedUser.doctorProfile.lastName}`);
  }

  // Limpiar
  // await prisma.user.delete({ where: { id: user.id } });
}

testRoleChange().catch(console.error).finally(() => prisma.$disconnect());
