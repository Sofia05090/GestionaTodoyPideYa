const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const ARCHIVO_CONFIGURACION =
  process.env.ARCHIVO_CONFIGURACION_SOPORTE ||
  path.join(__dirname, "../../../datos-soporte/configuracion.json");
const FORMATO = "gestiona-todo-y-pide-ya-soporte";
const VERSION = 1;
const FORMATO_NUMERO_LOCAL = /^\d{10}$/;

const leerConfiguracion = async () => {
  let contenido;
  try {
    contenido = await fs.readFile(ARCHIVO_CONFIGURACION, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }

  let configuracion;
  try {
    configuracion = JSON.parse(contenido);
  } catch (error) {
    throw new Error(`El archivo de soporte no contiene JSON válido: ${error.message}`);
  }

  const numeroValido =
    configuracion?.numeroWhatsapp === null ||
    (typeof configuracion?.numeroWhatsapp === "string" &&
      FORMATO_NUMERO_LOCAL.test(configuracion.numeroWhatsapp));
  if (
    configuracion?.formato !== FORMATO ||
    configuracion?.version !== VERSION ||
    !numeroValido
  ) {
    throw new Error("El archivo de soporte tiene un formato o una versión no reconocidos.");
  }

  return configuracion;
};

const obtenerNumeroWhatsapp = async () => {
  const configuracion = await leerConfiguracion();
  return configuracion?.numeroWhatsapp ?? null;
};

const guardarNumeroWhatsapp = async (numeroWhatsapp) => {
  if (numeroWhatsapp !== null && !FORMATO_NUMERO_LOCAL.test(numeroWhatsapp)) {
    throw new Error("El número de WhatsApp no tiene un formato válido.");
  }

  const directorio = path.dirname(ARCHIVO_CONFIGURACION);
  const archivoTemporal = `${ARCHIVO_CONFIGURACION}.${process.pid}.${randomUUID()}.tmp`;
  const configuracion = {
    formato: FORMATO,
    version: VERSION,
    numeroWhatsapp,
  };

  await fs.mkdir(directorio, { recursive: true });
  try {
    await fs.writeFile(archivoTemporal, `${JSON.stringify(configuracion, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await fs.rename(archivoTemporal, ARCHIVO_CONFIGURACION);
  } catch (error) {
    try {
      await fs.unlink(archivoTemporal);
    } catch (errorLimpieza) {
      if (errorLimpieza.code !== "ENOENT") {
        console.error("No se pudo limpiar el archivo temporal de soporte:", errorLimpieza);
      }
    }
    throw error;
  }
};

module.exports = {
  obtenerNumeroWhatsapp,
  guardarNumeroWhatsapp,
};
