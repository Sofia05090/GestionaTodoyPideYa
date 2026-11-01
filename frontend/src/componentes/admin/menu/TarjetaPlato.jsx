// Esta tarjeta muestra la información de un plato del menu:
// su imagen, nombre, categoria, descripción, precio y disponibilidad
// También tiene botones para editarlo o eliminarlo

import { useState } from "react";
import { Pencil, Trash2, ImageOff, CheckCircle } from "lucide-react";
import "./TarjetaPlato.css";

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

function TarjetaPlato({ plato, alEditar, alEliminar }) {
  return (
    <div className="tarjeta-plato">

      {/* Imagen y aviso de disponibilidad */}
      <div className="tarjeta-plato__imagen-contenedor">

        <ImagenTarjeta key={plato.urlImagen} src={plato.urlImagen} alt={plato.nombre} />

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
          onClick={() => alEditar({ ...plato, soloToggle: true, disponible: !plato.disponible })}
        >
          <CheckCircle size={15} />
          {plato.disponible ? "Disponible — clic para agotar" : "Agotado — clic para activar"}
        </button>
      </div>

      {/* Precio y botones de accion */}
      <div className="tarjeta-plato__pie">
        <span className="tarjeta-plato__precio">
          {formatearMoneda(plato.precio)}
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

function ImagenTarjeta({ src, alt }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="tarjeta-plato__sin-imagen">
        <ImageOff size={40} color="#CCCCCC" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="tarjeta-plato__imagen"
      onError={() => setError(true)}
    />
  );
}

export default TarjetaPlato;
