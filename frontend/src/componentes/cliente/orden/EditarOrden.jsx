import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenerOrden, actualizarOrden } from "../../../servicios/ordenServicio";
import { cambiarCantidad, eliminarItem, calcularTotal, formatearPrecio } from "../../../servicios/carritoServicio";
import FilaItemCarrito from "../carrito/FilaItemCarrito";
import SelectorDesplegable from "../../compartido/ui/SelectorDesplegable";
import "../carrito/CarritoLleno.css";
import "./EditarOrden.css";

function EditarOrden() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [orden, setOrden] = useState(null);
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
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
        setItems(ordenObtenida.items || []); 
        setNotas(ordenObtenida.notas || "");
        setMetodoPago(ordenObtenida.metodo_pago || "efectivo"); 
      } catch (e) {
        if (activo) setError(e.message || "Error al cargar el pedido");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargarOrden();
    return () => { activo = false; };
  }, [id]);

  async function guardarCambios() {
    setGuardando(true);
    setError("");
    try {
      if (items.length === 0) throw new Error("El pedido no puede quedar sin platos.");
      await actualizarOrden(id, { items, notas, metodo_pago: metodoPago });
      navegar(`/orden/${id}`);
    } catch (e) {
      console.error("Error al guardar:", e);
      setError(e.message || "No se pudieron guardar los cambios.");
      setGuardando(false);
    }
  }

  if (cargando) return <div className="carrito-contenedor"><p className="editar-aviso">Cargando pedido...</p></div>;

  // Validación flexible: acepta "pendiente", "pending", "Pendiente", etc.
  const estadoActual = orden?.estado ? String(orden.estado).toLowerCase() : "";
  const puedeEditar = estadoActual === "pendiente" || estadoActual === "pending";

  if (!orden || !puedeEditar) {
    return (
      <div className="carrito-contenedor">
        <p className="editar-aviso">{error || "Este pedido ya está en preparación y no se puede editar."}</p>
        <button className="carrito-boton-secundario" type="button" onClick={() => navegar(`/orden/${id}`)}>
          Ver estado del pedido
        </button>
      </div>
    );
  }

  return (
    <div className="carrito-contenedor">
      <div className="carrito-encabezado">
        <button className="carrito-boton-volver" type="button" onClick={() => navegar(`/orden/${id}`)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="carrito-titulo">Editar pedido #{orden.id}</h1>
      </div>

      <div className="carrito-lista">
        {items.map((item) => (
          <FilaItemCarrito key={item.id} item={item} alCambiarCantidad={(itemId, cantidad) => setItems((actuales) => cambiarCantidad(actuales, itemId, cantidad))} alEliminar={(itemId) => setItems((actuales) => eliminarItem(actuales, itemId))} />
        ))}
      </div>

      {items.length === 0 && <p className="editar-aviso" style={{ color: "#ef4444", textAlign: "center", marginBottom: "1rem" }}>El pedido no puede quedar sin platos.</p>}

      <div className="carrito-campo">
        <label htmlFor="metodo-pago">Método de pago</label>
        <SelectorDesplegable value={metodoPago} onChange={setMetodoPago} options={[{ value: "efectivo", label: "Efectivo" }, { value: "transferencia", label: "Transferencia" }]} />
      </div>

      <div className="carrito-campo">
        <label htmlFor="notas-editar">Notas para la cocina</label>
        <textarea id="notas-editar" className="carrito-input" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>

      <div className="carrito-resumen">
        <span className="carrito-total-etiqueta">Total</span>
        <span className="carrito-total-valor">{formatearPrecio(calcularTotal(items))}</span>
      </div>

      {error && <p className="carrito-error">{error}</p>}

      <button className="carrito-boton-principal" type="button" onClick={guardarCambios} disabled={guardando || items.length === 0}>
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
      <button className="carrito-boton-secundario" type="button" onClick={() => navegar(`/orden/${id}`)}>Cancelar</button>
    </div>
  );
}

export default EditarOrden;