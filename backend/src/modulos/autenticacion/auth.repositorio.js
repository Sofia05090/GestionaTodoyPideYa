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

module.exports = { buscarAdminPorCorreo, crearAdmin };