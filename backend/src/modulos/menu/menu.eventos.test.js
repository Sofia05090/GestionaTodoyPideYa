const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { test } = require("node:test");
const { conectarCliente, notificarCambioMenu } = require("./menu.eventos");

test("notifica a clientes conectados y los elimina al cerrar la respuesta", () => {
  const solicitud = new EventEmitter();
  const respuesta = new EventEmitter();
  const mensajes = [];

  respuesta.destroyed = false;
  respuesta.writableEnded = false;
  respuesta.status = (codigo) => {
    assert.equal(codigo, 200);
    return respuesta;
  };
  respuesta.set = (cabeceras) => {
    assert.equal(cabeceras["Content-Type"], "text/event-stream");
    return respuesta;
  };
  respuesta.flushHeaders = () => {};
  respuesta.write = (mensaje) => mensajes.push(mensaje);

  conectarCliente(solicitud, respuesta);
  notificarCambioMenu();
  assert.ok(mensajes.some((mensaje) => mensaje.includes("event: menu-actualizado")));

  respuesta.emit("close");
  const cantidadMensajesTrasCerrar = mensajes.length;
  notificarCambioMenu();
  assert.equal(mensajes.length, cantidadMensajesTrasCerrar);
});
