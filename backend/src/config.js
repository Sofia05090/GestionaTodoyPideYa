//se configura la conexion a la base de datos, llamando las variables de entorno desde el archivo .env y importando el modulo dotenv y el path para poder acceder a las variables de entorno desde cualquier archivo del proyecto
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

module.exports = {
    app: {
        PUERTO: process.env.PUERTO || 5000,
        HOST_BD: process.env.HOST_BD || 'localhost',
        USUARIO_BD: process.env.USUARIO_BD || 'root',
        CONTRASENA_BD: process.env.CONTRASENA_BD,
        NOMBRE_BD: process.env.NOMBRE_BD || 'gestionatodopideya',
    },
};