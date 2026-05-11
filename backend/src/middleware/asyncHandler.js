/**
 * Wrapper para eliminar la necesidad de usar try-catch en cada controlador.
 * Captura cualquier error en una función asíncrona y lo pasa al middleware de errores.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
