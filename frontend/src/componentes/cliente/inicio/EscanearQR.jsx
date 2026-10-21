// [SOLO-WEB] Por ahora la mesa se escribe a mano.
// Pendiente: lector de QR real (en React Native, con la cámara).
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import { useCarrito } from "../../../hooks/useCarrito";
import "./EscanearQR.css";

function EscanearQR() {
  const navegar = useNavigate();
  const { mesa, setMesa } = useCarrito();
  const [valor, setValor] = useState(mesa);

  function confirmar(evento) {
    evento.preventDefault();
    if (!valor.trim()) return;
    setMesa(valor.trim());
    navegar("/menu");
  }

  return (
    <div className="qr-contenedor">
      <div className="qr-tarjeta">
        <QrCode size={48} className="qr-icono" />
        <h1 className="qr-titulo">Tu mesa</h1>
        <p className="qr-texto">
          Aquí irá el lector del código QR. Por ahora escribe el número de tu mesa.
        </p>

        <form onSubmit={confirmar}>
          <input
            className="qr-input"
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ej: 5"
          />
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