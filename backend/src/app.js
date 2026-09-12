//se importa express y el archivo de configuracion de la base de datos
const express = require("express");
const config = require("./config");
const app = express();
//se configura el puerto del servidor para escuchar las peticiones en el puerto 5000 en el archivo .env
app.set("PUERTO", config.app.PUERTO);
//se importa el objeto app para poder acceder a las rutas desde cualquier archivo del proyecto
module.exports = app;