import { useEffect, useState } from "react";
import { Eye, Search, X } from "lucide-react";
import { obtenerHistorialPedidos } from "../../../servicios/pedidosServicio";
import SelectorDesplegable from "../../compartido/ui/SelectorDesplegable";
import "./HistorialPedidos.css";

const formatearId = (id) => `ORD-${String(id).padStart(3, "0")}`;

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

const formatearFecha = (fecha) => {
  if (!fecha) return { fecha: "—", hora: "—" };
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return { fecha: "—", hora: "—" };

  return {
    fecha: valor.toLocaleDateString("es-ES"),
    hora: valor.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

const obtenerMesero = (pedido) => pedido.mesero || pedido.nombre_mesero || "—";

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  preparando: "En preparación",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarHistorial = async () => {
      try {
        const datos = await obtenerHistorialPedidos();
        if (activo) setPedidos(datos);
      } catch (errorCarga) {
        if (activo) setError(errorCarga.message || "No se pudo cargar el historial.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarHistorial();
    return () => {
      activo = false;
    };
  }, []);

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const consulta = normalizarTexto(busqueda);
    const coincideBusqueda = [
      formatearId(pedido.id),
      pedido.id,
      pedido.mesa,
      obtenerMesero(pedido),
    ].some((valor) => normalizarTexto(valor).includes(consulta));
    const coincideEstado = filtroEstado === "todos" || pedido.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const ingresosTotales = pedidos.reduce(
    (acumulado, pedido) => acumulado + Number(pedido.total || 0),
    0
  );
  const promedioPedido = pedidos.length ? ingresosTotales / pedidos.length : 0;

  return (
    <section className="historial-pedidos">
      <header className="historial-encabezado">
        <h1>Historial de Pedidos</h1>
        <p>Consulta todos los pedidos realizados</p>
      </header>

      <div className="historial-resumen" aria-label="Resumen del historial">
        <article className="historial-resumen-card">
          <strong>{pedidos.length}</strong>
          <span>Total de pedidos</span>
        </article>
        <article className="historial-resumen-card">
          <strong>{formatearMoneda(ingresosTotales)}</strong>
          <span>Ingresos totales</span>
        </article>
        <article className="historial-resumen-card">
          <strong>{formatearMoneda(promedioPedido)}</strong>
          <span>Promedio por pedido</span>
        </article>
      </div>

      <div className="historial-filtros">
        <label className="historial-busqueda">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por ID, mesa o mesero..."
            aria-label="Buscar por ID, mesa o mesero"
          />
        </label>
        <SelectorDesplegable
          value={filtroEstado}
          onChange={setFiltroEstado}
          ariaLabel="Filtrar por estado"
          className="historial-select"
          options={[
            { value: "todos", label: "Todos los estados" },
            { value: "pendiente", label: "Pendiente" },
            { value: "preparando", label: "En preparación" },
            { value: "listo", label: "Listo" },
            { value: "entregado", label: "Entregado" },
          ]}
        />
      </div>

      <section className="historial-tabla-panel" aria-labelledby="historial-tabla-titulo">
        <h2 id="historial-tabla-titulo">Pedidos</h2>
        {cargando ? (
          <p className="historial-mensaje">Cargando historial...</p>
        ) : error ? (
          <p className="historial-mensaje historial-mensaje--error">
            No se pudo cargar el historial: {error}
          </p>
        ) : pedidosFiltrados.length === 0 ? (
          <p className="historial-mensaje">
            {pedidos.length === 0
              ? "Todavía no hay pedidos finalizados para mostrar."
              : "No hay pedidos que coincidan con la búsqueda."}
          </p>
        ) : (
          <div className="historial-tabla-scroll">
            <table className="historial-tabla">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Mesa</th>
                  <th scope="col">Mesero</th>
                  <th scope="col">Fecha/Hora</th>
                  <th scope="col">Total</th>
                  <th scope="col">Pago</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => {
                  const fecha = formatearFecha(pedido.creado_en);
                  return (
                    <tr key={pedido.id}>
                      <td>{formatearId(pedido.id)}</td>
                      <td>{pedido.mesa || "—"}</td>
                      <td>{obtenerMesero(pedido)}</td>
                      <td>
                        <span className="historial-fecha">{fecha.fecha}</span>
                        <span className="historial-hora">{fecha.hora}</span>
                      </td>
                      <td className="historial-total">{formatearMoneda(pedido.total)}</td>
                      <td>{pedido.metodo_pago || "—"}</td>
                      <td>
                        <span className={`historial-estado historial-estado--${pedido.estado}`}>
                          {ETIQUETAS_ESTADO[pedido.estado] || pedido.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="historial-ver-detalle"
                          type="button"
                          onClick={() => setPedidoSeleccionado(pedido)}
                          aria-label={`Ver detalle de ${formatearId(pedido.id)}`}
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pedidoSeleccionado && (
        <div className="historial-modal-fondo" onClick={() => setPedidoSeleccionado(null)}>
          <section
            className="historial-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="historial-modal-titulo"
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              className="historial-modal-cerrar"
              type="button"
              onClick={() => setPedidoSeleccionado(null)}
              aria-label="Cerrar detalle"
            >
              <X size={20} />
            </button>
            <h2 id="historial-modal-titulo">Detalle del pedido {formatearId(pedidoSeleccionado.id)}</h2>
            <div className="historial-modal-datos">
              <p><span>Mesa</span><strong>{pedidoSeleccionado.mesa || "—"}</strong></p>
              <p><span>Mesero</span><strong>{obtenerMesero(pedidoSeleccionado)}</strong></p>
              <p><span>Fecha/Hora</span><strong>{formatearFecha(pedidoSeleccionado.creado_en).fecha} {formatearFecha(pedidoSeleccionado.creado_en).hora}</strong></p>
              <p><span>Pago</span><strong>{pedidoSeleccionado.metodo_pago || "—"}</strong></p>
            </div>
            <h3>Platos</h3>
            <div className="historial-modal-items">
              {(pedidoSeleccionado.items || []).map((item, indice) => (
                <div key={`${pedidoSeleccionado.id}-${indice}`}>
                  <span>{item.cantidad}x {item.nombre_plato}</span>
                  <strong>{formatearMoneda(Number(item.precio_venta || 0) * Number(item.cantidad || 0))}</strong>
                </div>
              ))}
            </div>
            {pedidoSeleccionado.notas && (
              <p className="historial-modal-notas"><span>Notas del cliente</span>{pedidoSeleccionado.notas}</p>
            )}
            <div className="historial-modal-total">
              <span>Total</span>
              <strong>{formatearMoneda(pedidoSeleccionado.total)}</strong>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
