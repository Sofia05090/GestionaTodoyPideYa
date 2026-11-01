//se importa la conexion a la base de datos
const conexion = require("../../configuracion/bd");

//obtiene todos los insumos ordenados alfabeticamente por nombre
const obtenerInsumos = async () => {
  const [filas] = await conexion.query("SELECT * FROM inventario ORDER BY nombre ASC");
  return filas;
};

//inserta un nuevo insumo en la base de datos
const crearInsumo = async (datos) => {
  const { nombre, categoria, proveedor, cantidad_actual, unidad_medida, stock_minimo } = datos;
  const [resultado] = await conexion.query(
    `INSERT INTO inventario (nombre, categoria, proveedor, cantidad_actual, unidad_medida, stock_minimo) VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, categoria, proveedor, cantidad_actual, unidad_medida, stock_minimo]
  );
  return resultado.insertId; // devuelve el ID del insumo recien creado
};

//actualiza todos los campos de un insumo existente
const actualizarInsumo = async (id, datos) => {
  const { nombre, categoria, proveedor, cantidad_actual, unidad_medida, stock_minimo } = datos;
  await conexion.query(
    `UPDATE inventario SET nombre=?, categoria=?, proveedor=?, cantidad_actual=?, unidad_medida=?, stock_minimo=? WHERE id=?`,
    [nombre, categoria, proveedor, cantidad_actual, unidad_medida, stock_minimo, id]
  );
};

//actualiza unicamente la cantidad 
const actualizarStock = async (id, cantidad_actual) => {
  await conexion.query(`UPDATE inventario SET cantidad_actual=? WHERE id=?`, [cantidad_actual, id]);
};

//elimina un insumo de la base de datos por su ID
const eliminarInsumo = async (id) => {
  await conexion.query(`DELETE FROM inventario WHERE id=?`, [id]);
};

//se exportan todas las funciones para que el controlador pueda usarlas
module.exports = { obtenerInsumos, crearInsumo, actualizarInsumo, actualizarStock, eliminarInsumo };