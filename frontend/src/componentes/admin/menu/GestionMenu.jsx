// pantalla de gestion del menu
// se visualiza:
// LISTAR los platos de la API en tarjetas
// FILTRAR por nombre (buscador) y categoria (selector)
// CRUD agregar, editar, cambiar disponibilidad del plato y eliminar
//  se usa el Hook useCamposFormulario maneja todos los campos del formulario con un solo useState en vez de uno por cada campo

import { useState, useEffect, useRef } from "react";
import { Check, Pencil, Plus, Search, Tags, Trash2, X } from "lucide-react";
// Son botones y campos que también usamos en otras pantallas
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import InputCampo from "../../compartido/ui/InputCampo";
import SelectorDesplegable from "../../compartido/ui/SelectorDesplegable";

//un solo useState para todos los campos del formulario
import useCamposFormulario from "../../../hooks/useCamposFormulario";
import TarjetaPlato from "./TarjetaPlato";

import {
  obtenerMenu,
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  crearProducto,
  actualizarProducto,
  cambiarDisponibilidad,
  eliminarProducto,
} from "../../../servicios/menuServicio";
import "./GestionMenu.css";

const normalizarCategoria = (valor = "") =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const ordenarCategorias = (lista) =>
  [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));

// Datos iniciales para empezar un plato nuevo.
const FORMULARIO_VACIO = {
  nombre: "",
  precio: "",
  categoria: "",
  descripcion: "",
  urlImagen: "",
  disponible: true,
};

const normalizarPrecioInicial = (valor) => {
  const texto = String(valor ?? "").trim();
  if (!texto) return "";

  const numero = Number(texto);
  return Number.isSafeInteger(numero) && numero >= 0 ? String(numero) : texto;
};

const formatearPrecioParaMostrar = (valor) => {
  const texto = String(valor ?? "");
  if (!/^\d+$/.test(texto)) return texto;

  const numero = Number(texto);
  return Number.isSafeInteger(numero)
    ? new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(numero)
    : texto;
};

