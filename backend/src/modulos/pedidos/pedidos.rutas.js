//endpoints del módulo de pedidos
const express            = require("express");
const router             = express.Router();
const pedidosControlador = require("./pedidos.controlador");
const verificarToken     = require("../../middleware/verificarToken");
const verificarTokenSeguimientoPedido = require("../../middleware/verificarTokenSeguimientoPedido");

// Rutas del panel del admin (requieren token JWT)
// GET  /api/pedidos/activos pedidos pendiente o preparando
router.get("/activos",   verificarToken, pedidosControlador.obtenerActivos);

// GET  /api/pedidos/recientes ultimos 10 pedidos
router.get("/recientes", verificarToken, pedidosControlador.obtenerRecientes);

// GET /api/pedidos/estadisticas métricas y series para el dashboard
router.get("/estadisticas", verificarToken, pedidosControlador.obtenerEstadisticas);

// GET /api/pedidos/historial pedidos finalizados y cancelados
router.get("/historial", verificarToken, pedidosControlador.obtenerHistorial);

// PATCH /api/pedidos/:id/estado cambia el estado de un pedido
router.patch("/:id/estado", verificarToken, pedidosControlador.cambiarEstado);

// Rutas del panel del cliente (publicas, sin token)
// POST /api/pedidos el cliente crea su pedido desde el QR
router.post("/", pedidosControlador.crearPedido);

// GET  /api/pedidos/:id/estado el cliente consulta si su pedido está listo
router.get("/:id/estado", verificarTokenSeguimientoPedido, pedidosControlador.obtenerEstado);

module.exports = router;
