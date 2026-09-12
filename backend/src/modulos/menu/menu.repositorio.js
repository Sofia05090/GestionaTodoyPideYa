//se importa el modulo de conexión a la base de datos que se encuentra en la carpeta de configuracion
const conexion = require("../../configuracion/bd");

const obtenerMenuCompleto = async () => {
  const [filas] = await conexion.query(`
    SELECT p.id, p.nombre, p.descripcion, p.precio,
           c.nombre AS categoria,
           p.url_imagen AS imagen_url,
           p.disponible,
           p.creado_en
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.id DESC
  `);
  return filas;
};

const crearProducto = async ({ categoria_id, categoria, nombre, descripcion, precio, imagen_url, disponible = true }) => {
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
    [categoriaId, nombre, descripcion, precio, imagen_url || "", disponible]
  );
  return resultado.insertId;
};

const actualizarDisponibilidad = async (id, disponible) => {
  await conexion.query(`UPDATE productos SET disponible = ? WHERE id = ?`, [disponible, id]);
};

const eliminarProducto = async (id) => {
  await conexion.query(`DELETE FROM productos WHERE id = ?`, [id]);
};

module.exports = {
  obtenerMenuCompleto,
  crearProducto,
  actualizarDisponibilidad,
  eliminarProducto
};