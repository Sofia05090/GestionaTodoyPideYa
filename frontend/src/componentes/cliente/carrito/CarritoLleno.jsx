// [SOLO-WEB] Vista del carrito con productos: ajustar cantidades y confirmar el pedido
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCarrito } from "../../../hooks/useCarrito";
import { crearOrden } from "../../../servicios/ordenServicio";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import FilaItemCarrito from "./FilaItemCarrito";
import "./CarritoLleno.css";

function CarritoLleno() {
  const navegar = useNavigate();
  const { items, mesa, setMesa, cambiarCantidad, eliminar, vaciar, total } = useCarrito();

  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function confirmarPedido() {
    setEnviando(true);
    setError("");

    try {
      // la mesa es opcional: si está vacía, el pedido se envía igual
      const orden = await crearOrden({ mesa: mesa.trim(), items, notas });
      navegar(`/orden/${orden.id}`, { replace: true });
      vaciar();
    } catch (e) {
      setError(e.message || "No se pudo enviar el pedido.");
      setEnviando(false);
    }
  }

  return (
    <div className="carrito-contenedor">
      <div className="carrito-encabezado">
        <button
          className="carrito-boton-volver"
          type="button"
          onClick={() => navegar("/menu")}
          aria-label="Volver al menú"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="carrito-titulo">Tu pedido</h1>
      </div>

      <div className="carrito-lista">
        {items.map((item) => (
          <FilaItemCarrito
            key={item.id}
            item={item}
            alCambiarCantidad={cambiarCantidad}
            alEliminar={eliminar}
          />
        ))}
      </div>

      <div className="carrito-campo">
        <label htmlFor="mesa">Número de mesa (opcional)</label>
        <input
          id="mesa"
          className="carrito-input"
          type="text"
          value={mesa}
          onChange={(e) => setMesa(e.target.value)}
          placeholder="Ej: 5"
        />
      </div>

      <div className="carrito-campo">
        <label htmlFor="notas">Notas para la cocina (opcional)</label>
        <textarea
          id="notas"
          className="carrito-input"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Sin cebolla, bien cocido..."
        />
      </div>

      <div className="carrito-resumen">
        <span className="carrito-total-etiqueta">Total</span>
        <span className="carrito-total-valor">{formatearPrecio(total)}</span>
      </div>

      {error && <p className="carrito-error">{error}</p>}

      <button
        className="carrito-boton-principal"
        type="button"
        onClick={confirmarPedido}
        disabled={enviando}
      >
        {enviando ? "Enviando pedido..." : "Confirmar pedido"}
      </button>
      <button className="carrito-boton-secundario" type="button" onClick={() => navegar("/menu")}>
        Seguir pidiendo
      </button>
    </div>
  );
}

export default CarritoLleno;