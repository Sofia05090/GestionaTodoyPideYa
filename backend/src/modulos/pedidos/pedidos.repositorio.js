//consultas SQL de la tabla pedidos
const conexion = require("../../configuracion/bd");

//trae los pedidos activos (pendiente o preparando) usando la vista con total calculado
//el dashboard los consulta cada 5 segundos con polling
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
    WHERE v.estado IN ('pendiente', 'preparando')
    ORDER BY v.creado_en DESC
  `);

  //para cada pedido, se trae sus items (los platos que pidio)
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

//se trae los ultimos 10 pedidos de cualquier estado (seccion de pedidos del dashboard)
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

//se crea un pedido nuevo con sus items (llamandolo desde el panel del cliente)
const crearPedido = async ({ mesa, notas, metodo_pago, items }) => {
  const conexionTransaccion = await conexion.getConnection();
  try {
    await conexionTransaccion.beginTransaction();

    //se inserta el pedido principal
    const [resultadoPedido] = await conexionTransaccion.query(
      `INSERT INTO pedidos (mesa, notas, metodo_pago) VALUES (?, ?, ?)`,
      [mesa, notas || "", metodo_pago || "efectivo"]
    );
    const pedidoId = resultadoPedido.insertId;

    //se inserta cada item del pedido
    for (const item of items) {
      await conexionTransaccion.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre_plato, cantidad, precio_venta, notas_item)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.producto_id, item.nombre_plato, item.cantidad, item.precio_venta, item.notas_item || ""]
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

//consulta el estado de un pedido (el cliente lo usa para ver si su pedido esta listo)
const obtenerEstadoPedido = async (id) => {
  const [filas] = await conexion.query(
    "SELECT id, mesa, estado, creado_en FROM pedidos WHERE id = ?",
    [id]
  );
  return filas[0];
};

//cambia el estado del pedido (el admin lo hace desde el panel de pedidos activos)
const cambiarEstadoPedido = async (id, estado) => {
  await conexion.query(
    "UPDATE pedidos SET estado = ? WHERE id = ?",
    [estado, id]
  );
};

module.exports = {
  obtenerPedidosActivos,
  obtenerPedidosRecientes,
  crearPedido,
  obtenerEstadoPedido,
  cambiarEstadoPedido,
};
