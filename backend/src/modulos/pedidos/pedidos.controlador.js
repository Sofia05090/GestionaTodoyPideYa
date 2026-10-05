//logica de los endpoints de pedidos
const jwt = require("jsonwebtoken");
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

    if (
      !mesa ||
      String(mesa).trim().length > 100 ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 30
    ) {
      return res.status(400).json({ error: "Mesa e items válidos son obligatorios (máximo 30 productos)" });
    }

    if (
      items.some((item) =>
        !Number.isInteger(Number(item.producto_id)) ||
        Number(item.producto_id) < 1 ||
        !Number.isInteger(Number(item.cantidad)) ||
        Number(item.cantidad) < 1 ||
        Number(item.cantidad) > 20 ||
        (item.notas_item && String(item.notas_item).length > 300)
      ) ||
      (notas && String(notas).length > 500) ||
      (metodo_pago && String(metodo_pago).length > 40)
    ) {
      return res.status(400).json({ error: "Los datos del pedido no son válidos" });
    }

    const pedidoId = await pedidosRepositorio.crearPedido({
      mesa: String(mesa).trim(),
      notas: notas || "",
      metodo_pago: metodo_pago || "efectivo",
      items: items.map((item) => ({
        producto_id: Number(item.producto_id),
        cantidad: Number(item.cantidad),
        notas_item: item.notas_item || "",
      })),
    });
    const tokenSeguimiento = jwt.sign(
      { tipo: "seguimiento_pedido", pedidoId },
      process.env.JWT_SECRETO,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      id: pedidoId,
      tokenSeguimiento,
      mensaje: "Pedido creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    if (error.code === "PEDIDOS_PRODUCTOS_INVALIDOS") {
      return res.status(400).json({ error: "Hay productos inexistentes o no disponibles" });
    }
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

const obtenerHistorial = async (req, res) => {
  try {
    const historial = await pedidosRepositorio.obtenerHistorial();
    res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ mensaje: "Error al obtener el historial de pedidos" });
  }
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const [
      totalesHoy,
      ventasSemanales,
      pedidosPorDia,
      resumenSemana,
      resumenMenu,
      ventasPorCategoria,
      platosPopulares,
    ] = await Promise.all([
      pedidosRepositorio.obtenerTotalesHoy(),
      pedidosRepositorio.obtenerVentasSemanales(),
      pedidosRepositorio.obtenerPedidosPorDia(),
      pedidosRepositorio.obtenerResumenSemana(),
      pedidosRepositorio.obtenerResumenMenu(),
      pedidosRepositorio.obtenerVentasPorCategoria(),
      pedidosRepositorio.obtenerPlatosMasVendidos(),
    ]);

    res.json({
      totalesHoy,
      ventasSemanales,
      pedidosPorDia,
      resumenSemana,
      resumenMenu,
      ventasPorCategoria,
      platosPopulares,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ mensaje: "Error al calcular las estadísticas" });
  }
};

module.exports = {
  obtenerActivos,
  obtenerRecientes,
  crearPedido,
  obtenerEstado,
  cambiarEstado,
  obtenerHistorial,
  obtenerEstadisticas,
};
