const jwt = require("jsonwebtoken");
const pedidosRepositorio = require("./pedidos.repositorio");

const obtenerActivos = async (req, res) => {
  try { res.json(await pedidosRepositorio.obtenerPedidosActivos()); } catch (error) { res.status(500).json({ error: "Error" }); }
};

const obtenerRecientes = async (req, res) => {
  try { res.json(await pedidosRepositorio.obtenerPedidosRecientes()); } catch (error) { res.status(500).json({ error: "Error" }); }
};

const crearPedido = async (req, res) => {
  try {
    const { mesa, notas, metodo_pago, items } = req.body;
    if (!mesa || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }
    const pedidoId = await pedidosRepositorio.crearPedido({
      mesa: String(mesa).trim(), notas: notas || "", metodo_pago: metodo_pago || "efectivo",
      items: items.map((item) => ({ producto_id: Number(item.producto_id || item.id), cantidad: Number(item.cantidad), notas_item: item.notas_item || "" })),
    });
    const tokenSeguimiento = jwt.sign({ tipo: "seguimiento_pedido", pedidoId }, process.env.JWT_SECRETO, { expiresIn: "7d" });
    res.status(201).json({ id: pedidoId, tokenSeguimiento, mensaje: "Pedido creado" });
  } catch (error) {
    if (error.code === "PEDIDOS_PRODUCTOS_INVALIDOS") return res.status(400).json({ error: "Productos inválidos" });
    res.status(500).json({ error: "Error al crear" });
  }
};

const obtenerEstado = async (req, res) => {
  try {
    const pedido = await pedidosRepositorio.obtenerEstadoPedido(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (error) { res.status(500).json({ error: "Error" }); }
};

const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!["pendiente", "preparando", "listo", "entregado", "cancelado"].includes(estado)) return res.status(400).json({ error: "Estado no válido" });
    await pedidosRepositorio.cambiarEstadoPedido(req.params.id, estado);
    res.json({ mensaje: "Estado actualizado" });
  } catch (error) { res.status(500).json({ error: "Error" }); }
};

// ACTUALIZAR PEDIDO (PATCH)
const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, notas, metodo_pago } = req.body;

    const pedido = await pedidosRepositorio.obtenerEstadoPedido(id);
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    if (pedido.estado !== "pendiente") return res.status(400).json({ error: "El pedido ya está en preparación" });

    await pedidosRepositorio.actualizarPedido(id, {
      notas: notas || "", metodo_pago: metodo_pago || "efectivo",
      items: items.map((item) => ({ producto_id: Number(item.producto_id || item.id), cantidad: Number(item.cantidad), notas_item: item.notas_item || "" })),
    });
    res.json({ mensaje: "Pedido actualizado correctamente" });
  } catch (error) {
    if (error.code === "PEDIDOS_PRODUCTOS_INVALIDOS") return res.status(400).json({ error: "Productos inválidos" });
    res.status(500).json({ error: "Error al actualizar" });
  }
};

const obtenerHistorial = async (req, res) => {
  try { res.json(await pedidosRepositorio.obtenerHistorial()); } catch (error) { res.status(500).json({ error: "Error" }); }
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const [totalesHoy, ventasSemanales, pedidosPorDia, resumenSemana, resumenMenu, ventasPorCategoria, platosPopulares] = await Promise.all([
      pedidosRepositorio.obtenerTotalesHoy(), pedidosRepositorio.obtenerVentasSemanales(), pedidosRepositorio.obtenerPedidosPorDia(),
      pedidosRepositorio.obtenerResumenSemana(), pedidosRepositorio.obtenerResumenMenu(), pedidosRepositorio.obtenerVentasPorCategoria(),
      pedidosRepositorio.obtenerPlatosMasVendidos(),
    ]);
    res.json({ totalesHoy, ventasSemanales, pedidosPorDia, resumenSemana, resumenMenu, ventasPorCategoria, platosPopulares });
  } catch (error) { res.status(500).json({ error: "Error" }); }
};

module.exports = {
  obtenerActivos, obtenerRecientes, crearPedido, obtenerEstado, cambiarEstado,
  actualizarPedido, obtenerHistorial, obtenerEstadisticas,
};
