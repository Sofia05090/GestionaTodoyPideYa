// servicio de pedidos del cliente.
// conectado a la api del back
// Endpoints públicos a acordar con el backend (el servidor debe calcular el total
// con los precios de la base de datos, sin confiar en el que mande el cliente):
//   POST  /api/pedidos             crearOrden es publico, no requiere token de autenticación
//   GET   /api/pedidos/:id/estado       obtenerOrden con token de autenticación (el cliente solo puede ver su propio pedido)
//   PATCH /api/pedidos/:id         actualizarOrden con token de autenticación (solo si está "pending")

// Usamos una ruta relativa si estamos en producción (Hostinger) o localhost en desarrollo
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000/api/pedidos"
  : "/api/pedidos";

const CLAVE_TOKEN = "pedidoToken"; // clave para guardar el token en localStorage

// Mismos valores de estado que usa el dashboard del admin (Ahora soporta español e inglés)
export const ETIQUETAS_ESTADO = {
  pendiente: "En espera",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
  pending: "En espera",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
};

// Pequeña función auxiliar para convertir a número y evitar errores
const number = (valor) => Number(valor) || 0;

//guarda el token en localstorage para poder consultar el pedido despues de recargar la pagina
function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch (error) {
    console.error("No se pudo guardar el token del pedido:", error);
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
      id: item.producto_id ?? item.plato_id ?? item.id, 
      nombre: item.nombre_plato ?? item.nombre,
      precio: number(item.precio_venta ?? item.precio),
      cantidad: number(item.cantidad),
    })),
    notas: datos.notas ?? datos.pedido?.notas ?? "",
    total: number(datos.total ?? datos.pedido?.total ?? 0),
    estado: datos.estado ?? datos.pedido?.estado ?? "pendiente",
    metodo_pago: datos.metodo_pago ?? datos.pedido?.metodo_pago ?? "efectivo",
    creadoEn: datos.creado_en ?? datos.pedido?.creado_en ?? new Date().toISOString(),
  };
}

// se crea un nuevo pedido en el back
// recibe la mesa, la lista de items del carrito y las notas de la cocina
// el back valida los precios con la base de datos y al terminar guarda el token y devuelve el pedido creado
export async function crearOrden({mesa, items, notas = "", metodo_pago = "efectivo"}) {
  if (!items || items.length === 0) throw new Error("El pedido no tiene platos");
  
  // manda el id del plato y la cantidad; el precio lo calcula el back
  const cuerpo = {
    mesa: mesa || null,
    notas,
    metodo_pago,
    items: items.map((item) => ({
      producto_id: item.producto_id || item.id, 
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
  if (datos.tokenSeguimiento) guardarToken(datos.tokenSeguimiento);

  return adaptarOrden(datos);
}

//consulta el estado actual de un pedido por su id
//envia el token en el header si esta disponible
export async function obtenerOrden(id) {
  const token = leerToken();
  const cabeceras = token ? { "Authorization": `Bearer ${token}` } : {};
  
  // Ajustado para que apunte a la ruta correcta del backend (/:id/estado)
  const respuesta = await fetch(`${API_URL}/${id}/estado`, { headers: cabeceras });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error (datos.error || datos.mensaje || "no encontramos ese pedido");

  return adaptarOrden(datos);
}

//edita el pedido existente, funciona mientras el pedido este en estado (en espera), si ya paso a preparando el back rechaza el cambio
export async function actualizarOrden(id, {items, notas, metodo_pago}) {
  if (!items || items.length === 0) throw new Error("El pedido no se pude quedar vacio");

  const token = leerToken();
  const cabeceras = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const cuerpo = {
    notas,
    metodo_pago,
    items: items.map((item) => ({
      producto_id: item.producto_id || item.id,
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