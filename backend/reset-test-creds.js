const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);
  const docPassword = await bcrypt.hash('Doctor123!', 10);
  const patPassword = await bcrypt.hash('Paciente123!', 10);

  // 1. Crear o actualizar Administrador
  const admin = await prisma.user.upsert({
    where: { rut: '99999999-9' },
    update: { role: 'ADMIN', password: password },
    create: {
      rut: '99999999-9',
      password: password,
      role: 'ADMIN'
    }
  });
  console.log('Admin creado/actualizado: RUT 99999999-9 | Pass: Admin123!');

  // 2. Actualizar Doctor Ignacio Gatica
  await prisma.user.update({
    where: { rut: '11111111-1' },
    data: { password: docPassword }
  });
  console.log('Doctor Ignacio actualizado: RUT 11111111-1 | Pass: Doctor123!');

  // 3. Actualizar Paciente Claudio Robledo
  await prisma.user.update({
    where: { rut: '19993502-K' },
    data: { password: patPassword }
  });
  console.log('Paciente Claudio actualizado: RUT 19993502-K | Pass: Paciente123!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
