// consulta a la tabla administradores
const conexion = require("../../configuracion/bd")

//busca un admin por correo para verificar sus credenciales al iniciar sesion
const buscarAdminPorCorreo = async (correo) => {
  const [filas] = await conexion.query(
    "SELECT id, nombre, correo, contrasena FROM administradores WHERE correo = ?",
    [correo]
  );
  // aqui devuelve el admin si existe, undefined si no se encontro
  return filas[0];
};

const crearAdmin = async (nombre, correo, contrasenaHash) => {
  const [resultado] = await conexion.query(
    "INSERT INTO administradores (nombre, correo, contrasena) VALUES (?, ?, ?)",
    [nombre, correo, contrasenaHash]
  );
  return resultado.insertId;
};

// endpoint para actualizar perfil del administrador, incluyendo nombre y correo
// actualizar los datos del administrador en la base de datos
const actualizarAdmin = async (id, nombre, correo) => {
  await conexion.query(
    "UPDATE administradores SET nombre = ?, correo = ? WHERE id = ?",
    [nombre, correo, id]
  );
};

// actualizar la contraseña del administrador en la base de datos
const actualizarContrasenaAdmin = async (id, contrasenaHash) => {
  await conexion.query(
    "UPDATE administradores SET contrasena = ? WHERE id = ?",
    [contrasenaHash, id]
  );
};
// se exporta las funciones para buscar, crear y actualizar administradores
module.exports = { buscarAdminPorCorreo, crearAdmin, actualizarAdmin, actualizarContrasenaAdmin };