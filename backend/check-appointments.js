const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true
    }
  });
  console.log(JSON.stringify(appointments, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
