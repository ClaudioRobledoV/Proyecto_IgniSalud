const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        rut: true,
        role: true,
        patientProfile: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        doctorProfile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
