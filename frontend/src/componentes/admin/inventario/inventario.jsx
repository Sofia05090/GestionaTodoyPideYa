import { useEffect, useState } from "react";
import { Search, Plus, Minus, Pencil, Trash2 } from "lucide-react";
import {
  obtenerInventario,
  actualizarStock,
  eliminarInsumo,
  crearInsumo,
  actualizarInsumo,
} from "../../../servicios/inventarioServicio";
// IMPORTAMOS EL SELECTOR PERSONALIZADO PARA QUE SE VEA COMO EN TU DISEÑO
import SelectorDesplegable from "../../compartido/ui/SelectorDesplegable";
// IMPORTAMOS EL BOTON PRIMARIO PARA QUE SE VEA IGUAL AL DE GESTION DE MENU
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import "./Inventario.css";

export default function Inventario() {
  const [insumos, setInsumos] = useState([]); // Guarda la lista de insumos
  const [busqueda, setBusqueda] = useState(""); // Guarda el texto del buscador
  const [filtro, setFiltro] = useState("Todos"); // Guarda el filtro de estado seleccionado
  const [modalAbierto, setModalAbierto] = useState(false); // Controla la visibilidad del modal
  const [insumoEditando, setInsumoEditando] = useState(null); // Guarda el insumo a editar (null si es nuevo)

  //estado que maneja los datos del formulario dentro del modal
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "General",
    proveedor: "",
    cantidad_actual: 0,
    unidad_medida: "kg",
    stock_minimo: 0,
  });

  //función para obtener los datos desde el backend y actualizar la tabla
  const cargarDatos = async () => {
    try {
      const data = await obtenerInventario();
      setInsumos(data);
    } catch (error) {
      console.error("Error al cargar los insumos:", error);
    }
  };

  //hook que se ejecuta una sola vez al cargar el componente para traer los datos
  useEffect(() => {
    let activo = true;

    obtenerInventario()
      .then((data) => {
        if (activo) setInsumos(data);
      })
      .catch((error) => {
        if (activo) console.error("Error al cargar los insumos:", error);
      });

    return () => {
      activo = false;
    };
  }, []);

  //función para aumentar o disminuir el stock desde los botones + y -
  const manejarStock = async (id, cantidadActual, cambio) => {
    //se asegura de que la cantidad nunca sea negativa
    const nuevaCantidad = Math.max(0, Number(cantidadActual) + cambio);

    //actualización optimista: actualiza la pantalla de inmediato para dar sensación de rapidez
    setInsumos(
      insumos.map((i) =>
        i.id === id
          ? {
              ...i,
              cantidad_actual: nuevaCantidad,
              estado:
                nuevaCantidad === 0
                  ? "Agotado"
                  : nuevaCantidad <= i.stock_minimo
                    ? "Stock bajo"
                    : "Disponible",
            }
          : i,
      ),
    );

    //se envía el cambio al backend
    await actualizarStock(id, nuevaCantidad);
  };

  //función para eliminar un insumo, pidiendo confirmación previa
  const manejarEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este insumo?")) {
      await eliminarInsumo(id);
      cargarDatos(); // Recarga la tabla tras eliminar
    }
  };

  //función que se ejecuta al enviar el formulario del modal (Guardar)
  const guardarInsumo = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (insumoEditando) {
      await actualizarInsumo(insumoEditando.id, formData); // Si hay ID, es edición
    } else {
      await crearInsumo(formData); // Si no hay ID, es un insumo nuevo
    }
    setModalAbierto(false); // Cierra el modal
    cargarDatos(); // Recarga la tabla
  };

  //función para preparar el modal cuando se va a editar
  const abrirModalEdicion = (insumo) => {
    setInsumoEditando(insumo);
    // AQUÍ LIMPIAMOS LOS DECIMALES AL EDITAR
    setFormData({
      ...insumo,
      cantidad_actual: Number(insumo.cantidad_actual),
      stock_minimo: Number(insumo.stock_minimo),
    });
    setModalAbierto(true);
  };

  //función para preparar el modal cuando se va a crear
  const abrirModalCreacion = () => {
    setInsumoEditando(null);
    setFormData({
      nombre: "",
      categoria: "General",
      proveedor: "",
      cantidad_actual: 0,
      unidad_medida: "kg",
      stock_minimo: 0,
    });
    setModalAbierto(true);
  };

  //logica de filtrado y metricas

  //filtra los insumos según el buscador y el estado seleccionado
  const insumosFiltrados = insumos.filter((i) => {
    const coincideBusqueda =
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === "Todos" || i.estado === filtro;
    return coincideBusqueda && coincideFiltro;
  });

  //calculos para las tarjetas superiores
  const total = insumos.length;
  const disponibles = insumos.filter((i) => i.estado === "Disponible").length;
  const bajoStock = insumos.filter((i) => i.estado === "Stock bajo").length;
  const agotados = insumos.filter((i) => i.estado === "Agotado").length;

  return (
    <div className="inventario-container">
      {/*encabezado de la pagina */}
      <div className="inventario-header">
        <div>
          <h1>Inventario</h1>
          <p>Controla existencias, mínimos y proveedores del restaurante.</p>
        </div>

        {/* AQUÍ REEMPLAZAMOS EL BOTÓN NATIVO POR EL COMPONENTE BOTONPRIMARIO */}
        <BotonPrimario
          texto="+ Agregar Insumo"
          tipo="button"
          alHacer={abrirModalCreacion}
          ancho="auto"
        />
      </div>

      {/*tarjetas (metricas) */}
      <div className="inv-kpi-grid">
        <div className="inv-kpi-card">
          <div className="inv-kpi-texto">
            <p>Total de insumos</p>
            <h2>{total}</h2>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-texto">
            <p>Disponibles</p>
            <h2 className="text-green">{disponibles}</h2>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-texto">
            <p>Stock bajo</p>
            <h2 className="text-orange">{bajoStock}</h2>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-texto">
            <p>Agotados</p>
            <h2 className="text-red">{agotados}</h2>
          </div>
        </div>
      </div>

      {/*buscador y filtros */}
      <div className="filtros-container">
        <div className="buscador">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar insumo, categoría o proveedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* SELECTOR DESPLEGABLE PERSONALIZADO */}
        <SelectorDesplegable
          value={filtro}
          onChange={setFiltro}
          ariaLabel="Filtrar por estado"
          className="filtro-inventario"
          options={[
            { value: "Todos", label: "Todos los estados" },
            { value: "Disponible", label: "Disponible" },
            { value: "Stock bajo", label: "Stock bajo" },
            { value: "Agotado", label: "Agotado" },
          ]}
        />
      </div>

      {/*tabla de datos */}
      <div className="tabla-container">
        <h3>Existencias actuales</h3>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>INSUMO</th>
                <th>EXISTENCIAS</th>
                <th>ESTADO</th>
                <th>PROVEEDOR</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {insumosFiltrados.map((insumo) => (
                <tr key={insumo.id}>
                  <td>
                    <strong>{insumo.nombre}</strong>
                    <p className="subtexto">
                      {insumo.categoria} · Actualizado{" "}
                      {new Date(
                        insumo.ultima_actualizacion,
                      ).toLocaleDateString()}
                    </p>
                  </td>
                  <td>
                    <strong>
                      {Number(insumo.cantidad_actual)} {insumo.unidad_medida}
                    </strong>
                    <p className="subtexto">
                      Mínimo: {Number(insumo.stock_minimo)}{" "}
                      {insumo.unidad_medida}
                    </p>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${insumo.estado.replace(" ", "").toLowerCase()}`}
                    >
                      {insumo.estado}
                    </span>
                  </td>
                  <td>{insumo.proveedor}</td>
                  <td className="acciones">
                    <button
                      onClick={() =>
                        manejarStock(insumo.id, insumo.cantidad_actual, -1)
                      }
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      onClick={() =>
                        manejarStock(insumo.id, insumo.cantidad_actual, 1)
                      }
                    >
                      <Plus size={16} />
                    </button>
                    <button onClick={() => abrirModalEdicion(insumo)}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => manejarEliminar(insumo.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*modal para Crear/Editar */}
      {modalAbierto && (
        <div className="modal-fondo" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h2>{insumoEditando ? "Editar Insumo" : "Nuevo Insumo"}</h2>

            <form onSubmit={guardarInsumo}>
              <input
                type="text"
                placeholder="Nombre del insumo"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Categoría (Ej: Proteínas)"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Proveedor"
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
              />

              {/*fila para cantidad y unidad de medida */}
              <div className="modal-form-row">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cantidad"
                  required
                  value={formData.cantidad_actual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidad_actual: e.target.value,
                    })
                  }
                />

                <SelectorDesplegable
                  value={formData.unidad_medida}
                  onChange={(valor) =>
                    setFormData({ ...formData, unidad_medida: valor })
                  }
                  ariaLabel="Unidad de medida"
                  className="modal-selector-unidad"
                  options={[
                    { value: "kg", label: "kg" },
                    { value: "libras", label: "libras" },
                    { value: "unidades", label: "unidades" },
                    { value: "litros", label: "litros" },
                  ]}
                />
              </div>

              <input
                type="number"
                step="0.01"
                placeholder="Stock mínimo de alerta"
                required
                value={formData.stock_minimo}
                onChange={(e) =>
                  setFormData({ ...formData, stock_minimo: e.target.value })
                }
              />

              {/*botones del modal */}
              <div className="modal-form-row modal-botones">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
