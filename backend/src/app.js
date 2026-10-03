//se importa express, cors y el archivo de configuracion para poder acceder a las variables de entorno desde cualquier archivo del proyecto
const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const config = require("./config");
const app = express();

//importacion de las rutas de los modulos
const authRutas = require("./modulos/autenticacion/auth.rutas");
const menuRutas = require("./modulos/menu/menu.rutas");
const pedidosRutas = require("./modulos/pedidos/pedidos.rutas");

const limiteApi = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 300,
	standardHeaders: "draft-8",
	legacyHeaders: false,
});

const crearLimiteAutenticacion = () => rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: { mensaje: "Demasiados intentos. Intenta de nuevo más tarde." },
});

const limitePedidosQr = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: { mensaje: "Se alcanzó el límite de solicitudes de pedidos. Intenta más tarde." },
});

//middleware para que procese los datos en formato json y permitir el acceso desde react
app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use("/api", limiteApi);
app.use("/api/auth/login", crearLimiteAutenticacion());
app.use("/api/auth/registro", crearLimiteAutenticacion());
app.use("/api/pedidos", limitePedidosQr);


//se configura el puerto del servidor para escuchar las peticiones en el puerto 5000 en el archivo .env
app.set("PUERTO", config.app.PUERTO);

//rutas
app.use("/api/auth", authRutas);
app.use("/api/menu", menuRutas);
app.use("/api/pedidos", pedidosRutas);
//se importa el objeto app para poder acceder a las rutas desde cualquier archivo del proyecto
module.exports = app;