// pantalla de gestion del menu
// se visualiza:
// LISTAR los platos desde Firestore en tarjetas
// FILTRAR por nombre (buscador) y categoria (selector)
// CRUD agregar, editar, cambiar disponibilidad del plato y eliminar
//  se usa el Hook useCamposFormulario maneja todos los campos del formulario con un solo useState en vez de uno por cada campo

import { useState, useEffect } from "react";
import { Search }                           from "lucide-react";
// Son botones y campos que también usamos en otras pantallas
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import InputCampo    from "../../compartido/ui/InputCampo";

//un solo useState para todos los campos del formulario
import useCamposFormulario from "../../../hooks/useCamposFormulario";
import TarjetaPlato from "./TarjetaPlato";

import {obtenerMenu, crearProducto, cambiarDisponibilidad, eliminarProducto} from "../../../servicios/menuServicio";
import "./GestionMenu.css";

// Si se agrega una categoría nueva, se añade aqui
const CATEGORIAS = ["Caldos", "Sopas", "Bandejas", "Bebidas", "Extras", "Porciones"];

// Datos iniciales para empezar un plato nuevo.
const FORMULARIO_VACIO = {
  nombre:      "",
  precio:      "",
  categoria:   "Caldos",
  descripcion: "",
  disponible:  true,
};

