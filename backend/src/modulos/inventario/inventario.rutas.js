//se importan las herramientas necesarias
const express = require("express");
const router = express.Router();
const controlador = require("./inventario.controlador");
const verificarToken = require("../../middleware/verificarToken");

//se aplica el middleware a todas las rutas para que solo admins logueados puedan entrar
router.use(verificarToken);

//GET: Obtener todo el inventario
router.get("/", controlador.obtenerInventario);

//POST: Crear un nuevo insumo
router.post("/", controlador.crearInsumo);

//PUT: Actualizar un insumo completo por su ID
router.put("/:id", controlador.actualizarInsumo);

//PATCH: Actualizar solo el stock (cantidad) por su ID
router.patch("/:id/stock", controlador.actualizarStock);

//DELETE: Eliminar un insumo por su ID
router.delete("/:id", controlador.eliminarInsumo);

module.exports = router;