function GestionMenu() {
  // Aquí guardamos la información que cambia mientras usamos la pantalla.
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);
  const [platoEditando, setPlatoEditando] = useState(null); // null = plato nuevo
  const [guardando, setGuardando] = useState(false);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [nombreCategoriaNueva, setNombreCategoriaNueva] = useState("");
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);
  const [nombreCategoriaEditando, setNombreCategoriaEditando] = useState("");
  const [errorCategorias, setErrorCategorias] = useState("");
  const [categoriaParaEliminar, setCategoriaParaEliminar] = useState(null);
  const [categoriaDestinoId, setCategoriaDestinoId] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [urlImagenLocal, setUrlImagenLocal] = useState("");
  const referenciaUrlImagenLocal = useRef("");

  // el hook useCamposFormulario nos da los campos del formulario, una funcion para manejar los cambios y otra para reiniciar el formulario
  const {
    campos,
    manejarCambio: manejarCambioCampo,
    reiniciar,
  } = useCamposFormulario(FORMULARIO_VACIO);

  const categoriasSelector = categorias.map((categoria) => categoria.nombre);

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

  const cargarCategorias = async () => {
    const datos = await obtenerCategorias();
    setCategorias(datos);
    return datos;
  };

  const recargarMenuYCategorias = async () => {
    const [datosPlatos, datosCategorias] = await Promise.all([
      obtenerMenu(),
      obtenerCategorias(),
    ]);
    setPlatos(datosPlatos);
    setCategorias(datosCategorias);
  };

  useEffect(() => {
    let activo = true;

    Promise.all([obtenerMenu(), obtenerCategorias()])
      .then(([datosPlatos, datosCategorias]) => {
        if (activo) {
          setPlatos(datosPlatos);
          setCategorias(datosCategorias);
        }
      })
      .catch((error) => {
        if (activo) {
          console.error("Error al obtener el menú:", error);
          alert("Ocurrió un error al cargar el menú. Intenta de nuevo.");
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (referenciaUrlImagenLocal.current) {
        URL.revokeObjectURL(referenciaUrlImagenLocal.current);
      }
    },
    [],
  );

  function seleccionarImagen(evento) {
    const archivo = evento.target.files?.[0] || null;
    if (referenciaUrlImagenLocal.current) {
      URL.revokeObjectURL(referenciaUrlImagenLocal.current);
    }

    const nuevaUrlLocal = archivo ? URL.createObjectURL(archivo) : "";
    referenciaUrlImagenLocal.current = nuevaUrlLocal;
    setUrlImagenLocal(nuevaUrlLocal);
    setImagenSeleccionada(archivo);
  }

  function limpiarImagenSeleccionada() {
    if (referenciaUrlImagenLocal.current) {
      URL.revokeObjectURL(referenciaUrlImagenLocal.current);
      referenciaUrlImagenLocal.current = "";
    }
    setUrlImagenLocal("");
    setImagenSeleccionada(null);
  }

  // mostramos solo los platos que coinciden con la búsqueda y la categoria
  const platosFiltrados = platos.filter((plato) => {
    const coincideNombre = plato.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaActiva === "Todas" ||
      normalizarCategoria(plato.categoria) ===
        normalizarCategoria(categoriaActiva);
    return coincideNombre && coincideCategoria;
  });

  // Al pulsar el boton abrimos el formulario vacio o con los datos del plato
  function abrirModal(platoExistente = null) {
    limpiarImagenSeleccionada();

    if (platoExistente) {
      setPlatoEditando(platoExistente);
      reiniciar({
        nombre: platoExistente.nombre,
        precio: normalizarPrecioInicial(platoExistente.precio),
        categoria: platoExistente.categoria ?? "",
        descripcion: platoExistente.descripcion || "",
        urlImagen: platoExistente.urlImagen || "",
        disponible: Boolean(platoExistente.disponible),
      });
    } else {
      setPlatoEditando(null);
      reiniciar(FORMULARIO_VACIO);
    }

    setModalAbierto(true);
  }
  // el modal sirve para agregar un plato nuevo o editar uno existente, si se pasa un plato existente se llenan los campos con sus datos, si no se pasa nada se dejan vacios para agregar un plato nuevo
  // Cerramos el modal y reiniciamos el formulario
  function cerrarModal() {
    setModalAbierto(false);
    setPlatoEditando(null);
    limpiarImagenSeleccionada();
    reiniciar(FORMULARIO_VACIO);
  }

  function abrirGestionCategorias() {
    setErrorCategorias("");
    setNombreCategoriaNueva("");
    setCategoriaEditandoId(null);
    setModalCategoriasAbierto(true);
  }

  async function guardarCategoriaNueva(evento) {
    evento.preventDefault();
    const nombre = nombreCategoriaNueva.trim();
    if (!nombre) {
      setErrorCategorias("Escribe el nombre de la categoría.");
      return;
    }

    setGuardandoCategoria(true);
    setErrorCategorias("");
    try {
      const categoriaCreada = await crearCategoria(nombre);
      setNombreCategoriaNueva("");
      setCategorias((actuales) => ordenarCategorias([...actuales, categoriaCreada]));
    } catch (error) {
      setErrorCategorias(error.message || "No se pudo crear la categoría.");
      setGuardandoCategoria(false);
      return;
    }

    try {
      await cargarCategorias();
    } catch (error) {
      console.error("La categoría se creó, pero no se pudo actualizar la lista:", error);
      setErrorCategorias("La categoría se creó, pero no se pudo actualizar la lista. Recarga Gestión de Menú.");
    } finally {
      setGuardandoCategoria(false);
    }
  }

  function iniciarEdicionCategoria(categoria) {
    setCategoriaEditandoId(categoria.id);
    setNombreCategoriaEditando(categoria.nombre);
    setErrorCategorias("");
  }

  async function guardarEdicionCategoria(evento, categoria) {
    evento.preventDefault();
    const nombre = nombreCategoriaEditando.trim();
    if (!nombre) {
      setErrorCategorias("Escribe el nombre de la categoría.");
      return;
    }

    setGuardandoCategoria(true);
    setErrorCategorias("");
    try {
      await actualizarCategoria(categoria.id, nombre);
      setCategorias((actuales) => ordenarCategorias(actuales.map((actual) =>
        actual.id === categoria.id ? { ...actual, nombre } : actual
      )));
      setPlatos((actuales) => actuales.map((plato) =>
        plato.categoria === categoria.nombre ? { ...plato, categoria: nombre } : plato
      ));
      if (categoriaActiva === categoria.nombre) setCategoriaActiva(nombre);
      if (campos.categoria === categoria.nombre) manejarCambioCampo("categoria", nombre);
      setCategoriaEditandoId(null);
    } catch (error) {
      setErrorCategorias(error.message || "No se pudo cambiar el nombre.");
      setGuardandoCategoria(false);
      return;
    }

    try {
      await recargarMenuYCategorias();
    } catch (error) {
      console.error("La categoría se renombró, pero no se pudo actualizar la lista:", error);
      setErrorCategorias("La categoría se renombró, pero no se pudieron actualizar los datos. Recarga Gestión de Menú.");
    } finally {
      setGuardandoCategoria(false);
    }
  }

  function solicitarEliminacionCategoria(categoria) {
    if (categorias.length < 2) {
      setErrorCategorias("Agrega otra categoría antes de eliminar esta.");
      return;
    }
    setCategoriaParaEliminar(categoria);
    setCategoriaDestinoId("");
    setErrorCategorias("");
  }

  async function confirmarEliminacionCategoria() {
    if (!categoriaParaEliminar) return;
    if (!categoriaDestinoId || Number(categoriaDestinoId) === Number(categoriaParaEliminar.id)) {
      setErrorCategorias("Selecciona otra categoría para recibir los platos.");
      return;
    }
    const categoriaDestino = categorias.find(
      (actual) => Number(actual.id) === Number(categoriaDestinoId)
    );
    if (!categoriaDestino) {
      setErrorCategorias("La categoría de destino ya no está disponible. Recarga Gestión de Menú.");
      return;
    }

    setGuardandoCategoria(true);
    setErrorCategorias("");
    try {
      const resultado = await eliminarCategoria(categoriaParaEliminar.id, categoriaDestinoId);
      const platosReasignados = Number(resultado.platosReasignados || 0);

      setCategorias((actuales) => ordenarCategorias(
        actuales
          .filter((actual) => Number(actual.id) !== Number(categoriaParaEliminar.id))
          .map((actual) => Number(actual.id) === Number(categoriaDestino.id)
            ? { ...actual, cantidadPlatos: Number(actual.cantidadPlatos) + platosReasignados }
            : actual
          )
      ));
      setPlatos((actuales) => actuales.map((plato) =>
        plato.categoria === categoriaParaEliminar.nombre
          ? { ...plato, categoria: categoriaDestino.nombre }
          : plato
      ));
      if (categoriaActiva === categoriaParaEliminar.nombre) {
        setCategoriaActiva(categoriaDestino.nombre);
      }
      if (campos.categoria === categoriaParaEliminar.nombre) {
        manejarCambioCampo("categoria", categoriaDestino.nombre);
      }
      if (categoriaEditandoId === categoriaParaEliminar.id) setCategoriaEditandoId(null);
      setCategoriaParaEliminar(null);
      setCategoriaDestinoId("");
    } catch (error) {
      setErrorCategorias(error.message || "No se pudo eliminar la categoría.");
      setGuardandoCategoria(false);
      return;
    }

    try {
      await recargarMenuYCategorias();
    } catch (error) {
      console.error("La categoría se eliminó, pero no se pudo actualizar la lista:", error);
      setErrorCategorias("La categoría se eliminó, pero no se pudieron actualizar los datos. Recarga Gestión de Menú.");
    } finally {
      setGuardandoCategoria(false);
    }
  }
  // Guardamos el plato nuevo o editado en la base de datos
  async function guardarPlato(evento) {
    evento.preventDefault();

    const precioTexto = String(campos.precio ?? "").trim();
    const precio = Number(precioTexto);
    if (
      !precioTexto ||
      !/^\d+$/.test(precioTexto) ||
      !Number.isSafeInteger(precio) ||
      precio < 0
    ) {
      alert("El precio debe expresarse en pesos enteros, sin decimales.");
      return;
    }
    setGuardando(true);

    try {
      const datosPlato = {
        nombre: campos.nombre.trim(),
        precio,
        categoria: campos.categoria,
        descripcion: campos.descripcion.trim(),
        urlImagen: campos.urlImagen?.trim() || "", //se envia la url de la imagen si se selecciono una, si no se deja vacio
        disponible: campos.disponible,
      };
      if (platoEditando) {
        //si estamos editando, llamamos a PUT
        await actualizarProducto(platoEditando.id, datosPlato, imagenSeleccionada);
      } else {
        //si es nuevo, llamamos a POST
        await crearProducto(datosPlato, imagenSeleccionada);
      }
      await cargarPlatos();
      cerrarModal();
      try {
        await cargarCategorias();
      } catch (error) {
        console.error("Error al actualizar el conteo de categorías:", error);
        alert("El plato se guardó, pero no se pudo actualizar el conteo de categorías.");
      }
    } catch (error) {
      console.error("Error al guardar el plato:", error);
      alert(
        error.message ||
          "Ocurrio un error al guardar en la base de datos, intenta de nuevo",
      );
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

  async function manejarCambioDisponibilidad(platoId, disponible) {
    const estadoAnterior = platos.find(
      (plato) => plato.id === platoId,
    )?.disponible;

    setPlatos((prevPlatos) =>
      prevPlatos.map((plato) =>
        plato.id === platoId ? { ...plato, disponible } : plato,
      ),
    );

    try {
      await cambiarDisponibilidad(platoId, disponible);
    } catch (error) {
      console.error("Error al cambiar la disponibilidad:", error);
      setPlatos((prevPlatos) =>
        prevPlatos.map((plato) =>
          plato.id === platoId
            ? { ...plato, disponible: estadoAnterior }
            : plato,
        ),
      );
      alert("No se pudo actualizar la disponibilidad del plato.");
    }
  }

  // Cambiamos la disponibilidad del plato en la base de datos y recargamos los platos
  async function manejarEliminacion(platoId, nombrePlato) {
    const confirmar = window.confirm(
      `¿Estás segura de eliminar "${nombrePlato}"?`,
    );
    if (!confirmar) return;

    try {
      await eliminarProducto(platoId);
      await cargarPlatos();
      try {
        await cargarCategorias();
      } catch (error) {
        console.error("Error al actualizar el conteo de categorías:", error);
        alert("El plato se eliminó, pero no se pudo actualizar el conteo de categorías.");
      }
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

        <SelectorDesplegable
          value={categoriaActiva}
          onChange={setCategoriaActiva}
          ariaLabel="Filtrar por categoría"
          className="gestion-menu__selector"
          options={[
            { value: "Todas", label: "Todas las categorías" },
            ...categoriasSelector.map((categoria) => ({
              value: categoria,
              label: categoria,
            })),
          ]}
        />
        <button
          className="gestion-menu__gestionar-categorias"
          type="button"
          onClick={abrirGestionCategorias}
        >
          <Tags size={17} aria-hidden="true" />
          <span>Gestionar categorías</span>
        </button>
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
          manejarCambio={manejarCambioCampo}
          alGuardar={guardarPlato}
          alCerrar={cerrarModal}
          guardando={guardando}
          esEdicion={platoEditando !== null}
          categoriasSelector={categoriasSelector}
          alSeleccionarImagen={seleccionarImagen}
          urlImagenLocal={urlImagenLocal}
        />
      )}

      {modalCategoriasAbierto && (
        <div
          className="gestion-categorias__fondo"
          onClick={() => {
            if (!guardandoCategoria) setModalCategoriasAbierto(false);
          }}
        >
          <section
            className="gestion-categorias__dialogo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gestion-categorias-titulo"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="gestion-categorias__encabezado">
              <div>
                <h2 id="gestion-categorias-titulo">Categorías del menú</h2>
                <p>Crea y renombra categorías. Al eliminar una, sus platos se trasladarán a la categoría que elijas.</p>
              </div>
              <button
                className="gestion-categorias__cerrar"
                type="button"
                aria-label="Cerrar gestión de categorías"
                disabled={guardandoCategoria}
                onClick={() => setModalCategoriasAbierto(false)}
              >
                <X size={20} />
              </button>
            </header>

            <form className="gestion-categorias__agregar" onSubmit={guardarCategoriaNueva}>
              <input
                type="text"
                value={nombreCategoriaNueva}
                onChange={(evento) => setNombreCategoriaNueva(evento.target.value)}
                placeholder="Nombre de la nueva categoría"
                aria-label="Nombre de la nueva categoría"
                maxLength={50}
                disabled={guardandoCategoria}
              />
              <button type="submit" disabled={guardandoCategoria || !nombreCategoriaNueva.trim()}>
                <Plus size={17} aria-hidden="true" />
                <span>Agregar</span>
              </button>
            </form>

            {errorCategorias && (
              <p className="gestion-categorias__error" role="alert">
                {errorCategorias}
              </p>
            )}

            <div className="gestion-categorias__lista">
              {categorias.map((categoria) => {
                const estaEditando = categoriaEditandoId === categoria.id;
                const cantidadPlatos = Number(categoria.cantidadPlatos || 0);

                return (
                  <div className="gestion-categorias__fila" key={categoria.id}>
                    {estaEditando ? (
                      <form
                        className="gestion-categorias__edicion"
                        onSubmit={(evento) => guardarEdicionCategoria(evento, categoria)}
                      >
                        <input
                          type="text"
                          value={nombreCategoriaEditando}
                          onChange={(evento) => setNombreCategoriaEditando(evento.target.value)}
                          aria-label={`Nuevo nombre para ${categoria.nombre}`}
                          maxLength={50}
                          autoFocus
                          disabled={guardandoCategoria}
                        />
                        <button
                          type="submit"
                          aria-label="Guardar nombre de categoría"
                          title="Guardar"
                          disabled={guardandoCategoria}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label="Cancelar edición de categoría"
                          title="Cancelar"
                          disabled={guardandoCategoria}
                          onClick={() => setCategoriaEditandoId(null)}
                        >
                          <X size={18} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="gestion-categorias__datos">
                          <strong>{categoria.nombre}</strong>
                          <span>
                            {cantidadPlatos} {cantidadPlatos === 1 ? "plato asociado" : "platos asociados"}
                          </span>
                        </div>
                        <div className="gestion-categorias__acciones">
                          <button
                            type="button"
                            aria-label={`Editar ${categoria.nombre}`}
                            title="Editar categoría"
                            disabled={guardandoCategoria}
                            onClick={() => iniciarEdicionCategoria(categoria)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Eliminar ${categoria.nombre}`}
                            title={categorias.length < 2
                              ? "Agrega otra categoría antes de eliminar esta"
                              : "Eliminar categoría"}
                            disabled={guardandoCategoria || categorias.length < 2}
                            onClick={() => solicitarEliminacionCategoria(categoria)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {categoriaParaEliminar && (
              <div
                className="gestion-categorias__confirmacion-fondo"
                onClick={(evento) => {
                  if (evento.target === evento.currentTarget && !guardandoCategoria) {
                    setCategoriaParaEliminar(null);
                    setCategoriaDestinoId("");
                    setErrorCategorias("");
                  }
                }}
              >
                <section
                  className="gestion-categorias__confirmacion"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="gestion-categorias-confirmar-titulo"
                  onClick={(evento) => evento.stopPropagation()}
                >
                  <h3 id="gestion-categorias-confirmar-titulo">Eliminar categoría</h3>
                  <p>
                    Elige la categoría a la que se moverán los {Number(categoriaParaEliminar.cantidadPlatos || 0)} platos asociados a “{categoriaParaEliminar.nombre}”.
                    Se conservarán sus demás datos.
                  </p>
                  <label htmlFor="categoria-destino">Categoría de destino</label>
                  <select
                    id="categoria-destino"
                    value={categoriaDestinoId}
                    onChange={(evento) => {
                      setCategoriaDestinoId(evento.target.value);
                      setErrorCategorias("");
                    }}
                    disabled={guardandoCategoria}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias
                      .filter((actual) => actual.id !== categoriaParaEliminar.id)
                      .map((actual) => (
                        <option key={actual.id} value={actual.id}>
                          {actual.nombre}
                        </option>
                      ))}
                  </select>
                  {errorCategorias && (
                    <p className="gestion-categorias__error" role="alert">
                      {errorCategorias}
                    </p>
                  )}
                  <div className="gestion-categorias__confirmacion-botones">
                    <button
                      type="button"
                      disabled={guardandoCategoria}
                      onClick={() => {
                        setCategoriaParaEliminar(null);
                        setCategoriaDestinoId("");
                        setErrorCategorias("");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={guardandoCategoria || !categoriaDestinoId}
                      onClick={confirmarEliminacionCategoria}
                    >
                      {guardandoCategoria ? "Eliminando..." : "Eliminar y trasladar"}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

//Modal plato
// este es el formulario que aparece al agregar o editar un plato, lo dejamos aparte para que la pantalla principal sea mas facil de leer
function ModalPlato({
  campos,
  manejarCambio,
  alGuardar,
  alCerrar,
  guardando,
  esEdicion,
  categoriasSelector,
  alSeleccionarImagen,
  urlImagenLocal,
}) {
  const [precioEnfocado, setPrecioEnfocado] = useState(false);

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
            tipo="text"
            modoEntrada="numeric"
            valor={precioEnfocado
              ? campos.precio
              : formatearPrecioParaMostrar(campos.precio)}
            alCambiar={(evento) => {
              const valor = evento.target.value.replace(/\./g, "").trim();
              if (!valor || /^\d+$/.test(valor)) manejarCambio("precio", valor);
            }}
            alEnfocar={() => setPrecioEnfocado(true)}
            alDesenfocar={() => setPrecioEnfocado(false)}
            placeholder="Ej: 14.000"
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
              <option value="" disabled>Seleccionar categoría</option>
              {categoriasSelector.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
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
          {(urlImagenLocal || campos.urlImagen?.trim()) && (
            <VistaPreviaImagen
              key={urlImagenLocal || campos.urlImagen.trim()}
              src={urlImagenLocal || campos.urlImagen.trim()}
            />
          )}

          {/* Selector de imagen */}
          <div className="modal-campo-grupo">
            <label htmlFor="imagen">Foto del plato (cámara o archivo)</label>
            <input
              id="imagen"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              capture="environment"
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

function VistaPreviaImagen({ src }) {
  const [error, setError] = useState(false);

  return (
    <div className="modal-vista-previa-imagen">
      {error ? (
        <p role="status">
          No se pudo cargar la imagen. Usa un enlace directo al archivo de
          imagen, no una página para compartirla.
        </p>
      ) : (
        <img
          src={src}
          alt="Vista previa del plato"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

export default GestionMenu;
