const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const appointments = await prisma.appointment.findMany({
    include: {
      medicalRecord: true,
      patient: true,
      doctor: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('--- ÚLTIMAS 5 CITAS ---');
  appointments.forEach(apt => {
    console.log(`ID: ${apt.id}`);
    console.log(`Paciente: ${apt.patient.firstName} ${apt.patient.lastName}`);
    console.log(`Doctor: ${apt.doctor.firstName} ${apt.doctor.lastName}`);
    console.log(`Estado: ${apt.status}`);
    console.log(`Tiene Registro Médico: ${!!apt.medicalRecord}`);
    if (apt.medicalRecord) {
      console.log(`- Notas: ${apt.medicalRecord.notes}`);
    }
    console.log('------------------------');
  });

  await prisma.$disconnect();
}

check();
