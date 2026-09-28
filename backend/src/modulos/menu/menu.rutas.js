// Endpoints del módulo de menú
const express         = require("express");
const multer          = require("multer");
const path            = require("path");
const router          = express.Router();
const menuControlador = require("./menu.controlador");
const verificarToken  = require("../../middleware/verificarToken");

// la configuración que define donde y con que nombre se guardan las imágenes
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    // Las imágenes se guardan en backend/imagenes/platos/
    cb(null, path.join(__dirname, "../../../imagenes/platos"));
  },
  filename: (req, file, cb) => {
    // Nombre unico timestamp mas nombre original sin espacios para evitar colisiones
    const nombreUnico = `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
    cb(null, nombreUnico);
  },
});

// Filtro solo aceptamos archivos de imagen (jpg, png, webp, etc.)
const soloImagenes = multer({
  storage: almacenamiento,
  fileFilter: (req, file, cb) => {
    const esImagen = file.mimetype.startsWith("image/");
    cb(null, esImagen);
  },
});

// GET  /api/menu lista productos (público: lo ve el cliente también)
router.get("/", menuControlador.obtenerMenu);

// POST /api/menu/lote agrega varios productos en una sola operación (solo admin)
router.post("/lote", verificarToken, menuControlador.agregarProductos);

// POST /api/menu agrega producto con imagen (solo admin autenticado)
router.post(
  "/",
  verificarToken,
  soloImagenes.single("imagen"), // es el nombre del campo del formulario que contiene la imagen
  menuControlador.agregarProducto
);

// PUT  /api/menu/:id edita producto completo con posible imagen nueva (solo admin)
router.put(
  "/:id",
  verificarToken,
  soloImagenes.single("imagen"),
  menuControlador.actualizarProducto
);

// PATCH /api/menu/:id/disponibilidad toggle disponible/agotado (solo admin)
router.patch("/:id/disponibilidad", verificarToken, menuControlador.cambiarDisponibilidad);

// DELETE /api/menu/:id elimina producto (solo admin)
router.delete("/:id", verificarToken, menuControlador.eliminarProducto);

module.exports = router;
