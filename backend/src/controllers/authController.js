const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Registro de Usuario (RF01)
 * Limpieza: Se usa asyncHandler para manejar errores automáticamente.
 */
exports.register = asyncHandler(async (req, res) => {
  const { rut, password, role, firstName, lastName, email, phone } = req.body;

  // 1. Validar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { rut } });
  if (existingUser) {
    res.status(400);
    throw new Error('El usuario con ese RUT ya está registrado.');
  }

  // 2. Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Crear usuario y su perfil en una sola transacción
  const userRole = role || 'PATIENT';
  
  const newUser = await prisma.user.create({
    data: {
      rut,
      password: hashedPassword,
      role: userRole,
      patientProfile: userRole === 'PATIENT' ? {
        create: { firstName, lastName, email, phone }
      } : undefined,
      doctorProfile: userRole === 'DOCTOR' ? {
        create: { firstName, lastName, email, phone }
      } : undefined
    }
  });

  res.status(201).json({
    message: 'Usuario registrado exitosamente',
    user: { id: newUser.id, rut: newUser.rut, role: newUser.role }
  });
});

/**
 * Login de Usuario (RF02)
 * Limpieza: Sesión acortada a 30m por seguridad.
 */
exports.login = asyncHandler(async (req, res) => {
  const { rut, password } = req.body;

  // 1. Buscar usuario
  const user = await prisma.user.findUnique({ 
    where: { rut },
    include: { patientProfile: true, doctorProfile: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error('Credenciales inválidas.');
  }

  // 2. Generar Token JWT (30m de duración)
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  res.json({
    message: 'Login exitoso',
    token,
    user: {
      id: user.id,
      rut: user.rut,
      role: user.role,
      profile: user.patientProfile || user.doctorProfile
    }
  });
});

/**
 * Cambio de Contraseña (RF15)
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401);
    throw new Error('La contraseña actual es incorrecta.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.json({ message: 'Contraseña actualizada exitosamente.' });
});

/**
 * Solicitar recuperación de contraseña (MOCK)
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { rut, email } = req.body;
  
  const user = await prisma.user.findUnique({
    where: { rut },
    include: { patientProfile: true, doctorProfile: true }
  });

  if (user) {
    const profile = user.patientProfile || user.doctorProfile;
    if (profile && profile.email === email) {
      console.log(`📧 SIMULACIÓN: Enlace enviado a ${email}`);
    }
  }

  res.json({ message: "Si los datos son correctos, recibirás un correo." });
});

/**
 * Restablecer contraseña sin sesión activa
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { rut, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { rut } });
  if (!user) {
    res.status(404);
    throw new Error("Usuario no encontrado.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { rut },
    data: { password: hashedPassword }
  });

  res.json({ message: "Contraseña restablecida exitosamente." });
});
