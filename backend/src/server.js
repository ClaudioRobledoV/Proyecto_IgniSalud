// Este archivo es el Punto de Entrada (Entry Point) principal de nuestra aplicación.
// Su única responsabilidad es iniciar (arrancar) el servidor en un puerto específico.

// Importamos las variables de entorno desde nuestro archivo .env (evita que las contraseñas queden expuestas)
require('dotenv').config();

// Importamos la aplicación configurada desde app.js (donde están nuestros middlewares y rutas)
const app = require('./app');

// Definimos el puerto donde vivirá el backend. Si el archivo .env no tiene uno, usamos el 4000 por defecto.
const PORT = process.env.PORT || 4000;

// Iniciamos el servidor y le decimos que escuche peticiones en el puerto configurado
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🌟 Servidor IgniSalud Iniciado`);
  console.log(`📍 Escuchando en: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
