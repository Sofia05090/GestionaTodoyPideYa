import { useState, useEffect } from "react";
import "./PedidosActivos.css";
import SelectorDesplegable from "../../compartido/ui/SelectorDesplegable";
import {
  obtenerPedidosActivos,
  actualizarEstadoPedido,
} from "../../../servicios/pedidosServicio";

// Iconos vectoriales inline para mantener el diseño exacto sin dependencias externas
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

export default function PedidosActivos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargandoEstado, setCargandoEstado] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  const formatearHora = (fecha) => {
    if (!fecha) return "--:--";

    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return "--:--";

    return fechaObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(valor || 0));

  const obtenerEstadoTexto = (estado) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "preparando":
        return "En preparación";
      case "listo":
        return "Listo";
      case "entregado":
        return "Entregado";
      default:
        return estado || "Desconocido";
    }
  };

  const getEstadoClase = (estado) => {
    switch (estado) {
      case "pendiente":
        return "pedido-card--pendiente";
      case "preparando":
        return "pedido-card--preparando";
      case "listo":
        return "pedido-card--listo";
      default:
        return "";
    }
  };

  const borrarPedidoEntregado = (id) => {
    setPedidos((actual) => actual.filter((pedido) => pedido.id !== id));
    if (pedidoSeleccionado?.id === id) {
      setPedidoSeleccionado(null);
    }
  };

  const manejarCambioEstado = async (id, nuevoEstado) => {
    setCargandoEstado(true);

    try {
      await actualizarEstadoPedido(id, nuevoEstado);

      if (nuevoEstado === "entregado") {
        borrarPedidoEntregado(id);
        return;
      }

      setPedidos((actual) =>
        actual.map((pedido) =>
          pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido
        )
      );

      setPedidoSeleccionado((actual) =>
        actual && actual.id === id ? { ...actual, estado: nuevoEstado } : actual
      );
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      alert(error.message || "No se pudo actualizar el estado del pedido.");
    } finally {
      setCargandoEstado(false);
    }
  };

  useEffect(() => {
    let activo = true;

    obtenerPedidosActivos()
      .then((datos) => {
        if (activo) {
          setPedidos(datos);
          setErrorCarga("");
        }
      })
      .catch((error) => {
        if (activo) {
          console.error("Error cargando pedidos activos:", error);
          setErrorCarga(error.message || "No se pudieron cargar los pedidos.");
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // Métricas para los KPIs superiores
  const totalPendientes = pedidos.filter((p) => p.estado === "pendiente").length;
  const totalPreparando = pedidos.filter((p) => p.estado === "preparando").length;
  const totalListos = pedidos.filter((p) => p.estado === "listo").length;
  const totalEntregadosHoy = 0;

  // Filtrado dinámico
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "todos") return true;
    return p.estado === filtro;
  });

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "preparando":
        return <span className="badge badge-preparando">En preparación</span>;
      case "pendiente":
        return <span className="badge badge-pendiente">Pendiente</span>;
      case "listo":
        return <span className="badge badge-listo">Listo</span>;
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  return (
    <div className="pedidos-container">
      {/* Encabezado del Módulo */}
      <div className="pedidos-header">
        <div>
          <h1 className="pedidos-title">Pedidos Activos</h1>
          <p className="pedidos-subtitle">Gestiona los pedidos en tiempo real</p>
        </div>
        <div className="pedidos-filtro">
          <SelectorDesplegable
            value={filtro}
            onChange={setFiltro}
            ariaLabel="Filtrar pedidos por estado"
            className="select-filtro-contenedor"
            options={[
              { value: "todos", label: "Todos los pedidos" },
              { value: "pendiente", label: "Pendientes" },
              { value: "preparando", label: "En preparación" },
              { value: "listo", label: "Listos" },
              { value: "entregado", label: "Entregados" },
            ]}
          />
        </div>
      </div>

      {/* Tarjetas KPI Superiores */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-number">{totalPendientes}</span>
          <span className="kpi-label">Pendientes</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-number">{totalPreparando}</span>
          <span className="kpi-label">En preparación</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-number">{totalListos}</span>
          <span className="kpi-label">Listos</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-number">{totalEntregadosHoy}</span>
          <span className="kpi-label">Entregados hoy</span>
        </div>
      </div>

      {/* Grid de Comandas / Pedidos */}
      <div className="pedidos-grid">
        {pedidosFiltrados.map((pedido) => (
          <div
            key={pedido.id}
            className={`pedido-card ${getEstadoClase(pedido.estado)}`}
            onClick={() => setPedidoSeleccionado(pedido)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setPedidoSeleccionado(pedido);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {/* Header de la tarjeta */}
            <div className="pedido-card-header">
              <span className="pedido-codigo">ORD-{String(pedido.id).padStart(3, "0")}</span>
              {getEstadoBadge(pedido.estado)}
            </div>
            <div className="pedido-mesa">{pedido.mesa}</div>

            {/* Ítems del pedido */}
            <div className="pedido-items-list">
              {pedido.items.map((item, idx) => (
                <div key={idx} className="pedido-item-row">
                  <span className="item-nombre">
                    {item.cantidad}x {item.nombre_plato || item.nombre}
                  </span>
                  <span className="item-precio">
                    {formatearMoneda((item.precio_venta ?? item.precio) * (item.cantidad ?? 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="pedido-divider" />

            {/* Detalles del cliente / horario / método de pago */}
            <div className="pedido-detalles">
              <div className="detalle-linea">
                <ClockIcon />
                <span>{formatearHora(pedido.creado_en)}</span>
              </div>
              <div className="detalle-linea">
                <UserIcon />
                <span>Mesero</span>
              </div>
              <div className="detalle-linea pago-linea">
                <div className="pago-metodo">
                  <CardIcon />
                  <span>{pedido.metodo_pago || "Efectivo"}</span>
                </div>
                <span className="pago-total">{formatearMoneda(pedido.total)}</span>
              </div>
            </div>
          </div>
        ))}
        {errorCarga ? (
          <p className="pedidos-vacio pedidos-vacio--error">
            No se pudieron cargar los pedidos: {errorCarga}
          </p>
        ) : pedidosFiltrados.length === 0 ? (
          <p className="pedidos-vacio">
            {filtro === "entregado"
              ? "Los pedidos entregados se consultan en Historial y no aparecen en Pedidos Activos."
              : "No hay pedidos activos. Los pedidos nuevos aparecerán aquí cuando se registren."}
          </p>
        ) : null}
      </div>

      {pedidoSeleccionado && (
        <div className="pedido-modal-backdrop" onClick={() => setPedidoSeleccionado(null)}>
          <div
            className="pedido-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setPedidoSeleccionado(null)}
              aria-label="Cerrar detalle del pedido"
            >
              ×
            </button>

            <h2 className="modal-title">Detalle del Pedido ORD-{String(pedidoSeleccionado.id).padStart(3, "0")}</h2>

            <div className="modal-grid">
              <div className="modal-field">
                <label>Mesa</label>
                <p>{pedidoSeleccionado.mesa}</p>
              </div>

              <div className="modal-field">
                <label>Mesero</label>
                <p>Mesero asignado</p>
              </div>

              <div className="modal-field">
                <label>Hora</label>
                <p>{formatearHora(pedidoSeleccionado.creado_en)}</p>
              </div>

              <div className="modal-field">
                <label>Pago</label>
                <p>{pedidoSeleccionado.metodo_pago || "Efectivo"}</p>
              </div>
            </div>

            <div className="modal-items-header">Platos</div>

            <div className="modal-items">
              {pedidoSeleccionado.items.map((item, idx) => (
                <div key={idx} className="modal-item-row">
                  <span>{item.cantidad}x {item.nombre_plato || item.nombre}</span>
                  <strong>{formatearMoneda((item.precio_venta ?? item.precio) * (item.cantidad ?? 1))}</strong>
                </div>
              ))}
            </div>

            {pedidoSeleccionado.notas && (
              <div className="modal-notes-block">
                <label>Notas del cliente</label>
                <p>{pedidoSeleccionado.notas}</p>
              </div>
            )}

            <div className="modal-total-row">
              <span>Total</span>
              <strong>{formatearMoneda(pedidoSeleccionado.total)}</strong>
            </div>

            <div className="modal-status-block">
              <label>Cambiar estado</label>

              <div className="modal-status-grid">
                {["pendiente", "preparando", "listo", "entregado"].map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    className={`status-btn ${pedidoSeleccionado.estado === estado ? "status-btn--active" : ""}`}
                    onClick={() => manejarCambioEstado(pedidoSeleccionado.id, estado)}
                    disabled={cargandoEstado}
                  >
                    {obtenerEstadoTexto(estado)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}