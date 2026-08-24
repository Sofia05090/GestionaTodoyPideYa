// pantalla de gestion del menu
// se visualiza:
// LISTAR los platos desde Firestore en tarjetas
// FILTRAR por nombre (buscador) y categoria (selector)
// CRUD agregar, editar, cambiar disponibilidad del plato y eliminar
//  se usa el Hook useCamposFormulario maneja todos los campos del formulario con un solo useState en vez de uno por cada campo

import { useState, useEffect } from "react";
import { db, storage }         from "../../../firebase/config";
import {collection, addDoc, updateDoc,
  deleteDoc, doc, onSnapshot, orderBy, query,} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Search }                           from "lucide-react";
// Son botones y campos que también usamos en otras pantallas
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import InputCampo    from "../../compartido/ui/InputCampo";

//un solo useState para todos los campos del formulario
import useCamposFormulario from "../../../hooks/useCamposFormulario";
import TarjetaPlato from "./TarjetaPlato";
import "./GestionMenu.css";
// categorias que se definieron en firestore
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
  const [platos,             setPlatos]             = useState([]);
  const [cargando,           setCargando]           = useState(true);
  const [modalAbierto,       setModalAbierto]       = useState(false);
  const [platoEditando,      setPlatoEditando]      = useState(null); // null = plato nuevo
  const [guardando,          setGuardando]          = useState(false);
  const [busqueda,           setBusqueda]           = useState("");
  const [categoriaActiva,    setCategoriaActiva]    = useState("Todas");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // estos son los datos que vamos escribiendo al agregar o editar un plato
  const { campos, manejarCambio, reiniciar } = useCamposFormulario(FORMULARIO_VACIO);


  // la lista se actualiza sola cuando cambia algo en Firebase
  useEffect(() => {
    const consultaPlatos = query(
      collection(db, "productos"),
      orderBy("createdAt", "desc")
    );

    const detenerEscucha = onSnapshot(consultaPlatos, (resultado) => {
      const listaPlatos = resultado.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlatos(listaPlatos);
      setCargando(false);
    });

    // al salir de la pantalla, ya no necesitamos recibir esos cambios.
    return () => detenerEscucha();
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
        descripcion: platoExistente.descripcion,
        disponible:  platoExistente.disponible,
      });
    } else {
      setPlatoEditando(null);
      reiniciar(); // empezamos con un formulario limpio
    }
    setImagenSeleccionada(null);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setPlatoEditando(null);
    reiniciar();
    setImagenSeleccionada(null);
  }


  // Si se eligio una imagen, la guardamos en Firebase y obtenemos su direccion si no se eligio ninguna, seguimos sin cambiar la imagen
  async function subirImagenSiHay() {
    if (!imagenSeleccionada) return null;

    const rutaStorage = ref(storage, `platos/${Date.now()}_${imagenSeleccionada.name}`);
    await uploadBytes(rutaStorage, imagenSeleccionada);
    return await getDownloadURL(rutaStorage);
  }


  // aqui guardamos un plato nuevo
  async function guardarPlato(evento) {
    evento.preventDefault();
    setGuardando(true);

    try {
      const urlImagenNueva = await subirImagenSiHay();

      // Reunimos toda la informacion antes de enviarla a Firebase
      const datosPlato = {
        nombre:      campos.nombre.trim(),
        precio:      Number(campos.precio),
        categoria:   campos.categoria,
        descripcion: campos.descripcion.trim(),
        disponible:  campos.disponible,
        // Solo actualizamos urlImagen si subieron una nueva
        ...(urlImagenNueva && { urlImagen: urlImagenNueva }),
      };

      if (platoEditando) {
        // EDITAR: actualizamos el documento existente en Firestore
        await updateDoc(doc(db, "productos", platoEditando.id), datosPlato);
      } else {
        // AGREGAR: creamos un documento nuevo con fecha de creación
        await addDoc(collection(db, "productos"), {
          ...datosPlato,
          urlImagen: urlImagenNueva || "",
          createdAt: new Date(),
        });
      }

      cerrarModal();

    } catch (error) {
      console.error("Error al guardar el plato:", error);
      alert("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }


  // desde la tarjeta podemos marcar el plato como disponible o agotado
  async function cambiarDisponibilidad(platoId, disponibleActual) {
    try {
      await updateDoc(doc(db, "productos", platoId), {
        disponible: !disponibleActual,
      });
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
    }
  }


  // se revisa si la acción es editar el plato o cambiar su disponibilidad
  function manejarEdicion(plato) {
    if (plato.soloToggle) {
      cambiarDisponibilidad(plato.id, plato.disponible);
    } else {
      abrirModal(plato);
    }
  }


  // antes de eliminar preguntamos para evitar borrar un plato por accidente
  async function eliminarPlato(platoId, nombrePlato) {
    const confirmar = window.confirm(
      `¿Estás segura de eliminar "${nombrePlato}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "productos", platoId));
    } catch (error) {
      console.error("Error al eliminar el plato:", error);
      alert("No se pudo eliminar el plato. Intenta de nuevo.");
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
            : "No hay platos en el menú. ¡Agrega el primero!"}
        </p>

      ) : (
        <div className="gestion-menu__grid">
          {platosFiltrados.map((plato) => (
            <TarjetaPlato
              key={plato.id}
              plato={plato}
              alEditar={manejarEdicion}
              alEliminar={eliminarPlato}
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
            etiqueta="Precio (pesos colombianos)"
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
            placeholder="Ej: Papa sabanera y costilla de res"
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
