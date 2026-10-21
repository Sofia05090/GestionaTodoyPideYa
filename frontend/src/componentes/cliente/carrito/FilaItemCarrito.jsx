// [SOLO-WEB] Fila de un plato con botones para cambiar cantidad o quitarlo
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import "./CarritoLleno.css";

function FilaItemCarrito({ item, alCambiarCantidad, alEliminar }) {
  return (
    <div className="carrito-item">
      <div className="carrito-item-info">
        <p className="carrito-item-nombre">{item.nombre}</p>
        <p className="carrito-item-precio">
          {formatearPrecio(item.precio)} c/u · {formatearPrecio(item.precio * item.cantidad)}
        </p>
      </div>

      <div className="carrito-item-controles">
        <button
          className="carrito-boton-cantidad"
          type="button"
          onClick={() => alCambiarCantidad(item.id, item.cantidad - 1)}
          aria-label="Quitar una unidad"
        >
          <Minus size={14} />
        </button>
        <span className="carrito-cantidad">{item.cantidad}</span>
        <button
          className="carrito-boton-cantidad"
          type="button"
          onClick={() => alCambiarCantidad(item.id, item.cantidad + 1)}
          aria-label="Agregar una unidad"
        >
          <Plus size={14} />
        </button>
        <button
          className="carrito-boton-eliminar"
          type="button"
          onClick={() => alEliminar(item.id)}
          aria-label="Eliminar plato"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default FilaItemCarrito;