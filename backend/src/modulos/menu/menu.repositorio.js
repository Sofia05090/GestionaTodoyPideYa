//se importa el modulo de conexión a la base de datos que se encuentra en la carpeta de configuracion
//se importan los datos de la db desde el archivo configuracion para poder acceder desde cualquier archivo del proyecto
const conexion = require("../../configuracion/bd");
//se trae todos los productos del menu, se crea un producto, se cambia la disponibilidad de un producto y se elimina un producto
const obtenerMenuCompleto = async () => {
  const [filas] = await conexion.query(`
    SELECT 
          p.id, 
          p.nombre, 
          p.descripcion, 
          p.precio,
          c.nombre AS categoria,
          p.url_imagen AS urlImagen,
          p.disponible,
          p.creado_en
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.id DESC
  `);
  return filas;
};

//se inserta un producto nuevo buscando el id de la categoria por nombre
const crearProducto = async ({ categoria_id, categoria, nombre, descripcion, precio, urlImagen, disponible = true }) => {
  let categoriaId = categoria_id;

  if (!categoriaId && categoria) {
    const [categorias] = await conexion.query(
      "SELECT id FROM categorias WHERE nombre = ?",
      [categoria]
    );
    categoriaId = categorias[0]?.id;
  }

  if (!categoriaId) {
    throw new Error("La categoría indicada no existe");
  }

  const [resultado] = await conexion.query(
    `INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES (?, ?, ?, ?, ?, ?)`,
    [categoriaId, nombre, descripcion, precio, urlImagen || "", disponible]
  );
  return resultado.insertId;
};

const crearProductos = async (productos) => {
  const conexionTransaccion = await conexion.getConnection();
  const categorias = new Map();
  const productosCreados = [];

  try {
    await conexionTransaccion.beginTransaction();

    for (const producto of productos) {
      let categoriaId = producto.categoria_id;
      if (!categoriaId && producto.categoria) {
        if (!categorias.has(producto.categoria)) {
          const [filasCategoria] = await conexionTransaccion.query(
            "SELECT id FROM categorias WHERE nombre = ?",
            [producto.categoria]
          );
          categorias.set(producto.categoria, filasCategoria[0]?.id);
        }
        categoriaId = categorias.get(producto.categoria);
      }

      if (!categoriaId) {
        throw new Error(`La categoría indicada no existe: ${producto.categoria || "(vacía)"}`);
      }

      const [resultado] = await conexionTransaccion.query(
        `INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoriaId, producto.nombre, producto.descripcion, producto.precio, producto.urlImagen || "", producto.disponible ?? true]
      );
      productosCreados.push({ id: resultado.insertId, ...producto, urlImagen: producto.urlImagen || "" });
    }

    await conexionTransaccion.commit();
    return productosCreados;
  } catch (error) {
    await conexionTransaccion.rollback();
    throw error;
  } finally {
    conexionTransaccion.release();
  }
};

//se actualiza un producto, si hay una imagen nueva se actualiza la url de la imagen, si no se mantiene la anterior
const actualizarProducto = async (id, { categoria_id, categoria, nombre, descripcion, precio, urlImagen }) => {
  const [categorias] = await conexion.query(
    "SELECT id FROM categorias WHERE nombre = ?",
    [categoria]
  );
  const categoriaId = categoria_id || categorias[0]?.id;
  if (!categoriaId) {
    throw new Error(`La categoría "${categoria}" no existe`);
  }
if (urlImagen) {
  //si hay una imaagen nueva, actualizamos todo incluyendo la foto
  await conexion.query(
    `UPDATE productos SET categoria_id = ?, nombre = ?, descripcion = ?, precio = ?, url_imagen = ? WHERE id = ?`,
    [categoriaId, nombre, descripcion, precio, urlImagen, id]
  );
} else {
  await conexion.query(
    `UPDATE productos SET categoria_id = ?, nombre = ?, descripcion = ?, precio = ? WHERE id = ?`,
    [categoriaId, nombre, descripcion, precio, id]
  );
  }
};
//se actualiza la disponibilidad de un producto
const actualizarDisponibilidad = async (id, disponible) => {
  await conexion.query(`UPDATE productos SET disponible = ? WHERE id = ?`, [disponible, id]);
};
//elimina el producto de la base de datos
const eliminarProducto = async (id) => {
  await conexion.query(`DELETE FROM productos WHERE id = ?`, [id]);
};

module.exports = {
  obtenerMenuCompleto,
  crearProducto,
  crearProductos,
  actualizarProducto,
  actualizarDisponibilidad,
  eliminarProducto,
};