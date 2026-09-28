//rutas de autenticación
const express         = require("express");
const router          = express.Router();
const authControlador = require("./auth.controlador");

// POST /api/auth/login recibe correo y contraseña, devuelve token JWT
router.post("/login", authControlador.iniciarSesion);

module.exports = router;
