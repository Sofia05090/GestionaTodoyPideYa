// Endpoints del módulo de menú
const express         = require("express");
const multer          = require("multer");
const path            = require("path");
const { randomUUID }  = require("crypto");
const { rateLimit }   = require("express-rate-limit");
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
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

// Filtro solo aceptamos archivos de imagen (jpg, png, webp, etc.)
const soloImagenes = multer({
  storage: almacenamiento,
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const extensionesPermitidas = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const extension = path.extname(file.originalname).toLowerCase();
    const esImagenPermitida = tiposPermitidos.includes(file.mimetype) && extensionesPermitidas.includes(extension);

    if (!esImagenPermitida) return cb(new Error("Formato de imagen no permitido"));
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, parts: 22 },
});

const limitarCambiosMenu = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { mensaje: "Demasiados cambios en el menú. Intenta más tarde." },
});

// GET  /api/menu lista productos (público: lo ve el cliente también)
router.get("/", menuControlador.obtenerMenu);

// POST /api/menu/lote agrega varios productos en una sola operación (solo admin)
router.post("/lote", verificarToken, limitarCambiosMenu, menuControlador.agregarProductos);

// POST /api/menu agrega producto con imagen (solo admin autenticado)
router.post(
  "/",
  verificarToken,
  limitarCambiosMenu,
  soloImagenes.single("imagen"), // es el nombre del campo del formulario que contiene la imagen
  menuControlador.agregarProducto
);

// PUT  /api/menu/:id edita producto completo con posible imagen nueva (solo admin)
router.put(
  "/:id",
  verificarToken,
  limitarCambiosMenu,
  soloImagenes.single("imagen"),
  menuControlador.actualizarProducto
);

// PATCH /api/menu/:id/disponibilidad toggle disponible/agotado (solo admin)
router.patch("/:id/disponibilidad", verificarToken, limitarCambiosMenu, menuControlador.cambiarDisponibilidad);

// DELETE /api/menu/:id elimina producto (solo admin)
router.delete("/:id", verificarToken, limitarCambiosMenu, menuControlador.eliminarProducto);

module.exports = router;
