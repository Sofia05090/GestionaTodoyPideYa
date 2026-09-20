// Arranca el servidor usando el puerto definido en las variables de entorno.
const app = require("./app");

app.listen(app.get("PUERTO") || 5000, () => {
  console.log("Servidor corriendo en el puerto", app.get("PUERTO"));
});