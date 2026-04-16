const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Registro de Usuario (RF01)
exports.register = async (req, res) => {
  try {
    const { rut, password, role, firstName, lastName } = req.body;

    // 1. Validar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { rut } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario con ese RUT ya está registrado.' });
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
        // Solo creamos perfiles si el rol lo requiere
        patientProfile: userRole === 'PATIENT' ? {
          create: { firstName, lastName }
        } : undefined,
        doctorProfile: userRole === 'DOCTOR' ? {
          create: { firstName, lastName }
        } : undefined
      },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        rut: newUser.rut,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
  }
};

// Login de Usuario (RF02)
exports.login = async (req, res) => {
  try {
    const { rut, password } = req.body;

    // 1. Buscar usuario
    const user = await prisma.user.findUnique({ 
        where: { rut },
        include: { patientProfile: true, doctorProfile: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
  }
};
