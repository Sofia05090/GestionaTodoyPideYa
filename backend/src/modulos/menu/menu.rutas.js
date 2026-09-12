//se importa el módulo express y se crea un enrutador para manejar las rutas relacionadas con el menu
const express = require("express");

const router = express.Router();

const menuControlador = require("./menu.controlador");

//rutas para obtener el menu, agregar un producto, cambiar la disponibilidad de un producto y eliminar un producto
router.get("/", menuControlador.obtenerMenu);
router.post("/", menuControlador.agregarProducto);
router.patch("/:id/disponibilidad", menuControlador.cambiarDisponibilidad);
router.delete("/:id", menuControlador.eliminarProducto);

module.exports = router;