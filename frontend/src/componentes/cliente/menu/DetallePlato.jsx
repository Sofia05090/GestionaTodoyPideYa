// [SOLO-WEB] Ventana con la información ampliada de un plato
import { useEffect } from "react";
import { X } from "lucide-react";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import ContadorCantidad from "../../compartido/ui/ContadorCantidad";
import ImagenPlato from "./ImagenPlato";
import "./DetallePlato.css";

function DetallePlato({ producto, cantidad, alAgregar, alCambiarCantidad, alCerrar }) {
  // cierra con Esc y evita que la página de atrás haga scroll mientras está abierta
  useEffect(() => {
    function alTeclear(evento) {
      if (evento.key === "Escape") alCerrar();
    }

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alTeclear);

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alTeclear);
    };
  }, [alCerrar]);

  return (
    <div className="detalle-fondo" onClick={alCerrar}>
      <div
        className="detalle-panel"
        role="dialog"
        aria-modal="true"
        aria-label={producto.nombre}
        onClick={(evento) => evento.stopPropagation()}
      >
        <button className="detalle-cerrar" type="button" onClick={alCerrar} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="detalle-imagen">
          <ImagenPlato src={producto.imagen} alt={producto.nombre} />
        </div>

        {/* esta zona es la única que hace scroll */}
        <div className="detalle-cuerpo">
          <span className="detalle-categoria">{producto.categoria}</span>
          <h2 className="detalle-nombre">{producto.nombre}</h2>
          <p className="detalle-precio">{formatearPrecio(producto.precio)}</p>

          <p className="detalle-descripcion">{producto.descripcion}</p>

          {/* campos opcionales: solo se muestran si el plato los trae */}
          {producto.ingredientes?.length > 0 && (
            <div className="detalle-bloque">
              <h3>Ingredientes</h3>
              <p>{producto.ingredientes.join(", ")}</p>
            </div>
          )}

          {producto.tiempoPreparacion && (
            <div className="detalle-bloque">
              <h3>Tiempo de preparación</h3>
              <p>{producto.tiempoPreparacion}</p>
            </div>
          )}
        </div>

        {/* el botón queda fijo abajo, siempre visible */}
        <div className="detalle-accion">
          {!producto.disponible ? (
            <span className="detalle-agotado">Este plato está agotado por ahora</span>
          ) : cantidad === 0 ? (
            <button className="detalle-boton-agregar" type="button" onClick={alAgregar}>
              Agregar al pedido
            </button>
          ) : (
            <>
              <ContadorCantidad cantidad={cantidad} alCambiar={alCambiarCantidad} />
              <button className="detalle-boton-listo" type="button" onClick={alCerrar}>
                Listo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetallePlato;