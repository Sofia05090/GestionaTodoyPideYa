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

const notificarCambioSoporte = (numeroWhatsapp) => {
  const evento = `event: soporte-actualizado\ndata: ${JSON.stringify({ numeroWhatsapp })}\n\n`;
  clientes.forEach((cliente) => {
    if (cliente.destroyed || cliente.writableEnded) {
      clientes.delete(cliente);
      return;
    }
    try {
      cliente.write(evento);
    } catch (error) {
      clientes.delete(cliente);
      console.error("No se pudo notificar a un cliente del cambio de soporte:", error);
    }
  });
};

module.exports = { conectarCliente, notificarCambioSoporte };
