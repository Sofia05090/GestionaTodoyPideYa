const soporteRepositorio = require("./soporte.repositorio");
const { notificarCambioSoporte } = require("./soporte.eventos");

const obtenerConfiguracion = async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json({ numeroWhatsapp: await soporteRepositorio.obtenerNumeroWhatsapp() });
  } catch (error) {
    console.error("Error al obtener la configuración de soporte:", error);
    res.status(500).json({ mensaje: "No se pudo obtener el canal de soporte" });
  }
};

const guardarNumeroWhatsapp = async (req, res) => {
  const numeroRecibido =
    typeof req.body?.numeroWhatsapp === "string" ? req.body.numeroWhatsapp.trim() : null;
  if (numeroRecibido === null) {
    return res.status(400).json({ mensaje: "Debes indicar un número de WhatsApp válido" });
  }

  let numeroWhatsapp = null;
  if (numeroRecibido) {
    if (/^\d{10}$/.test(numeroRecibido)) {
      numeroWhatsapp = numeroRecibido;
    } else if (/^\+57\d{10}$/.test(numeroRecibido)) {
      numeroWhatsapp = numeroRecibido.slice(3);
    } else {
      return res.status(400).json({
        mensaje: "El número debe tener 10 dígitos o incluir el prefijo +57 seguido de 10 dígitos",
      });
    }
  }

  try {
    await soporteRepositorio.guardarNumeroWhatsapp(numeroWhatsapp);
    notificarCambioSoporte(numeroWhatsapp);
    res.json({ mensaje: "Número de WhatsApp guardado", numeroWhatsapp });
  } catch (error) {
    console.error("Error al guardar el número de soporte:", error);
    res.status(500).json({ mensaje: "No se pudo guardar el número de WhatsApp" });
  }
};

module.exports = {
  obtenerConfiguracion,
  guardarNumeroWhatsapp,
};
