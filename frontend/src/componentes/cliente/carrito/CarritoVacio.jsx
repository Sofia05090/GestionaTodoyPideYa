// [SOLO-WEB] Vista del carrito sin productos
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import "./CarritoVacio.css";

function CarritoVacio() {
  const navegar = useNavigate();

  return (
    <div className="vacio-contenedor">
      <ShoppingCart size={64} className="vacio-icono" />
      <h1 className="vacio-titulo">Tu carrito está vacío</h1>
      <p className="vacio-texto">Agrega algunos platos del menú para empezar tu pedido.</p>
      <button className="vacio-boton" type="button" onClick={() => navegar("/menu")}>
        Ver menú
      </button>
    </div>
  );
}

export default CarritoVacio;