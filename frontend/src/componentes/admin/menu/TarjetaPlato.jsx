// Esta tarjeta muestra la información de un plato del menu:
// su imagen, nombre, categoria, descripción, precio y disponibilidad
// También tiene botones para editarlo o eliminarlo

import { Pencil, Trash2, ImageOff, CheckCircle } from "lucide-react";
import "./TarjetaPlato.css";

function TarjetaPlato({ plato, alEditar, alEliminar }) {
  return (
    <div className="tarjeta-plato">

      {/* Imagen y aviso de disponibilidad */}
      <div className="tarjeta-plato__imagen-contenedor">

        {plato.urlImagen ? (
          <img
            src={plato.urlImagen}
            alt={plato.nombre}
            className="tarjeta-plato__imagen"
          />
        ) : (
          // Si todavia no tiene foto, mostramos un icono como reemplazo
          <div className="tarjeta-plato__sin-imagen">
            <ImageOff size={40} color="#CCCCCC" />
          </div>
        )}

        {/* Chip verde si esta disponible, rojo si esta agotado */}
        <span className={`tarjeta-plato__chip ${plato.disponible ? "chip--disponible" : "chip--agotado"}`}>
          {plato.disponible ? "Disponible" : "Agotado"}
        </span>

      </div>

      {/* Información principal del plato */}
      <div className="tarjeta-plato__cuerpo">
        <p className="tarjeta-plato__nombre">{plato.nombre}</p>
        <p className="tarjeta-plato__categoria">{plato.categoria}</p>
        <p className="tarjeta-plato__descripcion">{plato.descripcion}</p>

        {/* Este boton permite marcar el plato como agotado o disponible
          sin tener que abrir el formulario de edicion */}
        <button
          type="button"
          className={`tarjeta-plato__toggle ${plato.disponible ? "toggle--disponible" : "toggle--agotado"}`}
          onClick={() => alEditar({ ...plato, soloToggle: true })}
        >
          <CheckCircle size={15} />
          {plato.disponible ? "Disponible — clic para agotar" : "Agotado — clic para activar"}
        </button>
      </div>

      {/* Precio y botones de accion */}
      <div className="tarjeta-plato__pie">
        <span className="tarjeta-plato__precio">
          ${Number(plato.precio).toLocaleString("es-CO")}
        </span>

        <div className="tarjeta-plato__acciones">
          {/* Editar: abre el formulario con los datos actuales del plato */}
          <button
            type="button"
            className="tarjeta-plato__boton-icono"
            onClick={() => alEditar(plato)}
            title="Editar plato"
          >
            <Pencil size={16} />
          </button>

          {/* Eliminar: pide confirmacion antes de borrar */}
          <button
            type="button"
            className="tarjeta-plato__boton-icono tarjeta-plato__boton-icono--eliminar"
            onClick={() => alEliminar(plato.id, plato.nombre)}
            title="Eliminar plato"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}

export default TarjetaPlato;
