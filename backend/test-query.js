const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const patient = await prisma.patientProfile.findFirst({ where: { firstName: 'Saul' } });
  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    include: { doctor: true, medicalRecord: true },
    orderBy: { date: 'asc' }
  });
  console.log(JSON.stringify(appointments, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
