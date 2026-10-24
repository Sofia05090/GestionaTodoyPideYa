//rutas de autenticación
const express         = require("express");
const router          = express.Router();
const authControlador = require("./auth.controlador");
const verificarToken     = require("../../middleware/verificarToken");

// POST /api/auth/login recibe correo y contraseña, devuelve token JWT
router.post("/login", authControlador.iniciarSesion);

// POST /api/auth/registro crea un administrador y devuelve su token JWT
router.post("/registro", authControlador.registrarAdmin);

// GET /api/auth/perfil obtiene el perfil del administrador (nombre y correo)
router.get("/perfil", verificarToken, authControlador.obtenerPerfilAdmin);

// PATCH /api/auth/perfil actualiza el perfil del administrador (nombre y correo)
router.patch ("/perfil", verificarToken, authControlador.actualizarPerfilAdmin);

module.exports = router;