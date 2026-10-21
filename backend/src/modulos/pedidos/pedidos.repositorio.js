// consultas SQL de la tabla pedidos
const conexion = require("../../configuracion/bd.js");

// trae los pedidos activos (pendiente, preparando o listo) usando la vista con total calculado
// el dashboard usa esta función para mostrar los pedidos activos en tiempo real
const obtenerPedidosActivos = async () => {
  const [filas] = await conexion.query(`
    SELECT 
      v.pedido_id AS id,
      v.mesa,
      v.estado,
      v.metodo_pago,
      v.notas,
      v.total,
      v.creado_en
    FROM vista_pedidos_con_total v
    WHERE v.estado IN ('pendiente', 'preparando', 'listo')
    ORDER BY v.creado_en DESC
  `);

  // para cada pedido, se trae sus items (los platos que pidió)
  const pedidosConItems = await Promise.all(
    filas.map(async (pedido) => {
      const [items] = await conexion.query(
        `SELECT nombre_plato, cantidad, precio_venta, notas_item 
         FROM pedido_items 
         WHERE pedido_id = ?`,
        [pedido.id]
      );
      return { ...pedido, items };
    })
  );

  return pedidosConItems;
};

// se trae los últimos 10 pedidos de cualquier estado (sección de pedidos del dashboard)
const obtenerPedidosRecientes = async () => {
  const [filas] = await conexion.query(`
    SELECT 
      v.pedido_id AS id,
      v.mesa,
      v.estado,
      v.metodo_pago,
      v.total,
      v.creado_en,
      COUNT(pi.id) AS cantidad_platos
    FROM vista_pedidos_con_total v
    LEFT JOIN pedido_items pi ON v.pedido_id = pi.pedido_id
    GROUP BY v.pedido_id, v.mesa, v.estado, v.metodo_pago, v.total, v.creado_en
    ORDER BY v.creado_en DESC
    LIMIT 10
  `);
  return filas;
};

// se crea un pedido nuevo con sus items (llamándolo desde el panel del cliente)
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

    if (
      productos.length !== idsProductos.length ||
      productos.some((producto) => !producto.disponible)
    ) {
      const error = new Error("Hay productos inexistentes o no disponibles");
      error.code = "PEDIDOS_PRODUCTOS_INVALIDOS";
      throw error;
    }

    // se inserta el pedido principal
    const [resultadoPedido] = await conexionTransaccion.query(
      `INSERT INTO pedidos (mesa, notas, metodo_pago) VALUES (?, ?, ?)`,
      [mesa, notas || "", metodo_pago || "efectivo"]
    );
    const pedidoId = resultadoPedido.insertId;

    // se inserta cada item del pedido
    for (const item of items) {
      const producto = productosPorId.get(item.producto_id);
      await conexionTransaccion.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre_plato, cantidad, precio_venta, notas_item)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pedidoId,
          item.producto_id,
          producto.nombre,
          item.cantidad,
          producto.precio,
          item.notas_item || "",
        ]
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

// consulta el estado de un pedido (el cliente lo usa para ver si su pedido está listo)
const obtenerEstadoPedido = async (id) => {
  const [filas] = await conexion.query(
    "SELECT id, mesa, estado, creado_en FROM pedidos WHERE id = ?",
    [id]
  );
  return filas[0];
};

// cambia el estado del pedido (el admin lo hace desde el panel de pedidos activos)
const cambiarEstadoPedido = async (id, estado) => {
  await conexion.query("UPDATE pedidos SET estado = ? WHERE id = ?", [
    estado,
    id,
  ]);
};

// --- NUEVOS MÉTODOS DE HISTORIAL Y ESTADÍSTICAS ---

// obtiene todos los pedidos para el historial, incluyendo sus platos
const obtenerHistorial = async () => {
  const [filas] = await conexion.query(`
    SELECT 
      v.pedido_id AS id,
      v.mesa,
      v.estado,
      v.metodo_pago,
      v.notas,
      v.total,
      v.creado_en
    FROM vista_pedidos_con_total v
    ORDER BY v.creado_en DESC
    LIMIT 100
  `);

  const historialConItems = await Promise.all(
    filas.map(async (pedido) => {
      const [items] = await conexion.query(
        `SELECT nombre_plato, cantidad, precio_venta, notas_item 
         FROM pedido_items 
         WHERE pedido_id = ?`,
        [pedido.id]
      );
      return { ...pedido, items };
    })
  );

  return historialConItems;
};