function GestionMenu() {

  // Aquí guardamos la información que cambia mientras usamos la pantalla.
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [platoEditando, setPlatoEditando] = useState(null); // null = plato nuevo
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // el hook useCamposFormulario nos da los campos del formulario, una funcion para manejar los cambios y otra para reiniciar el formulario
  const { campos, manejarCambio, reiniciar } = useCamposFormulario(FORMULARIO_VACIO);

  const cargarPlatos = async () => {
    try {
      setCargando(true);
      const datos = await obtenerMenu();
      setPlatos(datos);
    } catch (error) {
      console.error("Error al obtener el menú:", error);
      alert("Ocurrió un error al cargar el menú. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };
  
  useEffect(() => {
    cargarPlatos();
  }, []);

  // mostramos solo los platos que coinciden con la búsqueda y la categoria
  const platosFiltrados = platos.filter((plato) => {
    const coincideNombre    = plato.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todas" || plato.categoria === categoriaActiva;
    return coincideNombre && coincideCategoria;
  });


  // Al pulsar el boton abrimos el formulario vacio o con los datos del plato
  function abrirModal(platoExistente = null) {
    if (platoExistente) {
      setPlatoEditando(platoExistente);
      reiniciar({
        nombre:      platoExistente.nombre,
        precio:      platoExistente.precio,
        categoria:   platoExistente.categoria,
        descripcion: platoExistente.descripcion || "",
        urlImagen:   platoExistente.urlImagen || "",
        disponible:  Boolean(platoExistente.disponible),
      });
    } else {
      setPlatoEditando(null);
      reiniciar(); // empezamos con un formulario limpio
    }
    
    setModalAbierto(true);
  }
// el modal sirve para agregar un plato nuevo o editar uno existente, si se pasa un plato existente se llenan los campos con sus datos, si no se pasa nada se dejan vacios para agregar un plato nuevo
// Cerramos el modal y reiniciamos el formulario
  function cerrarModal() {
    setModalAbierto(false);
    setPlatoEditando(null);
    reiniciar();

  }
// Guardamos el plato nuevo o editado en la base de datos
  async function guardarPlato(evento) {
    evento.preventDefault();
    setGuardando(true);

    try {
      const datosPlato = {
        nombre:      campos.nombre.trim(),
        precio:      Number(campos.precio),
        categoria:   campos.categoria,
        descripcion: campos.descripcion.trim(),
        disponible:  campos.disponible,
      };

      await crearProducto(datosPlato);
      await cargarPlatos();
      cerrarModal();

    } catch (error) {
      console.error("Error al guardar el plato:", error);
      alert("Ocurrio un error al guardar en la base de datos, intenta de nuevo");
    } finally {
      setGuardando(false);
    }
  }
// Abrimos el modal con los datos del plato a editar
  function manejarCambio(plato) {
    if (plato.soloToggle) {
      manejarCambioDisponibilidad(plato.id, plato.disponible);
    } else {
      abrirModal(plato);
    }
  }
// Cambiamos la disponibilidad del plato en la base de datos y recargamos los platos
  async function manejarEliminacion(platoId, nombrePlato) {
    const confirmar = window.confirm(
      `¿Estás segura de eliminar "${nombrePlato}"?`
    );
    if (!confirmar) return;

    try {
      await eliminarProducto(platoId);
      await cargarPlatos();
    } catch (error) {
      console.error("Error al eliminar el plato:", error);
      alert("No se pudo eliminar el plato");
    }
  }
  
  //Interfaz
  return (
    <div className="gestion-menu">

      {/* Titulo y boton para agregar un plato */}
      <div className="gestion-menu__encabezado">
        <div>
          <h1>Gestión de Menú</h1>
          <p>Administra los platos del negocio</p>
        </div>
        <BotonPrimario
          texto="+ Agregar Plato"
          tipo="button"
          alHacer={() => abrirModal()}
          ancho="auto"
        />
      </div>

      {/* Buscador y filtro por categoria */}
      <div className="gestion-menu__filtros">
        <div className="gestion-menu__buscador">
          <Search size={16} className="buscador__icono" />
          <input
            type="text"
            placeholder="Buscar platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador__input"
          />
        </div>

        <select
          value={categoriaActiva}
          onChange={(e) => setCategoriaActiva(e.target.value)}
          className="gestion-menu__selector"
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista de tarjetas de platos */}
      {cargando ? (
        <p className="gestion-menu__estado">Cargando platos...</p>

      ) : platosFiltrados.length === 0 ? (
        <p className="gestion-menu__estado">
          {busqueda
            ? `No hay platos con "${busqueda}"`
            : "No hay platos registrados"}
        </p>

      ) : (
        <div className="gestion-menu__grid">
          {platosFiltrados.map((plato) => (
            <TarjetaPlato
              key={plato.id}
              plato={plato}
              alEditar={manejarCambio} // alEditar es la funcion que abre el modal con los datos del plato a editar
              alEliminar={manejarEliminacion} // alEliminar es la funcion que elimina el plato de la base de datos
            />
          ))}
        </div>
      )}

      {/* Formulario para agregar o editar un plato */}
      {modalAbierto && (
        <ModalPlato
          campos={campos}
          manejarCambio={manejarCambio}
          alGuardar={guardarPlato}
          alCerrar={cerrarModal}
          guardando={guardando}
          esEdicion={platoEditando !== null}
          alSeleccionarImagen={(e) => setImagenSeleccionada(e.target.files[0])}
        />
      )}

    </div>
  );
}

//Modal plato
// este es el formulario que aparece al agregar o editar un plato, lo dejamos aparte para que la pantalla principal sea mas facil de leer
function ModalPlato({ campos, manejarCambio, alGuardar, alCerrar, guardando, esEdicion, alSeleccionarImagen }) {
  return (
    // Al hacer clic fuera del formulario se cierra
    <div className="modal-fondo" onClick={alCerrar}>

        {/* Los clics dentro del formulario no deben cerrarlo */}
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>

        <h2 className="modal-titulo">
          {esEdicion ? "Editar plato" : "Agregar plato"}
        </h2>

        <form onSubmit={alGuardar} className="modal-formulario">

            {/* Campos de nombre, precio y descripción */}
          <InputCampo
            etiqueta="Nombre del plato"
            id="nombre"
            nombre="nombre"
            tipo="text"
            valor={campos.nombre}
            alCambiar={(e) => manejarCambio("nombre", e.target.value)}
            placeholder="Ej: Caldo de costilla"
            requerido
          />

          <InputCampo
            etiqueta="Precio (COP)"
            id="precio"
            nombre="precio"
            tipo="number"
            valor={campos.precio}
            alCambiar={(e) => manejarCambio("precio", e.target.value)}
            placeholder="Ej: 14000"
            requerido
          />

            {/* seleccion de categoria */}
          <div className="modal-campo-grupo">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={campos.categoria}
              onChange={(e) => manejarCambio("categoria", e.target.value)}
              className="modal-selector"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <InputCampo
            etiqueta="Descripción"
            id="descripcion"
            nombre="descripcion"
            tipo="text"
            valor={campos.descripcion}
            alCambiar={(e) => manejarCambio("descripcion", e.target.value)}
            placeholder="Ej: Acompañado de papa, cilantro y costilla de res"
          />
          <InputCampo
            etiqueta="URL de la imagen"
            id="urlImagen"
            nombre="urlImagen"
            tipo="text"
            valor={campos.urlImagen}
            alCambiar={(e) => manejarCambio("urlImagen", e.target.value)}
            placeholder="Ej: https://ejemplo.com/imagen.jpg"
          />

          {/* Selector de imagen */}
          <div className="modal-campo-grupo">
            <label htmlFor="imagen">Foto del plato</label>
            <input
              id="imagen"
              type="file"
              accept="image/*"
              onChange={alSeleccionarImagen}
              className="modal-input-archivo"
            />
          </div>

          {/* Indica si el plato se puede pedir*/}
          <label className="modal-toggle">
            <input
              type="checkbox"
              name="disponible"
              checked={campos.disponible}
              onChange={(e) => manejarCambio("disponible", e.target.checked)}
            />
            <span>Disponible para pedir</span>
          </label>

          {/* Botones para cancelar o guardar */}
          <div className="modal-botones">
            <button
              type="button"
              onClick={alCerrar}
              className="modal-boton-cancelar"
            >
              Cancelar
            </button>
            <BotonPrimario
              texto={esEdicion ? "Guardar cambios" : "Agregar plato"}
              cargando={guardando}
              ancho="auto"
            />
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default GestionMenu;
