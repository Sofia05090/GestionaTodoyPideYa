//se importa express, cors y el archivo de configuracion para poder acceder a las variables de entorno desde cualquier archivo del proyecto
const express = require("express");
const cors = require("cors");
const config = require("./config");
const app = express();
//importacion de las rutas de los modulos
const menuRutas = require("./modulos/menu/menu.rutas");

//middleware para que procese los datos en formato json y permitir el acceso desde react
app.use(cors());
app.use(express.json());


//se configura el puerto del servidor para escuchar las peticiones en el puerto 5000 en el archivo .env
app.set("PUERTO", config.app.PUERTO);

//rutas
app.use("/api/menu", menuRutas);
//se importa el objeto app para poder acceder a las rutas desde cualquier archivo del proyecto
module.exports = app;