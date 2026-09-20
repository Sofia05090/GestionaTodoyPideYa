// Se configura la conexion a la base de datos.
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const conexion = mysql.createPool({
    port: Number(process.env.PUERTO_BD) || 3306,
    host: process.env.HOST_BD,
    user: process.env.USUARIO_BD,
    password: process.env.CONTRASENA_BD,
    database: process.env.NOMBRE_BD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = conexion;