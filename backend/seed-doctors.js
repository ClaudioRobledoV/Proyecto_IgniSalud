const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const hashedPassword = await bcrypt.hash('password456', 10);

  const doctorsData = [
    {
      rut: '11111111-1',
      firstName: 'Ignacio',
      lastName: 'Gatica Vera',
      specialty: 'Medicina General'
    },
    {
      rut: '22222222-2',
      firstName: 'Ignacia',
      lastName: 'Castro Campos',
      specialty: 'Medicina General'
    }
  ];

  for (const doc of doctorsData) {
    // 1. Crear o encontrar Usuario
    const user = await prisma.user.upsert({
      where: { rut: doc.rut },
      update: { role: 'DOCTOR' },
      create: {
        rut: doc.rut,
        password: hashedPassword,
        role: 'DOCTOR'
      }
    });

    // 2. Crear o encontrar Perfil de Doctor
    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: doc.firstName,
        lastName: doc.lastName,
        specialty: doc.specialty
      },
      create: {
        userId: user.id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        specialty: doc.specialty
      }
    });

    console.log(`Doctor ${doc.firstName} ${doc.lastName} configurado.`);
  }

  // Eliminar otros doctores si es necesario (opcional)
  // await prisma.doctorProfile.deleteMany({
  //   where: { NOT: { user: { rut: { in: ['11111111-1', '22222222-2'] } } } }
  // });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
