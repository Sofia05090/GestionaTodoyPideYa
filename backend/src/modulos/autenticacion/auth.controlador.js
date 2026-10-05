// Logica del inicio de sesión
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");
const jwt      = require("jsonwebtoken");
const authRepo = require("./auth.repositorio");

const crearTokenAdmin = (admin) =>
  jwt.sign(
    { id: admin.id, nombre: admin.nombre, correo: admin.correo },
    process.env.JWT_SECRETO,
    { expiresIn: "8h" }
  );

// POST /api/auth/login
// El admin manda correo y contraseña, verificamos contra la BD y devolvemos el token JWT
const iniciarSesion = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ mensaje: "Correo y contraseña son obligatorios" });
  }

  try {
    // Buscamos el admin en la base de datos por correo
    const admin = await authRepo.buscarAdminPorCorreo(correo);

    // Si no existe el correo, devolvemos el mismo mensaje que si la contraseña esta mal
    
    if (!admin) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }
    //aqui se compara la contraseña ingresada con la almacenada en la base de datos
    const contrasenaCorrecta = await bcrypt.compare(contrasena, admin.contrasena);
    if (!contrasenaCorrecta) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    // se genera el token JWT con los datos basicos del admin
    // que contiene el id, nombre y correo del admin, y la clave secreta
   
    const token = crearTokenAdmin(admin);

    // Respondemos con el token y los datos del admin (sin la contraseña)
    res.json({
      token,
      admin: { id: admin.id, nombre: admin.nombre, correo: admin.correo },
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const registrarAdmin = async (req, res) => {
  const codigoEsperado = process.env.REGISTRO_ADMIN_TOKEN;
  const codigoRecibido = typeof req.body?.codigoRegistro === "string"
    ? req.body.codigoRegistro
    : "";

  if (!codigoEsperado || Buffer.byteLength(codigoEsperado, "utf8") < 32) {
    return res.status(503).json({ mensaje: "El registro requiere una invitación configurada por el administrador" });
  }

  const codigoEsperadoBuffer = Buffer.from(codigoEsperado, "utf8");
  const codigoRecibidoBuffer = Buffer.from(codigoRecibido, "utf8");
  if (
    codigoEsperadoBuffer.length !== codigoRecibidoBuffer.length ||
    !crypto.timingSafeEqual(codigoEsperadoBuffer, codigoRecibidoBuffer)
  ) {
    return res.status(403).json({ mensaje: "Código de invitación inválido" });
  }

  const nombre = typeof req.body?.nombre === "string" ? req.body.nombre.trim() : "";
  const correo = typeof req.body?.correo === "string" ? req.body.correo.trim().toLowerCase() : "";
  const contrasena = typeof req.body?.contrasena === "string" ? req.body.contrasena : "";

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ mensaje: "Nombre, correo y contraseña son obligatorios" });
  }

  if (nombre.length > 100 || correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ mensaje: "Ingresa un nombre y un correo válidos" });
  }

  if (contrasena.length < 8 || Buffer.byteLength(contrasena, "utf8") > 72) {
    return res.status(400).json({ mensaje: "La contraseña debe tener entre 8 y 72 bytes" });
  }

  try {
    const adminExistente = await authRepo.buscarAdminPorCorreo(correo);
    if (adminExistente) {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo" });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 12);
    const id = await authRepo.crearAdmin(nombre, correo, contrasenaHash);
    const admin = { id, nombre, correo };

    return res.status(201).json({ token: crearTokenAdmin(admin), admin });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo" });
    }

    console.error("Error al registrar administrador:", error);
    return res.status(500).json({ mensaje: "No se pudo crear la cuenta" });
  }
};

module.exports = { iniciarSesion, registrarAdmin };
