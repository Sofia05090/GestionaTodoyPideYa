import { obtenerToken } from "./authServicio";

const API_URL = "/api/soporte";

export const obtenerNumeroWhatsappSoporte = async () => {
  const respuesta = await fetch(API_URL, { cache: "no-store" });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo cargar el número de soporte");
  }
  return datos.numeroWhatsapp || "";
};

export const guardarNumeroWhatsappSoporte = async (numeroWhatsapp) => {
  const respuesta = await fetch(`${API_URL}/whatsapp`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({ numeroWhatsapp }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo guardar el número de WhatsApp");
  }
  return datos.numeroWhatsapp || "";
};

export const escucharCambiosSoporte = (alCambiar) => {
  const eventos = new EventSource(`${API_URL}/eventos`);
  eventos.addEventListener("soporte-actualizado", (evento) => {
    try {
      const datos = JSON.parse(evento.data);
      alCambiar(datos.numeroWhatsapp || "");
    } catch (error) {
      console.error("No se pudo interpretar la actualización del canal de soporte:", error);
    }
  });
  return () => eventos.close();
};
