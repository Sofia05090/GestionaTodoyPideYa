// [SOLO-WEB] Contador − cantidad +
import { Minus, Plus } from "lucide-react";
import "./ContadorCantidad.css";

function ContadorCantidad({ cantidad, alCambiar }) {
  return (
    <div className="contador">
      <button
        className="contador-boton"
        type="button"
        onClick={() => alCambiar(cantidad - 1)}
        aria-label="Quitar una unidad"
      >
        <Minus size={16} />
      </button>
      <span className="contador-valor">{cantidad}</span>
      <button
        className="contador-boton"
        type="button"
        onClick={() => alCambiar(cantidad + 1)}
        aria-label="Agregar una unidad"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export default ContadorCantidad;