const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: true
      }
    });
    console.log(JSON.stringify(doctors, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
