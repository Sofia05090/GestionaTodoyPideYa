//aqui se define la funcion para obtener los pedidos activos desde el backend, usando fetch y el token de autenticacion
import { obtenerToken } from "./authServicio";

const API_URL = "http://localhost:5000/api/pedidos";

export const crearPedidoQR = async (pedido) => {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "No se pudo crear el pedido.");
  return datos;
};

export const obtenerEstadoPedidoQR = async (id, tokenSeguimiento) => {
  const respuesta = await fetch(`${API_URL}/${id}/estado`, {
    headers: { Authorization: `Bearer ${tokenSeguimiento}` },
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || datos.mensaje || "No se pudo consultar el pedido.");
  return datos;
};

const encabezadosAdmin = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${obtenerToken()}`,
});

export const obtenerPedidosActivos = async () => {
  const respuesta = await fetch(`${API_URL}/activos`, {
    headers: encabezadosAdmin(),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok)
    throw new Error(datos.error || datos.mensaje || "No se pudieron cargar los pedidos.");
  return datos;
};

export const obtenerHistorialPedidos = async () => {
  const respuesta = await fetch(`${API_URL}/historial`, {
    headers: encabezadosAdmin(),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok)
    throw new Error(datos.error || datos.mensaje || "No se pudo cargar el historial.");
  return datos;
};

export const obtenerPedidosRecientes = async () => {
  const respuesta = await fetch(`${API_URL}/recientes`, {
    headers: encabezadosAdmin(),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok)
    throw new Error(datos.error || datos.mensaje || "No se pudieron cargar los pedidos recientes.");
  return datos;
};

export const obtenerEstadisticasPedidos = async () => {
  const respuesta = await fetch(`${API_URL}/estadisticas`, {
    headers: encabezadosAdmin(),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok)
    throw new Error(datos.error || datos.mensaje || "No se pudieron cargar las estadísticas.");
  return datos;
};

export const actualizarEstadoPedido = async (id, nuevoEstado) => {
  const respuesta = await fetch(`${API_URL}/${id}/estado`, {
    method: "PATCH",
    headers: encabezadosAdmin(),
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok)
    throw new Error(datos.error || datos.mensaje || "No se pudo actualizar el estado del pedido.");
  return datos;
};
