//se recibe las peticiones del frontend, valida los datos y devuelve la respuesta
//se importa el repositorio para hacer las consultas SQL
const repo = require("./inventario.repositorio");

//calcula el estado visual (Disponible, Stock bajo, Agotado) comparando la cantidad con el minimo
const calcularEstado = (actual, minimo) => {
  if (Number(actual) === 0) return "Agotado";
  if (Number(actual) <= Number(minimo)) return "Stock bajo";
  return "Disponible";
};

//controlador para obtener todo el inventario
const obtenerInventario = async (_req, res) => {
  try {
    const insumos = await repo.obtenerInsumos();
    const insumosConEstado = insumos.map(insumo => ({
      ...insumo,
      estado: calcularEstado(insumo.cantidad_actual, insumo.stock_minimo)
    }));
    res.json(insumosConEstado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener inventario" });
  }
};

//controlador para crear un nuevo insumo
const crearInsumo = async (req, res) => {
  try {
    const id = await repo.crearInsumo(req.body);
    res.status(201).json({ id, ...req.body }); // 201 significa "Creado exitosamente"
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear insumo" });
  }
};

//controlador para actualizar un insumo completo
const actualizarInsumo = async (req, res) => {
  try {
    await repo.actualizarInsumo(req.params.id, req.body);
    res.json({ mensaje: "Insumo actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar insumo" });
  }
};

//controlador para actualizar solo el stock 
const actualizarStock = async (req, res) => {
  try {
    const { cantidad_actual } = req.body;
    await repo.actualizarStock(req.params.id, cantidad_actual);
    res.json({ mensaje: "Stock actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
};

//controlador para eliminar un insumo
const eliminarInsumo = async (req, res) => {
  try {
    await repo.eliminarInsumo(req.params.id);
    res.json({ mensaje: "Insumo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar insumo" });
  }
};

//se exportan los controladores para que las rutas los usen
module.exports = { obtenerInventario, crearInsumo, actualizarInsumo, actualizarStock, eliminarInsumo };