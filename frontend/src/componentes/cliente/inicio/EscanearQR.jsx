import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import { useCarrito } from "../../../hooks/useCarrito";
import "./EscanearQR.css";

function EscanearQR() {
  const navegar = useNavigate();
  const { setMesa } = useCarrito();
  const [valor, setValor] = useState("");
  const [error, setError] = useState("");

  function confirmar(evento) {
    evento.preventDefault();
    
    if (!valor.trim()) {
      setError("Debes ingresar tu número de mesa para continuar.");
      return;
    }
    
    setMesa(valor.trim());
    navegar("/menu");
  }

  return (
    <div className="qr-contenedor">
      <div className="qr-tarjeta">
        <QrCode size={48} className="qr-icono" />
        <h1 className="qr-titulo">Tu mesa</h1>
        <p className="qr-texto">
          Escribe el número de tu mesa
        </p>

        <form onSubmit={confirmar}>
          <input
            className="qr-input"
            type="text"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setError("");
            }}
            placeholder="Ej: 5"
          />
          {error && <p style={{ color: "#d4380d", fontSize: "0.85rem", marginBottom: "10px" }}>{error}</p>}
          <button className="qr-boton" type="submit">
            Continuar al menú
          </button>
        </form>

        <button className="qr-boton-volver" type="button" onClick={() => navegar("/")}>
          Volver
        </button>
      </div>
    </div>
  );
}

export default EscanearQR;