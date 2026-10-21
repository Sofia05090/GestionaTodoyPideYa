// [PORTABLE] Servicio del menú para el cliente.
// [MOCK] Hoy devuelve datos de prueba. Cuando la API esté lista, solo se cambia
// el interior de obtenerProductos():
//
//   const API_URL = "http://localhost:5000/api/menu";
//   export async function obtenerProductos() {
//     const respuesta = await fetch(API_URL);
//     if (!respuesta.ok) throw new Error("Error al obtener el menú");
//     return await respuesta.json();
//   }

const productosPrueba = [
  { id: "1", nombre: "Bandeja Paisa", descripcion: "Frijoles, arroz, carne molida, chicharrón, huevo, plátano, arepa", precio: 25000, categoria: "Platos Principales", disponible: true },
  { id: "2", nombre: "Pechuga a la Plancha", descripcion: "Pechuga de pollo con ensalada y papas a la francesa", precio: 20000, categoria: "Platos Principales", disponible: true },
  { id: "3", nombre: "Moñona con Carne", descripcion: "Carne sudada con arroz, huevo frito y papas", precio: 15000, categoria: "Moñonas", disponible: true },
  { id: "4", nombre: "Moñona con Pollo", descripcion: "Pollo a la brasa con arroz, huevo frito y papas", precio: 17000, categoria: "Moñonas", disponible: true },
  { id: "5", nombre: "Sancocho de Gallina", descripcion: "Con arroz, aguacate y papa", precio: 18000, categoria: "Sopas y Caldos", disponible: true },
  { id: "6", nombre: "Caldo de Costilla", descripcion: "Costilla de res con papa y cilantro", precio: 14000, categoria: "Sopas y Caldos", disponible: true },
  { id: "7", nombre: "Limonada Natural", descripcion: "Limonada fresca de la casa", precio: 6000, categoria: "Bebidas", disponible: true },
  { id: "8", nombre: "Tinto", descripcion: "Cafe con o sin azucar", precio: 5000, categoria: "Bebidas", disponible: false },
];

export async function obtenerProductos() {
  return productosPrueba;
}

// Las categorías salen de los propios platos, así que no cambia al conectar la API
export async function obtenerCategorias() {
  const productos = await obtenerProductos();
  return [...new Set(productos.map((producto) => producto.categoria))];
}