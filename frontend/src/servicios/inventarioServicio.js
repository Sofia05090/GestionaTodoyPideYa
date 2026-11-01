//se importa la función para obtener el token del administrador
import { obtenerToken } from "./authServicio";

//ruta relativa para que funcione en el servidor de Hostinger
const API_URL = "/api/inventario"; 

//función que prepara los encabezados con el token para autenticarse
const encabezadosAdmin = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${obtenerToken()}`,
});

//petición GET para traer los insumos
export const obtenerInventario = async () => {
  const respuesta = await fetch(API_URL, { headers: encabezadosAdmin() });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "Error al cargar inventario");
  return datos;
};

//petición POST para crear un insumo
export const crearInsumo = async (insumo) => {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: encabezadosAdmin(),
    body: JSON.stringify(insumo),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "Error al crear insumo");
  return datos;
};

//petición PUT para editar un insumo completo
export const actualizarInsumo = async (id, insumo) => {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: encabezadosAdmin(),
    body: JSON.stringify(insumo),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "Error al actualizar");
  return datos;
};

//petición PATCH para actualizar solo la cantidad 
export const actualizarStock = async (id, cantidad_actual) => {
  const respuesta = await fetch(`${API_URL}/${id}/stock`, {
    method: "PATCH",
    headers: encabezadosAdmin(),
    body: JSON.stringify({ cantidad_actual }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "Error al actualizar stock");
  return datos;
};

//petición DELETE para borrar un insumo
export const eliminarInsumo = async (id) => {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: encabezadosAdmin(),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "Error al eliminar");
  return datos;
};