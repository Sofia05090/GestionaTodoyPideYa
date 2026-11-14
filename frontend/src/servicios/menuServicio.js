//este archivo encapsula las llamadas http a la API del back usando fetch para obtener el menu, agregar un producto, cambiar la disponibilidad de un producto y eliminar un producto
import { obtenerToken } from "./authServicio";

//se define la URL base de la API del back
const API_URL = "/api/menu";
const encabezadosAdmin = (multipart = false) => ({
    ...(!multipart && { "Content-Type": "application/json" }),
    Authorization: `Bearer ${obtenerToken()}`,
});

const prepararProducto = (producto, imagen) => {
    if (!imagen) {
        return {
            headers: encabezadosAdmin(),
            body: JSON.stringify(producto),
        };
    }

    const formulario = new FormData();
    Object.entries(producto).forEach(([campo, valor]) => {
        formulario.append(campo, String(valor ?? ""));
    });
    formulario.append("imagen", imagen);

    return {
        headers: encabezadosAdmin(true),
        body: formulario,
    };
};
//se exportan las funciones para obtener el menu, agregar un producto, cambiar la disponibilidad de un producto y eliminar un producto
//cada funcion hace una llamada http a la API del back usando fetch y devuelve la respuesta en formato json, si la respuesta no es ok, lanza un error con un mensaje
export const obtenerMenu = async () => {
    const respuesta = await fetch(API_URL);
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al obtener el menú");
    return datos;
};

export const obtenerCategorias = async () => {
    const respuesta = await fetch(`${API_URL}/categorias`, { cache: "no-store" });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al obtener las categorías");
    return datos;
};

export const crearCategoria = async (nombre) => {
    const respuesta = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: encabezadosAdmin(),
        body: JSON.stringify({ nombre }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al crear la categoría");
    return datos;
};

export const actualizarCategoria = async (id, nombre) => {
    const respuesta = await fetch(`${API_URL}/categorias/${id}`, {
        method: "PUT",
        headers: encabezadosAdmin(),
        body: JSON.stringify({ nombre }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al actualizar la categoría");
    return datos;
};

export const eliminarCategoria = async (id, categoriaDestinoId) => {
    const respuesta = await fetch(`${API_URL}/categorias/${id}`, {
        method: "DELETE",
        headers: encabezadosAdmin(),
        body: JSON.stringify({ categoriaDestinoId }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al eliminar la categoría");
    return datos;
};
//se exporta la funcion para agregar un producto, que recibe un objeto producto con los datos del producto a agregar
export const crearProducto = async (producto, imagen) => {
    const respuesta = await fetch(API_URL, {
        method: "POST",
        ...prepararProducto(producto, imagen),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al agregar el producto");
    return datos;
};
//se exporta la funcion para cambiar la disponibilidad de un producto, que recibe el id del producto y un booleano disponible
export const cambiarDisponibilidad = async (id, disponible) => {
    const respuesta = await fetch(`${API_URL}/${id}/disponibilidad`, {
        method: "PATCH",
        headers: encabezadosAdmin(),
        body: JSON.stringify({ disponible }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al actualizar la disponibilidad del producto");
    return datos;
};
//se exporta la funcion para actualizar un producto, que recibe el id del producto y un objeto producto con los datos a actualizar
export const actualizarProducto = async (id, producto, imagen) => {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        ...prepararProducto(producto, imagen),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al actualizar el producto");
    return datos;
};
//se exporta la funcion para eliminar un producto, que recibe el id del producto
export const eliminarProducto = async (id) => {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${obtenerToken()}` },
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Error al eliminar el producto");
    return datos;
};
