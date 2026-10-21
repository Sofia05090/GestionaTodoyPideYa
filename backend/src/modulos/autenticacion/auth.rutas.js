//rutas de autenticación
const express         = require("express");
const router          = express.Router();
const authControlador = require("./auth.controlador");

// POST /api/auth/login recibe correo y contraseña, devuelve token JWT
router.post("/login", authControlador.iniciarSesion);

// POST /api/auth/registro crea un administrador y devuelve su token JWT
router.post("/registro", authControlador.registrarAdmin);

module.exports = router;
