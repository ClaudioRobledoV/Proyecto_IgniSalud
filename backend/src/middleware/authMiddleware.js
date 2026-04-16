const jwt = require('jsonwebtoken');

// Middleware para proteger rutas que requieren estar logueado (RF02)
const protect = (req, res, next) => {
  let token;

  // El token debe venir en los headers como "Authorization: Bearer <TOKEN>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Guardamos los datos del usuario decodificados en el 'req' para que las rutas los usen
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Error de token:', error);
      return res.status(401).json({ message: 'No autorizado, token fallido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se encontró el token.' });
  }
};

// Middleware para restringir por roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  };
};

module.exports = { protect, authorize };
