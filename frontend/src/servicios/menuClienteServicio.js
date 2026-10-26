// servicio del menú para el cliente
// se conecta al backend para traer los platos y las categorias del menu
// no necesita token de autenticación porque el menu es publico
const API_URL = "http://localhost:5000/api/menu";

//funcion que convierte al formato que esperan los componentes de React
function adaptarProducto(plato) {
  return {
    id: plato.id,
    nombre: plato.nombre,
    descripcion: plato.descripcion ?? "",
    precio: Number(plato.precio),
    categoria: plato.categoria ?? "Sin categoría",
    disponible: Boolean(plato.disponible),
    imagen: plato.imagen_url ?? plato.imagen ?? null,
    ingredientes: plato.ingredientes ?? [],
    tiempoPreparacion: plato.tiempo_preparacion ?? null,
  };
}
// funcion para obtener los productos del menú desde la API
export async function obtenerProductos() {
  const respuesta = await fetch(API_URL);
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.mensaje || "No se pudo cargar el menú");
}
  const datos = await respuesta.json();
  return datos.map(adaptarProducto);
}

// funcion para obtener las categorias de los productos del menú
export async function obtenerCategorias() {
  const productos = await obtenerProductos();
  return [...new Set(productos.map((producto) => producto.categoria))];
}