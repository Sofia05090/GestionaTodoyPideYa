// [SOLO-WEB] Vista del carrito con productos: ajustar cantidades y confirmar el pedido
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCarrito } from "../../../hooks/useCarrito";
import { crearOrden } from "../../../servicios/ordenServicio";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import FilaItemCarrito from "./FilaItemCarrito";
import SelectorDesplegable from "../../compartido/ui/SelectorDesplegable";
import "./CarritoLleno.css";

function CarritoLleno() {
  const navegar = useNavigate();
  const { items, mesa, setMesa, cambiarCantidad, eliminar, vaciar, total } = useCarrito();

  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function confirmarPedido() {
    setEnviando(true);
    setError("");

    if (!mesa.trim()) {
      setError("Por favor, ingresa el número de mesa para poder entregar tu pedido.");
      setEnviando(false);
      return;
    }

    try {
      const itemsFormateados = items.map((item) => ({
        producto_id: Number(item.id), 
        cantidad: Number(item.cantidad),
        notas_item: "", 
      }));

      const orden = await crearOrden({ 
        mesa: mesa.trim(), 
        items: itemsFormateados, 
        notas,
        metodo_pago: metodoPago 
      });
      
      navegar(`/orden/${orden.id}`, { replace: true });
      vaciar();
    } catch (e) {
      setError(e.message || "No se pudo enviar el pedido.");
      setEnviando(false);
    }
  }

  return (
    <div className="carrito-contenedor">
      {/* Encabezado con degradado */}
      <div className="carrito-encabezado">
        <h1 className="carrito-titulo">Carrito</h1>
        <button
          className="carrito-boton-volver"
          onClick={() => navegar("/menu")}
          aria-label="Cerrar carrito"
        >
          <X size={24} />
        </button>
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
        <label>Mesa</label>
        <input
          className="carrito-input"
          type="text"
          value={mesa}
          onChange={(e) => setMesa(e.target.value)}
          placeholder="Ej: 5"
        />
      </div>

      <div className="carrito-campo">
        <label>Pago</label>
        <SelectorDesplegable
          value={metodoPago}
          onChange={setMetodoPago}
          options={[
            { value: "efectivo", label: "Efectivo" },
            { value: "transferencia", label: "Transferencia" },
          ]}
        />
      </div>

      <div className="carrito-campo">
        <label>NOTAS ESPECIALES</label>
        <textarea
          className="carrito-input"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: Sin cebolla, término medio..."
          style={{ resize: "none" }}
        />
      </div>

      {error && <p className="carrito-error">{error}</p>}

      <div className="carrito-resumen">
        <span className="carrito-total-etiqueta">TOTAL</span>
        <span className="carrito-total-valor">{formatearPrecio(total)}</span>
      </div>

      <button
        className="carrito-boton-principal"
        type="button"
        onClick={confirmarPedido}
        disabled={enviando}
      >
        {enviando ? "Enviando pedido..." : "Continuar pedido"}
      </button>

      <button className="carrito-boton-secundario" type="button" onClick={() => navegar("/menu")}>
        Seguir pidiendo
      </button>
    </div>
  );
}

export default CarritoLleno;