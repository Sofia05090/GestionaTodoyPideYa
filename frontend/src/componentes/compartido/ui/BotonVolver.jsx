// Flecha para volver a una pantalla concreta
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BotonVolver.css";

function BotonVolver({ destino, etiqueta = "Volver" }) {
  const navegar = useNavigate();

  return (
    <button
      className="boton-volver"
      type="button"
      onClick={() => navegar(destino)}
      aria-label={etiqueta}
    >
      <ArrowLeft size={20} />
    </button>
  );
}

export default BotonVolver;