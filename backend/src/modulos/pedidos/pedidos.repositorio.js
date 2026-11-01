// consultas SQL de la tabla pedidos
const conexion = require("../../configuracion/bd.js");

// trae los pedidos activos (pendiente, preparando o listo) usando la vista con total calculado
const obtenerPedidosActivos = async () => {
  const [filas] = await conexion.query(`
    SELECT v.pedido_id AS id, v.mesa, v.estado, v.metodo_pago, v.notas, v.total, v.creado_en
    FROM vista_pedidos_con_total v
    WHERE v.estado IN ('pendiente', 'preparando', 'listo')
    ORDER BY v.creado_en DESC
  `);

  const pedidosConItems = await Promise.all(
    filas.map(async (pedido) => {
      const [items] = await conexion.query(
        `SELECT nombre_plato, cantidad, precio_venta, notas_item FROM pedido_items WHERE pedido_id = ?`,
        [pedido.id]
      );
      return { ...pedido, items };
    })
  );
  return pedidosConItems;
};

// se trae los últimos 10 pedidos de cualquier estado
const obtenerPedidosRecientes = async () => {
  const [filas] = await conexion.query(`
    SELECT v.pedido_id AS id, v.mesa, v.estado, v.metodo_pago, v.total, v.creado_en, COUNT(pi.id) AS cantidad_platos
    FROM vista_pedidos_con_total v
    LEFT JOIN pedido_items pi ON v.pedido_id = pi.pedido_id
    GROUP BY v.pedido_id, v.mesa, v.estado, v.metodo_pago, v.total, v.creado_en
    ORDER BY v.creado_en DESC
    LIMIT 10
  `);
  return filas;
};

// se crea un pedido nuevo con sus items
const crearPedido = async ({ mesa, notas, metodo_pago, items }) => {
  const conexionTransaccion = await conexion.getConnection();
  try {
    await conexionTransaccion.beginTransaction();
    const idsProductos = [...new Set(items.map((item) => item.producto_id))];
    const marcadores = idsProductos.map(() => "?").join(", ");
    const [productos] = await conexionTransaccion.query(
      `SELECT id, nombre, precio, disponible FROM productos WHERE id IN (${marcadores}) FOR UPDATE`,
      idsProductos
    );
    const productosPorId = new Map(productos.map((producto) => [Number(producto.id), producto]));

    if (productos.length !== idsProductos.length || productos.some((producto) => !producto.disponible)) {
      const error = new Error("Hay productos inexistentes o no disponibles");
      error.code = "PEDIDOS_PRODUCTOS_INVALIDOS";
      throw error;
    }

    const [resultadoPedido] = await conexionTransaccion.query(
      `INSERT INTO pedidos (mesa, notas, metodo_pago) VALUES (?, ?, ?)`,
      [mesa, notas || "", metodo_pago || "efectivo"]
    );
    const pedidoId = resultadoPedido.insertId;

    for (const item of items) {
      const producto = productosPorId.get(item.producto_id);
      await conexionTransaccion.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre_plato, cantidad, precio_venta, notas_item) VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.producto_id, producto.nombre, item.cantidad, producto.precio, item.notas_item || ""]
      );
    }
    await conexionTransaccion.commit();
    return pedidoId;
  } catch (error) {
    await conexionTransaccion.rollback();
    throw error;
  } finally {
    conexionTransaccion.release();
  }
};

// consulta el estado de un pedido
const obtenerEstadoPedido = async (id) => {
  const [filas] = await conexion.query(
    `SELECT p.id, p.mesa, p.estado, p.metodo_pago, p.creado_en, COALESCE(SUM(pi.cantidad * pi.precio_venta), 0) AS total
     FROM pedidos p
     LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
     WHERE p.id = ? GROUP BY p.id`,
    [id]
  );

  if (!filas[0]) return null;

  const [items] = await conexion.query(
    `SELECT producto_id AS id, nombre_plato AS nombre, cantidad, precio_venta AS precio, notas_item FROM pedido_items WHERE pedido_id = ?`,
    [id]
  );

  return { ...filas[0], items };
};

// ACTUALIZAR PEDIDO (SOLO SI ESTÁ PENDIENTE)
const actualizarPedido = async (id, { items, notas, metodo_pago }) => {
  const conexionTransaccion = await conexion.getConnection();
  try {
    await conexionTransaccion.beginTransaction();

    await conexionTransaccion.query(
      `UPDATE pedidos SET notas = ?, metodo_pago = ? WHERE id = ?`,
      [notas || "", metodo_pago || "efectivo", id]
    );

    await conexionTransaccion.query(`DELETE FROM pedido_items WHERE pedido_id = ?`, [id]);

    const idsProductos = [...new Set(items.map((item) => item.producto_id))];
    const marcadores = idsProductos.map(() => "?").join(", ");
    const [productos] = await conexionTransaccion.query(
      `SELECT id, nombre, precio, disponible FROM productos WHERE id IN (${marcadores}) FOR UPDATE`,
      idsProductos
    );
    const productosPorId = new Map(productos.map((producto) => [Number(producto.id), producto]));

    if (productos.length !== idsProductos.length || productos.some((producto) => !producto.disponible)) {
      const error = new Error("Hay productos inexistentes o no disponibles");
      error.code = "PEDIDOS_PRODUCTOS_INVALIDOS";
      throw error;
    }

    for (const item of items) {
      const producto = productosPorId.get(item.producto_id);
      await conexionTransaccion.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre_plato, cantidad, precio_venta, notas_item) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item.producto_id, producto.nombre, item.cantidad, producto.precio, item.notas_item || ""]
      );
    }

    await conexionTransaccion.commit();
  } catch (error) {
    await conexionTransaccion.rollback();
    throw error;
  } finally {
    conexionTransaccion.release();
  }
};

