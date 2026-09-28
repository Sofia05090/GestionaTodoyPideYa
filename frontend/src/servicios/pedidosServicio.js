import { obtenerToken } from "./authServicio";

const API_URL = "http://localhost:5000/api/pedidos";

export const obtenerPedidosActivos = async () => {
  const respuesta = await fetch(`${API_URL}/activos`, {
    headers: { Authorization: `Bearer ${obtenerToken()}` },
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudieron cargar los pedidos.");
  }

  return datos;
};
