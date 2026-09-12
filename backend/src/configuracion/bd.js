//Se configura la conexion a la base de datos
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const conexion = mysql.createPool({
    //se llama la variable de entorno para el host de la base de datos
    host: process.env.HOST_BD, 
    user: process.env.USUARIO_BD,
    password: process.env.CONTRASENA_BD,
    database: process.env.NOMBRE_BD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default conexion;