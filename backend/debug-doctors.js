const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  const doctors = await prisma.doctorProfile.findMany();
  console.log('Doctors in DoctorProfile:', doctors.length);
  doctors.forEach(d => console.log(`- ${d.firstName} ${d.lastName} (ID: ${d.id}, UserID: ${d.userId})`));

  const users = await prisma.user.findMany({ where: { role: 'DOCTOR' } });
  console.log('Users with DOCTOR role:', users.length);
  users.forEach(u => console.log(`- RUT: ${u.rut} (ID: ${u.id})`));
}

debug().catch(console.error).finally(() => prisma.$disconnect());
