/**
 * Middleware central de manejo de errores.
 * Captura todos los errores de la aplicación y devuelve una respuesta estandarizada.
 */
const errorHandler = (err, req, res, next) => {
  console.error('--- ERROR DETECTADO ---');
  console.error(err.stack);

  // Error por defecto: 500 (Error interno)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Error interno del servidor';

  // Errores específicos de Prisma (opcional, para ser más precisos)
  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Ya existe un registro con esos datos únicos.';
  }

  res.status(statusCode).json({
    status: 'error',
    message: message,
    // Solo enviamos el stack del error en modo desarrollo si fuera necesario
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
