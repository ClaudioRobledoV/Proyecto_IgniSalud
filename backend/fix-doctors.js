const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // 1. Ver especialidades
  const specialties = await prisma.specialty.findMany();
  console.log('Specialties:', specialties);

  // 2. Buscar usuario doctor sin perfil
  const doctorUsers = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    include: { doctorProfile: true }
  });

  for (const user of doctorUsers) {
    if (!user.doctorProfile) {
      console.log(`Creating profile for doctor user: ${user.rut}`);
      // Asumimos nombre basado en lo que vimos en list-users (o usamos uno genérico si no lo tiene)
      // En list-users salía "Ignacio Gatica Vera" para 19828143-3.
      // Pero si list-users lo sacó de algún lado, lo sacó de patientProfile?
      
      const patient = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
      
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          firstName: patient ? patient.firstName : 'Doctor',
          lastName: patient ? patient.lastName : 'Asignado',
          specialty: 'Medicina General'
        }
      });
      console.log('Profile created.');
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
