const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const rut = '99999999-9';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Intentar crear el admin
  const admin = await prisma.user.upsert({
    where: { rut },
    update: { 
        password: hashedPassword,
        role: 'ADMIN' 
    },
    create: {
      rut,
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('-----------------------------------');
  console.log('USUARIO ADMINISTRADOR CONFIGURADO');
  console.log(`RUT: ${rut}`);
  console.log(`Password: ${password}`);
  console.log('-----------------------------------');
}

main()
  .catch(e => {
    console.error('Error creando admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
