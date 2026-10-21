// [PORTABLE] Lógica pura del carrito: sin JSX, sin React, sin APIs del navegador.
// Cada ítem tiene la forma: { id, nombre, precio, cantidad }

export function agregarItem(items, producto) {
  const existente = items.find((item) => item.id === producto.id);

  if (existente) {
    return items.map((item) =>
      item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
    );
  }

  return [
    ...items,
    { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 },
  ];
}

export function cambiarCantidad(items, id, cantidad) {
  if (cantidad <= 0) return eliminarItem(items, id);
  return items.map((item) => (item.id === id ? { ...item, cantidad } : item));
}

export function eliminarItem(items, id) {
  return items.filter((item) => item.id !== id);
}

export function calcularTotal(items) {
  return items.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);
}

export function calcularCantidadTotal(items) {
  return items.reduce((acumulado, item) => acumulado + item.cantidad, 0);
}

export function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}