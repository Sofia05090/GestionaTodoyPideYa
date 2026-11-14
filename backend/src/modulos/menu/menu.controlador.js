//se importa el repositorio del menu para interactuar con la base de datos
// esta la logica de cada endpoint del menu, como obtener el menu completo, agregar un producto, cambiar la disponibilidad y eliminar un producto
const menuRepositorio = require("./menu.repositorio");
const { notificarCambioMenu } = require("./menu.eventos");
const { precioValido } = require("./menu.validaciones");

const obtenerIdCategoria = (valor) => {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const normalizarNombreCategoria = (nombre) =>
  nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const validarNombreCategoria = (req, res) => {
  const nombre = typeof req.body?.nombre === "string" ? req.body.nombre.trim() : "";
  if (!nombre) {
    res.status(400).json({ mensaje: "El nombre de la categoría es obligatorio" });
    return null;
  }
  if (nombre.length > 50) {
    res.status(400).json({ mensaje: "El nombre de la categoría no puede superar 50 caracteres" });
    return null;
  }
  if (normalizarNombreCategoria(nombre) === "todas") {
    res.status(400).json({ mensaje: "“Todas” está reservado para el filtro de categorías" });
    return null;
  }
  if (normalizarNombreCategoria(nombre) === "sin categoria") {
    res.status(400).json({
      mensaje: "“Sin categoría” se muestra en los platos que no tienen una categoría asignada",
    });
    return null;
  }
  return nombre;
};

const responderErrorCategoria = (res, error, accion) => {
  if (error.code === "CATEGORIA_NO_ENCONTRADA") {
    return res.status(404).json({ mensaje: error.message });
  }
  if (error.code === "CATEGORIA_DESTINO_INVALIDO") {
    return res.status(400).json({ mensaje: error.message });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      mensaje: "Ya existe una categoría con ese nombre",
    });
  }
  console.error(`Error al ${accion} la categoría:`, error);
  return res.status(500).json({ mensaje: `No se pudo ${accion} la categoría` });
};

const obtenerCategorias = async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(await menuRepositorio.obtenerCategorias());
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    res.status(500).json({ mensaje: "Error al obtener las categorías" });
  }
};

const crearCategoria = async (req, res) => {
  const nombre = validarNombreCategoria(req, res);
  if (!nombre) return;

  try {
    const id = await menuRepositorio.crearCategoria(nombre);
    notificarCambioMenu();
    res.status(201).json({ id, nombre, cantidadPlatos: 0 });
  } catch (error) {
    responderErrorCategoria(res, error, "crear");
  }
};

const actualizarCategoria = async (req, res) => {
  const id = obtenerIdCategoria(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El identificador de categoría no es válido" });
  const nombre = validarNombreCategoria(req, res);
  if (!nombre) return;

  try {
    await menuRepositorio.actualizarCategoria(id, nombre);
    notificarCambioMenu();
    res.json({ mensaje: "Categoría actualizada correctamente" });
  } catch (error) {
    responderErrorCategoria(res, error, "actualizar");
  }
};

const eliminarCategoria = async (req, res) => {
  const id = obtenerIdCategoria(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El identificador de categoría no es válido" });
  const categoriaDestinoId = obtenerIdCategoria(req.body?.categoriaDestinoId);
  if (!categoriaDestinoId) {
    return res.status(400).json({ mensaje: "Debes elegir una categoría de destino" });
  }

  try {
    const categoria = await menuRepositorio.eliminarCategoria(id, categoriaDestinoId);
    notificarCambioMenu();
    res.json({
      mensaje: `Categoría eliminada; los platos asociados pasaron a “${categoria.categoriaDestino}”`,
      categoriaDestino: categoria.categoriaDestino,
      platosReasignados: categoria.platosReasignados,
    });
  } catch (error) {
    responderErrorCategoria(res, error, "eliminar");
  }
};

//GET /api/menu devuelve todos los productos 
const obtenerMenu = async (req, res) => {
  try {
    const productos = await menuRepositorio.obtenerMenuCompleto();
    res.set("Cache-Control", "no-store");
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener el menú:", error);
    res.status(500).json({ error: "Error al obtener el menú" });
  }
};

//POST /api/menu agrega un nuevo producto con imagen al menu 
const agregarProducto = async (req, res) => {
  if (!precioValido(req.body.precio)) {
    return res.status(400).json({ mensaje: "El precio debe ser múltiplo de 1.000." });
  }

  try {
    // si subieron una imagen, se guarda la ruta de la imagen en la base de datos
    
    const urlImagen = req.file
      ? `/uploads/platos/${req.file.filename}`
      : req.body.urlImagen || "";
    const disponible = req.body.disponible !== false && req.body.disponible !== "false";
    const id = await menuRepositorio.crearProducto({ ...req.body, urlImagen, disponible });
    notificarCambioMenu();
    res.status(201).json({ id, ...req.body, urlImagen });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    const codigo = error.code === "CATEGORIA_NO_ENCONTRADA" ? 400 : 500;
    res.status(codigo).json({ mensaje: error.message || "Error al guardar el producto" });
  }
};

//POST /api/menu/lote agrega varios productos en una transacción
const agregarProductos = async (req, res) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: "Se requiere una lista de productos no vacía" });
  }
  if (req.body.some((producto) => !precioValido(producto.precio))) {
    return res.status(400).json({ mensaje: "Todos los precios deben ser múltiplos de 1.000." });
  }

  try {
    const productos = await menuRepositorio.crearProductos(req.body);
    notificarCambioMenu();
    res.status(201).json({ insertados: productos.length, productos });
  } catch (error) {
    console.error("Error al agregar los productos:", error);
    res.status(error.code === "CATEGORIA_NO_ENCONTRADA" ? 400 : 500).json({ error: error.message });
  }
};

//PUT /api/menu/:id edita todos los campos de un producto, incluyendo la imagen
const actualizarProducto = async (req, res) => {
  if (!precioValido(req.body.precio)) {
    return res.status(400).json({ mensaje: "El precio debe ser múltiplo de 1.000." });
  }

  try {
    const { id } = req.params;
    const urlImagen = req.file
      ? `/uploads/platos/${req.file.filename}`
      : req.body.urlImagen ?? null;
    await menuRepositorio.actualizarProducto(id, { ...req.body, urlImagen });
    notificarCambioMenu();
    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    const codigo = error.code === "CATEGORIA_NO_ENCONTRADA" ? 400 : 500;
    res.status(codigo).json({ mensaje: error.message || "Error al actualizar el producto" });
  }
};


//PATCH /api/menu/:id/disponibilidad cambia la disponibilidad de un producto
const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;
    await menuRepositorio.actualizarDisponibilidad(id, disponible);
    notificarCambioMenu();
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
    notificarCambioMenu();
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

module.exports = {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerMenu,
  agregarProducto,
  agregarProductos,
  actualizarProducto,
  cambiarDisponibilidad,
  eliminarProducto,
};