//se importa el repositorio del menu para interactuar con la base de datos
const menuRepositorio = require("./menu.repositorio");

const obtenerMenu = async (req, res) => {
  try {
    const productos = await menuRepositorio.obtenerMenuCompleto();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el menú" });
  }
};

const agregarProducto = async (req, res) => {
  try {
    const id = await menuRepositorio.crearProducto(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el producto" });
  }
};

const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;
    await menuRepositorio.actualizarDisponibilidad(id, disponible);
    res.json({ mensaje: "Estado actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar disponibilidad" });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await menuRepositorio.eliminarProducto(id);
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

module.exports = {
  obtenerMenu,
  agregarProducto,
  cambiarDisponibilidad,
  eliminarProducto
};