//se importa el modulo de conexión a la base de datos que se encuentra en la carpeta de configuracion
//se importan los datos de la db desde el archivo configuracion para poder acceder desde cualquier archivo del proyecto
const conexion = require("../../configuracion/bd");

const crearErrorCategoria = (mensaje, codigo) =>
  Object.assign(new Error(mensaje), { code: codigo });

const resolverCategoriaId = async (conexionActual, categoriaIdRecibida, categoriaNombre) => {
  if (categoriaIdRecibida === undefined || categoriaIdRecibida === null || categoriaIdRecibida === "") {
    const nombre = typeof categoriaNombre === "string" ? categoriaNombre.trim() : "";
    if (!nombre) return null;

    const [filas] = await conexionActual.query(
      "SELECT id FROM categorias WHERE nombre = ?",
      [nombre]
    );
    if (!filas.length) {
      throw crearErrorCategoria("La categoría indicada no existe", "CATEGORIA_NO_ENCONTRADA");
    }
    return filas[0].id;
  }

  const id = Number(categoriaIdRecibida);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw crearErrorCategoria("La categoría indicada no existe", "CATEGORIA_NO_ENCONTRADA");
  }

  const [filas] = await conexionActual.query(
    "SELECT id FROM categorias WHERE id = ?",
    [id]
  );
  if (!filas.length) {
    throw crearErrorCategoria("La categoría indicada no existe", "CATEGORIA_NO_ENCONTRADA");
  }
  return filas[0].id;
};

const obtenerCategorias = async () => {
  const [filas] = await conexion.query(`
    SELECT c.id, c.nombre, COUNT(p.id) AS cantidadPlatos
    FROM categorias c
    LEFT JOIN productos p ON p.categoria_id = c.id
    GROUP BY c.id, c.nombre
    ORDER BY c.nombre
  `);
  return filas.map((categoria) => ({
    ...categoria,
    cantidadPlatos: Number(categoria.cantidadPlatos),
  }));
};

const crearCategoria = async (nombre) => {
  const [resultado] = await conexion.query(
    "INSERT INTO categorias (nombre) VALUES (?)",
    [nombre]
  );
  return resultado.insertId;
};

const actualizarCategoria = async (id, nombre) => {
  const [resultado] = await conexion.query(
    "UPDATE categorias SET nombre = ? WHERE id = ?",
    [nombre, id]
  );
  if (!resultado.affectedRows) {
    const [filas] = await conexion.query(
      "SELECT id FROM categorias WHERE id = ?",
      [id]
    );
    if (!filas.length) {
      throw crearErrorCategoria("La categoría no existe", "CATEGORIA_NO_ENCONTRADA");
    }
  }
};

const eliminarCategoria = async (id, categoriaDestinoId) => {
  const conexionTransaccion = await conexion.getConnection();
  try {
    await conexionTransaccion.beginTransaction();
    const [filasCategoria] = await conexionTransaccion.query(
      "SELECT id, nombre FROM categorias WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!filasCategoria.length) {
      throw crearErrorCategoria("La categoría no existe", "CATEGORIA_NO_ENCONTRADA");
    }
    if (Number(filasCategoria[0].id) === Number(categoriaDestinoId)) {
      throw crearErrorCategoria(
        "Debes elegir una categoría distinta a la que vas a eliminar",
        "CATEGORIA_DESTINO_INVALIDO"
      );
    }

    const [filasDestino] = await conexionTransaccion.query(
      "SELECT id, nombre FROM categorias WHERE id = ? FOR UPDATE",
      [categoriaDestinoId]
    );
    if (!filasDestino.length) {
      throw crearErrorCategoria(
        "La categoría de destino no existe",
        "CATEGORIA_DESTINO_INVALIDO"
      );
    }

    const [productosReasignados] = await conexionTransaccion.query(
      "UPDATE productos SET categoria_id = ? WHERE categoria_id = ?",
      [filasDestino[0].id, id]
    );
    await conexionTransaccion.query(
      "DELETE FROM categorias WHERE id = ?",
      [id]
    );
    await conexionTransaccion.commit();
    return {
      ...filasCategoria[0],
      categoriaDestino: filasDestino[0].nombre,
      platosReasignados: productosReasignados.affectedRows,
    };
  } catch (error) {
    await conexionTransaccion.rollback();
    throw error;
  } finally {
    conexionTransaccion.release();
  }
};

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
    LEFT JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.id DESC
  `);
  return filas;
};

//se inserta un producto con una categoría existente o sin categoría
const crearProducto = async ({ categoria_id, categoria, nombre, descripcion, precio, urlImagen, disponible = true }) => {
  const categoriaId = await resolverCategoriaId(conexion, categoria_id, categoria);

  const [resultado] = await conexion.query(
    `INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES (?, ?, ?, ?, ?, ?)`,
    [categoriaId, nombre, descripcion, precio, urlImagen || "", disponible]
  );
  return resultado.insertId;
};

const crearProductos = async (productos) => {
  const conexionTransaccion = await conexion.getConnection();
  const productosCreados = [];

  try {
    await conexionTransaccion.beginTransaction();

    for (const producto of productos) {
      const categoriaId = await resolverCategoriaId(
        conexionTransaccion,
        producto.categoria_id,
        producto.categoria
      );

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
  const categoriaId = await resolverCategoriaId(conexion, categoria_id, categoria);
  if (urlImagen !== null && urlImagen !== undefined) {
    //Si se envió una imagen o una URL vacía, actualizamos también la imagen.
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
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerMenuCompleto,
  crearProducto,
  crearProductos,
  actualizarProducto,
  actualizarDisponibilidad,
  eliminarProducto,
};