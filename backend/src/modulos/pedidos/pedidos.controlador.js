//logica de los endpoints de pedidos
const pedidosRepositorio = require("./pedidos.repositorio");

// GET /api/pedidos/activos pedidos pendiente o preparando (dashboard del admin)
const obtenerActivos = async (req, res) => {
  try {
    const pedidos = await pedidosRepositorio.obtenerPedidosActivos();
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos activos:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
};

// GET /api/pedidos/recientes ultimos 10 pedidos (seccion de pedidos recientes del dashboard)
const obtenerRecientes = async (req, res) => {
  try {
    const pedidos = await pedidosRepositorio.obtenerPedidosRecientes();
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos recientes:", error);
    res.status(500).json({ error: "Error al obtener los pedidos recientes" });
  }
};

// POST /api/pedidos el cliente crea un pedido desde el panel QR
const crearPedido = async (req, res) => {
  try {
    const { mesa, notas, metodo_pago, items } = req.body;

    if (!mesa || !items || items.length === 0) {
      return res.status(400).json({ error: "Mesa e items son obligatorios" });
    }

    const pedidoId = await pedidosRepositorio.crearPedido({ mesa, notas, metodo_pago, items });
    res.status(201).json({ id: pedidoId, mensaje: "Pedido creado correctamente" });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear el pedido" });
  }
};

// GET /api/pedidos/:id/estado el cliente consulta si su pedido está listo
const obtenerEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidosRepositorio.obtenerEstadoPedido(id);

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    console.error("Error al obtener estado del pedido:", error);
    res.status(500).json({ error: "Error al consultar el estado" });
  }
};

// PATCH /api/pedidos/:id/estado el admin cambia el estado del pedido
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ["pendiente", "preparando", "listo", "entregado", "cancelado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    await pedidosRepositorio.cambiarEstadoPedido(id, estado);
    res.json({ mensaje: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ error: "Error al actualizar el estado" });
  }
};

module.exports = {
  obtenerActivos,
  obtenerRecientes,
  crearPedido,
  obtenerEstado,
  cambiarEstado,
};
