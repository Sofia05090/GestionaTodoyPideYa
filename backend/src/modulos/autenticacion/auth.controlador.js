// Logica del inicio de sesión
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const authRepo = require("./auth.repositorio");

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
   
    const token = jwt.sign(
      { id: admin.id, nombre: admin.nombre, correo: admin.correo },
      process.env.JWT_SECRETO,
      { expiresIn: "8h" }
    );

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

module.exports = { iniciarSesion };