// obtiene las ventas e ingresos del día de hoy
const obtenerTotalesHoy = async () => {
  const [[resultado]] = await conexion.query(`
    SELECT 
      COUNT(*) AS total_pedidos,
      COALESCE(SUM(total), 0) AS ingresos_totales
    FROM vista_pedidos_con_total
    WHERE DATE(creado_en) = CURDATE() AND estado = 'entregado'
  `);
  return resultado;
};

// obtiene las ventas agrupadas por día de los últimos 7 días
const obtenerVentasSemanales = async () => {
  const [filas] = await conexion.query(`
    SELECT 
      DATE_FORMAT(creado_en, '%Y-%m-%d') AS fecha,
      SUM(total) AS total
    FROM vista_pedidos_con_total
    WHERE estado = 'entregado' 
      AND creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE_FORMAT(creado_en, '%Y-%m-%d')
    ORDER BY fecha ASC
  `);
  return filas;
};

const obtenerPedidosPorDia = async () => {
  const [filas] = await conexion.query(`
    SELECT
      DATE_FORMAT(creado_en, '%Y-%m-%d') AS fecha,
      COUNT(*) AS total
    FROM pedidos
    WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE_FORMAT(creado_en, '%Y-%m-%d')
    ORDER BY fecha ASC
  `);
  return filas;
};

const obtenerResumenSemana = async () => {
  const [[resumen]] = await conexion.query(`
    SELECT
      COALESCE(SUM(CASE WHEN estado = 'entregado' THEN total ELSE 0 END), 0) AS ventas_totales,
      ROUND(COALESCE(SUM(CASE WHEN estado = 'entregado' THEN total ELSE 0 END), 0) / 7, 2) AS promedio_diario,
      COUNT(*) AS pedidos_totales
    FROM vista_pedidos_con_total
    WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
  `);
  return resumen;
};

const obtenerResumenMenu = async () => {
  const [[resumen]] = await conexion.query(`
    SELECT
      COUNT(*) AS total_platos,
      COALESCE(SUM(CASE WHEN disponible = 1 THEN 1 ELSE 0 END), 0) AS platos_disponibles
    FROM productos
  `);
  return resumen;
};

const obtenerVentasPorCategoria = async () => {
  const [filas] = await conexion.query(`
    SELECT
      c.nombre AS categoria,
      COUNT(p.id) AS total
    FROM categorias c
    LEFT JOIN productos p ON p.categoria_id = c.id
    GROUP BY c.id, c.nombre
    HAVING COUNT(p.id) > 0
    ORDER BY total DESC, c.nombre ASC
  `);
  return filas;
};

// obtiene el Top 5 de los platos más vendidos
const obtenerPlatosMasVendidos = async () => {
  const [filas] = await conexion.query(`
    SELECT 
      pi.nombre_plato AS nombre, 
      SUM(pi.cantidad) AS cantidad_vendida,
      SUM(pi.cantidad * pi.precio_venta) AS ingresos
    FROM pedido_items pi
    JOIN pedidos p ON pi.pedido_id = p.id
    WHERE p.estado = 'entregado'
    GROUP BY pi.nombre_plato
    ORDER BY cantidad_vendida DESC
    LIMIT 5
  `);
  return filas;
};

module.exports = {
  obtenerPedidosActivos,
  obtenerPedidosRecientes,
  crearPedido,
  obtenerEstadoPedido,
  cambiarEstadoPedido,
  obtenerHistorial,
  obtenerTotalesHoy,
  obtenerVentasSemanales,
  obtenerPedidosPorDia,
  obtenerResumenSemana,
  obtenerResumenMenu,
  obtenerVentasPorCategoria,
  obtenerPlatosMasVendidos,
};
