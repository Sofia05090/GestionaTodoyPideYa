// servicio de pedidos del cliente.
// conectado a la api del back
// Endpoints públicos a acordar con el backend (el servidor debe calcular el total
// con los precios de la base de datos, sin confiar en el que mande el cliente):
//   POST  /api/pedidos             crearOrden es publico, no requiere token de autenticación
//   GET   /api/pedidos/:id/estado       obtenerOrden con token de autenticación (el cliente solo puede ver su propio pedido)
//   PATCH /api/pedidos/:id         actualizarOrden con token de autenticación (solo si está "pending")

const API_URL = "http://localhost:5000/api/pedidos";

const CLAVE_TOKEN = "pedidoToken"; // clave para guardar el token en localStorage

// Mismos valores de estado que usa el dashboard del admin
export const ETIQUETAS_ESTADO = {
  pending: "En espera",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
};

//guarda el token en localstorage para poder consultar el pedido despues de recargar la pagina
function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch (error) {
  }
}

//lee el token guardado, devuelve null si no existe
function leerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

//se convierte el formato que esperan los componentes de react
function adaptarOrden(datos) {
  return {
    id: String(datos.id ?? datos.pedido?.id),
    mesa: datos.mesa ?? datos.pedido?.mesa ?? "",
    items: (datos.items ?? datos.pedido?.items ?? []).map((item) => ({
      id: item.plato_id ?? item.id,
      nombre: item.nombre_plato ?? item.nombre,
      precio: number(item.precio_venta ?? item.precio),
      cantidad: (item.cantidad),
    })),
    notas: datos.notas ?? datos.pedido?.notas ?? "",
    total: number(datos.total ?? datos.pedido?.total ?? 0),
    estado: datos.estado ?? datos.pedido?.estado ?? "pending",
    creadoEn: datos.creado_en ?? datos.pedido?.creado_en ?? new Date().toISOString(),
  };
}
// se crea un nuevo pedido en el back
// recibe la mesa, la lista de items del carrito y las notas de la cocina
// el back valida los precios con la base de datos y al terminar guarda el token y devuelve el pedido creado
export async function crearOrden({mesa, items, notas = ""}) {
  if (!items || items.length === 0) throw new Error("El pedido no tiene platos");
// manda el id del plato y la cantidad; el precio lo calcula el back
  const cuerpo = {
    mesa: mesa || null,
    notas,
    items: items.map((item) => ({
      plato_id: item.id,
      cantidad: item.cantidad,
    })),
  };

  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error (datos.error || datos.mensaje || "no se pudo crear el pedido");
  //el back devuelve y guarda el token para consultar el estado despues
  if (datos.token) guardarToken(datos.token);

  return adaptarOrden(datos.pedido ?? datos);
}
//consulta el estado actual de un pedido por su id
//envia el token en el header si esta disponible
export async function obtenerOrden(id) {
  const token = leerToken();
  const cabeceras = token ? { "Authorization": `Bearer ${token}` } : {};
  const respuesta = await fetch(`${API_URL}/${id}`, { headers: cabeceras });
  const datos = await respuesta.json();
if (!respuesta.ok) throw new Error (datos.error || datos.mensaje || "no encontramos ese pedido");

return adaptarOrden(datos);
}
//edita el pedido existente, funciona mientras el pedido este en estado (en espera), si ya paso a preparando el back rechaza el cambio
export async function actualizarOrden(id, {items, notas}) {
  if (!items || items.length === 0) throw new Error("El pedido no se pude quedar vacio");

  const token = leerToken();
  const cabeceras = {
    "Content-Type": "application/json",
    ...API_URL(token ? {Authorization: `Bearer ${token}`}:{}),
  };

  const cuerpo = {
    notas,
    items: items.map((item) => ({
      plato_id: item.id,
      cantidad: item.cantidad,
    })),
  };
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: cabeceras,
    body: JSON.stringify(cuerpo),
  });
 
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.error || datos.mensaje || "No se pudieron guardar los cambios.");
  }
  return adaptarOrden(datos.pedido ?? datos);
}