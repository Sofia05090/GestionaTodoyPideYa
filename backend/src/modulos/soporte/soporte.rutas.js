const express = require("express");
const soporteControlador = require("./soporte.controlador");
const soporteEventos = require("./soporte.eventos");
const verificarToken = require("../../middleware/verificarToken");

const router = express.Router();

router.get("/", soporteControlador.obtenerConfiguracion);
router.get("/eventos", soporteEventos.conectarCliente);
router.put("/whatsapp", verificarToken, soporteControlador.guardarNumeroWhatsapp);

module.exports = router;
