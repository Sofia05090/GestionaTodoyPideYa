// [PORTABLE] Servicio de pedidos del cliente.
// [MOCK] Los pedidos viven en memoria (se pierden al recargar la página) y avanzan
// de estado solos para poder probar EstadoOrden.
//
// Endpoints públicos a acordar con el backend (el servidor debe calcular el total
// con los precios de la base de datos, sin confiar en el que mande el cliente):
//   POST  /api/pedidos            -> crearOrden
//   GET   /api/pedidos/:id        -> obtenerOrden
//   PATCH /api/pedidos/:id        -> actualizarOrden (solo si está "pending")

import { calcularTotal } from "./carritoServicio";

// Mismos valores de estado que usa el dashboard del admin
export const ETIQUETAS_ESTADO = {
  pending: "En espera",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
};

const ordenesPrueba = [];
let siguienteId = 1;

// [MOCK] Estado y milisegundos después de crear el pedido
const AVANCE_MOCK = [
  ["preparing", 8000],
  ["ready", 16000],
  ["delivered", 24000],
];

function copiar(orden) {
  return { ...orden, items: orden.items.map((item) => ({ ...item })) };
}

function buscar(id) {
  const orden = ordenesPrueba.find((o) => o.id === String(id));
  if (!orden) throw new Error("No encontramos ese pedido.");
  return orden;
}

export async function crearOrden({ mesa, items, notas = "" }) {
  if (!items || items.length === 0) throw new Error("El pedido no tiene platos.");

  const orden = {
    id: String(siguienteId++),
    mesa,
    items: items.map((item) => ({ ...item })),
    notas,
    total: calcularTotal(items),
    estado: "pending",
    creadoEn: new Date().toISOString(),
  };

  ordenesPrueba.push(orden);

  AVANCE_MOCK.forEach(([estado, milisegundos]) => {
    setTimeout(() => {
      orden.estado = estado;
    }, milisegundos);
  });

  return copiar(orden);
}

export async function obtenerOrden(id) {
  return copiar(buscar(id));
}

export async function actualizarOrden(id, { items, notas }) {
  const orden = buscar(id);

  if (orden.estado !== "pending") {
    throw new Error("Tu pedido ya está en preparación y no se puede editar.");
  }
  if (!items || items.length === 0) {
    throw new Error("El pedido no puede quedar vacío.");
  }

  orden.items = items.map((item) => ({ ...item }));
  orden.notas = notas;
  orden.total = calcularTotal(items);

  return copiar(orden);
}