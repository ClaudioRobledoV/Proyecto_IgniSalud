const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      patientProfile: true,
      doctorProfile: true
    }
  });

  console.log('--- USUARIOS REGISTRADOS ---');
  users.forEach(u => {
    const profile = u.patientProfile || u.doctorProfile;
    const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Sin nombre';
    console.log(`RUT: ${u.rut} | Rol: ${u.role} | Nombre: ${name}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
