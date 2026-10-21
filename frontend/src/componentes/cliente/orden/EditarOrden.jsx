// [SOLO-WEB] Editar un pedido que todavía está "En espera"
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenerOrden, actualizarOrden } from "../../../servicios/ordenServicio";
import {
  cambiarCantidad,
  eliminarItem,
  calcularTotal,
  formatearPrecio,
} from "../../../servicios/carritoServicio";
import FilaItemCarrito from "../carrito/FilaItemCarrito";
import "../carrito/CarritoLleno.css";
import "./EditarOrden.css";

function EditarOrden() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [orden, setOrden] = useState(null);
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarOrden() {
      try {
        const ordenObtenida = await obtenerOrden(id);
        if (!activo) return;
        setOrden(ordenObtenida);
        setItems(ordenObtenida.items);
        setNotas(ordenObtenida.notas);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarOrden();

    return () => {
      activo = false;
    };
  }, [id]);

  async function guardarCambios() {
    setGuardando(true);
    setError("");

    try {
      await actualizarOrden(id, { items, notas });
      navegar(`/orden/${id}`);
    } catch (e) {
      setError(e.message || "No se pudieron guardar los cambios.");
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="carrito-contenedor">
        <p className="editar-aviso">Cargando pedido...</p>
      </div>
    );
  }

  if (!orden || orden.estado !== "pending") {
    return (
      <div className="carrito-contenedor">
        <p className="editar-aviso">
          {error || "Este pedido ya está en preparación y no se puede editar."}
        </p>
        <button
          className="carrito-boton-secundario"
          type="button"
          onClick={() => navegar(`/orden/${id}`)}
        >
          Ver estado del pedido
        </button>
      </div>
    );
  }

  return (
    <div className="carrito-contenedor">
      <div className="carrito-encabezado">
        <button
          className="carrito-boton-volver"
          type="button"
          onClick={() => navegar(`/orden/${id}`)}
          aria-label="Volver al estado del pedido"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="carrito-titulo">Editar pedido #{orden.id}</h1>
      </div>

      <div className="carrito-lista">
        {items.map((item) => (
          <FilaItemCarrito
            key={item.id}
            item={item}
            alCambiarCantidad={(itemId, cantidad) =>
              setItems((actuales) => cambiarCantidad(actuales, itemId, cantidad))
            }
            alEliminar={(itemId) => setItems((actuales) => eliminarItem(actuales, itemId))}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="editar-aviso">El pedido no puede quedar sin platos.</p>
      )}

      <div className="carrito-campo">
        <label htmlFor="notas-editar">Notas para la cocina</label>
        <textarea
          id="notas-editar"
          className="carrito-input"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <div className="carrito-resumen">
        <span className="carrito-total-etiqueta">Total</span>
        <span className="carrito-total-valor">{formatearPrecio(calcularTotal(items))}</span>
      </div>

      {error && <p className="carrito-error">{error}</p>}

      <button
        className="carrito-boton-principal"
        type="button"
        onClick={guardarCambios}
        disabled={guardando || items.length === 0}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
      <button
        className="carrito-boton-secundario"
        type="button"
        onClick={() => navegar(`/orden/${id}`)}
      >
        Cancelar
      </button>
    </div>
  );
}

export default EditarOrden;