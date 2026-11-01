const clientes = new Set();

const conectarCliente = (_req, res) => {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  res.write("retry: 3000\n\n");

  clientes.add(res);

  const intervalo = setInterval(() => {
    if (!res.destroyed && !res.writableEnded) {
      res.write(": mantener conexión\n\n");
    }
  }, 25000);

  res.on("close", () => {
    clearInterval(intervalo);
    clientes.delete(res);
  });
};

const notificarCambioMenu = () => {
  const evento = `event: menu-actualizado\ndata: ${Date.now()}\n\n`;
  clientes.forEach((cliente) => {
    if (cliente.destroyed || cliente.writableEnded) {
      clientes.delete(cliente);
      return;
    }
    cliente.write(evento);
  });
};

module.exports = { conectarCliente, notificarCambioMenu };
