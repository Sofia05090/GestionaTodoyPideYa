// Middleware para proteger rutas del admin
// Se agrega a cualquier ruta que solo el admin autenticado puede usar
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  // El token llega en el header
  const encabezado = req.headers["authorization"];
  const token = encabezado && encabezado.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Acceso denegado. Token requerido." });
  }

  try {
    // Verificamos que el token sea válido y no haya expirado
    const adminDecodificado = jwt.verify(token, process.env.JWT_SECRETO);
    // Guardamos los datos del admin en req por si algun controlador los necesita
    req.admin = adminDecodificado;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado." });
  }
};

module.exports = verificarToken;
