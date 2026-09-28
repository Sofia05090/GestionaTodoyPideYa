//se importa el repositorio del menu para interactuar con la base de datos
// esta la logica de cada endpoint del menu, como obtener el menu completo, agregar un producto, cambiar la disponibilidad y eliminar un producto
const menuRepositorio = require("./menu.repositorio");

//GET /api/menu devuelve todos los productos 
const obtenerMenu = async (req, res) => {
  try {
    const productos = await menuRepositorio.obtenerMenuCompleto();
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener el menú:", error);
    res.status(500).json({ error: "Error al obtener el menú" });
  }
};

//POST /api/menu agrega un nuevo producto con imagen al menu 
const agregarProducto = async (req, res) => {
  try {
    // si subieron una imagen, se guarda la ruta de la imagen en la base de datos
    
    const urlImagen = req.file
    ? `/uploads/platos/${req.file.filename}`
      : "";
    const id = await menuRepositorio.crearProducto({ ...req.body, urlImagen });
    res.status(201).json({ id, ...req.body, urlImagen });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
};

//POST /api/menu/lote agrega varios productos en una transacción
const agregarProductos = async (req, res) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: "Se requiere una lista de productos no vacía" });
  }

  try {
    const productos = await menuRepositorio.crearProductos(req.body);
    res.status(201).json({ insertados: productos.length, productos });
  } catch (error) {
    console.error("Error al agregar los productos:", error);
    const esCategoriaInexistente = error.message.startsWith("La categoría indicada no existe:");
    res.status(esCategoriaInexistente ? 400 : 500).json({ error: error.message });
  }
};

//PUT /api/menu/:id edita todos los campos de un producto, incluyendo la imagen
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const urlImagen = req.file
      ? `/uploads/platos/${req.file.filename}`
      : null;
    await menuRepositorio.actualizarProducto(id, { ...req.body, urlImagen });
    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};


//PATCH /api/menu/:id/disponibilidad cambia la disponibilidad de un producto
const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;
    await menuRepositorio.actualizarDisponibilidad(id, disponible);
    res.json({ mensaje: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    res.status(500).json({ error: "Error al actualizar disponibilidad" });
  }
};

//DELETE /api/menu/:id elimina un producto del menu
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await menuRepositorio.eliminarProducto(id);
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

module.exports = {
  obtenerMenu,
  agregarProducto,
  agregarProductos,
  actualizarProducto,
  cambiarDisponibilidad,
  eliminarProducto,
};