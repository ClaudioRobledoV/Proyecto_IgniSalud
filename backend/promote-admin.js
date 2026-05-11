const prisma = require('./src/config/prisma');

async function promoteAdmin() {
  const rut = '19993502-k';
  try {
    const user = await prisma.user.update({
      where: { rut: rut },
      data: { role: 'ADMIN' }
    });
    console.log(`¡Éxito! El usuario con RUT ${rut} ahora es ADMINISTRADOR.`);
  } catch (error) {
    console.error('Error al promover usuario:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

promoteAdmin();
