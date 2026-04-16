// Este archivo maneja la conexión unificada de Prisma con PostgreSQL.
// Lo creamos una sola vez en todo el proyecto para no saturar la base de datos con múltiples conexiones,
// un concepto conocido como Singleton o instancia única.

const { PrismaClient } = require('@prisma/client');

// Instanciamos el cliente
const prisma = new PrismaClient();

// Exportamos esta instancia para que cualquier parte de nuestro código que necesite interactuar 
// con la base de datos (por ejemplo, para crear un usuario) la pueda reutilizar importando este archivo.
module.exports = prisma;