const cambiarEstadoPedido = async (id, estado) => {
  await conexion.query("UPDATE pedidos SET estado = ? WHERE id = ?", [estado, id]);
};

const obtenerHistorial = async () => {
  const [filas] = await conexion.query(`
    SELECT v.pedido_id AS id, v.mesa, v.estado, v.metodo_pago, v.notas, v.total, v.creado_en
    FROM vista_pedidos_con_total v ORDER BY v.creado_en DESC LIMIT 100
  `);
  const historialConItems = await Promise.all(
    filas.map(async (pedido) => {
      const [items] = await conexion.query(
        `SELECT nombre_plato, cantidad, precio_venta, notas_item FROM pedido_items WHERE pedido_id = ?`,
        [pedido.id]
      );
      return { ...pedido, items };
    })
  );
  return historialConItems;
};

const obtenerTotalesHoy = async () => {
  const [[resultado]] = await conexion.query(`
    SELECT COUNT(*) AS total_pedidos, COALESCE(SUM(total), 0) AS ingresos_totales
    FROM vista_pedidos_con_total WHERE DATE(creado_en) = CURDATE() AND estado = 'entregado'
  `);
  return resultado;
};

const obtenerVentasSemanales = async () => {
  const [filas] = await conexion.query(`
    SELECT DATE_FORMAT(creado_en, '%Y-%m-%d') AS fecha, SUM(total) AS total
    FROM vista_pedidos_con_total WHERE estado = 'entregado' AND creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE_FORMAT(creado_en, '%Y-%m-%d') ORDER BY fecha ASC
  `);
  return filas;
};

const obtenerPedidosPorDia = async () => {
  const [filas] = await conexion.query(`
    SELECT DATE_FORMAT(creado_en, '%Y-%m-%d') AS fecha, COUNT(*) AS total
    FROM pedidos WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE_FORMAT(creado_en, '%Y-%m-%d') ORDER BY fecha ASC
  `);
  return filas;
};

const obtenerResumenSemana = async () => {
  const [[resumen]] = await conexion.query(`
    SELECT COALESCE(SUM(CASE WHEN estado = 'entregado' THEN total ELSE 0 END), 0) AS ventas_totales,
      ROUND(COALESCE(SUM(CASE WHEN estado = 'entregado' THEN total ELSE 0 END), 0) / 7, 2) AS promedio_diario,
      COUNT(*) AS pedidos_totales
    FROM vista_pedidos_con_total WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
  `);
  return resumen;
};

const obtenerResumenMenu = async () => {
  const [[resumen]] = await conexion.query(`
    SELECT COUNT(*) AS total_platos, COALESCE(SUM(CASE WHEN disponible = 1 THEN 1 ELSE 0 END), 0) AS platos_disponibles FROM productos
  `);
  return resumen;
};

const obtenerVentasPorCategoria = async () => {
  const [filas] = await conexion.query(`
    SELECT c.nombre AS categoria, COUNT(p.id) AS total
    FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id
    GROUP BY c.id, c.nombre HAVING COUNT(p.id) > 0 ORDER BY total DESC, c.nombre ASC
  `);
  return filas;
};

const obtenerPlatosMasVendidos = async () => {
  const [filas] = await conexion.query(`
    SELECT pi.nombre_plato AS nombre, SUM(pi.cantidad) AS cantidad_vendida, SUM(pi.cantidad * pi.precio_venta) AS ingresos
    FROM pedido_items pi JOIN pedidos p ON pi.pedido_id = p.id
    WHERE p.estado = 'entregado' GROUP BY pi.nombre_plato ORDER BY cantidad_vendida DESC LIMIT 5
  `);
  return filas;
};

module.exports = {
  obtenerPedidosActivos, obtenerPedidosRecientes, crearPedido, obtenerEstadoPedido,
  actualizarPedido, cambiarEstadoPedido, obtenerHistorial, obtenerTotalesHoy,
  obtenerVentasSemanales, obtenerPedidosPorDia, obtenerResumenSemana,
  obtenerResumenMenu, obtenerVentasPorCategoria, obtenerPlatosMasVendidos,
};
