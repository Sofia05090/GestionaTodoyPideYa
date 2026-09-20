//este archivo encapsula las llamadas http a la API del back usando fetch para obtener el menu, agregar un producto, cambiar la disponibilidad de un producto y eliminar un producto
//se define la URL base de la API del back
const API_URL = "http://localhost:5000/api/menu";
//se exportan las funciones para obtener el menu, agregar un producto, cambiar la disponibilidad de un producto y eliminar un producto
//cada funcion hace una llamada http a la API del back usando fetch y devuelve la respuesta en formato json, si la respuesta no es ok, lanza un error con un mensaje
export const obtenerMenu = async () => {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("Error al obtener el menú");
    return await respuesta.json();
};
//se exporta la funcion para agregar un producto, que recibe un objeto producto con los datos del producto a agregar
export const agregarProducto = async (producto) => {
    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"},
            body: JSON.stringify(producto),
        });
    if (!respuesta.ok) throw new Error("Error al agregar el producto");
    return await respuesta.json();
};
//
export const cambiarDisponibilidad = async (id, disponible) => {
    const respuesta = await fetch(`${API_URL}/${id}/disponibilidad`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",},
        body: JSON.stringify({ disponible }),
    });
    if (!respuesta.ok) throw new Error("Error al actualizar la disponibilidad del producto");
    return await respuesta.json();
};

export const eliminarProducto = async (id) => {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
    if (!respuesta.ok) throw new Error("Error al eliminar el producto");
    return await respuesta.json();
};