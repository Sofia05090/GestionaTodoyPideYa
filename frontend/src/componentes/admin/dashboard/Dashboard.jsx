// panel del administrador

// Primera pantalla que ve el admin después de iniciar sesión
// Tiene métricas del día, gráficas semanales y pedidos recientes.

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import {
  obtenerPedidosActivos,
  obtenerPedidosRecientes,
  obtenerEstadisticasPedidos,
} from "../../../servicios/pedidosServicio";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Dashboard.css"; 

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

const obtenerClaveFecha = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const prepararDatosSemanales = (ventas, pedidos) => {
  const ventasPorFecha = new Map(
    ventas.map((registro) => [String(registro.fecha).slice(0, 10), Number(registro.total || 0)])
  );
  const pedidosPorFecha = new Map(
    pedidos.map((registro) => [String(registro.fecha).slice(0, 10), Number(registro.total || 0)])
  );

  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 6 + indice);
    const clave = obtenerClaveFecha(fecha);

    return {
      fecha: clave,
      etiqueta: fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
      ventas: ventasPorFecha.get(clave) || 0,
      pedidos: pedidosPorFecha.get(clave) || 0,
    };
  });
};

function Dashboard() {
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const totalVentasHoy = estadisticas?.totalesHoy?.ingresos_totales || 0;

  useEffect(() => {
    let activo = true;

    async function cargarDashboard() {
      try {
        const [activos, recientes, resumen] = await Promise.all([
          obtenerPedidosActivos(),
          obtenerPedidosRecientes(),
          obtenerEstadisticasPedidos(),
        ]);
        if (activo) {
          setPedidosActivos(activos);
          setPedidosRecientes(recientes);
          setEstadisticas(resumen);
          setError("");
        }
      } catch (errorCarga) {
        if (activo) setError(errorCarga.message || "No se pudo cargar el dashboard.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDashboard();
    const intervalo = window.setInterval(cargarDashboard, 30000);

    return () => {
      activo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  // Traduce los estados del backend para mostrarlos en el panel.
  function traducirEstado(estado) {
    const traducciones = {
      pendiente: "En espera",
      preparando: "Preparando",
      listo: "Listo",
      entregado: "Entregado",
    };
    return traducciones[estado] || estado;
  }

  //Pedidos que todavía no se han puesto a preparar
  const pedidosEnEspera = pedidosActivos.filter(
    (pedido) => pedido.estado === "pendiente",
  ).length;
  const datosSemanales = prepararDatosSemanales(
    estadisticas?.ventasSemanales || [],
    estadisticas?.pedidosPorDia || []
  );

  return (
    <div className="dashboard-contenedor">
      {/* Encabezado de la sección */}
      <div className="dashboard-encabezado">
        <h1>Dashboard</h1>
        <p>Resumen del día en tiempo real</p>
      </div>

      {/*Tarjetas de métricas*/}
      <section className="dashboard-metricas">
        <div className="metrica-card">
          <DollarSign size={24} className="metrica-icono" />
          <div>
            <p className="metrica-etiqueta">Ventas del Dia</p>
            <p className="metrica-numero">
              {formatearMoneda(totalVentasHoy)}
            </p>
          </div>
        </div>

        <div className="metrica-card">
          <ShoppingBag size={24} className="metrica-icono" />
          <div>
            <p className="metrica-etiqueta">Pedidos activos</p>
            <p className="metrica-numero">{pedidosActivos.length}</p>
          </div>
        </div>

        <div className="metrica-card">
          <TrendingUp size={24} className="metrica-icono" />
          <div>
            <p className="metrica-etiqueta">Pedidos en espera</p>
            <p className="metrica-numero">{pedidosEnEspera}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-graficas" aria-label="Resumen semanal">
        <article className="dashboard-panel dashboard-grafica">
          <h2>Ventas de la Semana</h2>
          <div className="dashboard-grafica__lienzo">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosSemanales} margin={{ top: 12, right: 14, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e8eaf0" strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" tick={{ fill: "#737987", fontSize: 12 }} />
                <YAxis
                  width={64}
                  tick={{ fill: "#737987", fontSize: 12 }}
                  tickFormatter={(valor) => Number(valor).toLocaleString("es-CO")}
                />
                <Tooltip
                  formatter={(valor) => [formatearMoneda(valor), "Ventas"]}
                  labelFormatter={(etiqueta) => etiqueta}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="#f15b50"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel dashboard-grafica">
          <h2>Pedidos por Día</h2>
          <div className="dashboard-grafica__lienzo">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosSemanales} margin={{ top: 12, right: 14, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e8eaf0" strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" tick={{ fill: "#737987", fontSize: 12 }} />
                <YAxis allowDecimals={false} width={44} tick={{ fill: "#737987", fontSize: 12 }} />
                <Tooltip formatter={(valor) => [valor, "Pedidos"]} />
                <Bar dataKey="pedidos" name="Pedidos" fill="#f47b56" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-panel dashboard-recientes">
        <h2>Pedidos Recientes</h2>
        {cargando ? (
          <p className="estado-texto">Cargando pedidos recientes...</p>
        ) : error ? (
          <p className="estado-texto">{error}</p>
        ) : pedidosRecientes.length === 0 ? (
          <p className="estado-texto">Todavía no hay pedidos registrados.</p>
        ) : (
          <div className="lista-recientes">
            {pedidosRecientes.map((pedido) => (
              <article className="pedido-reciente" key={pedido.id}>
                <div className="pedido-reciente__descripcion">
                  <strong>ORD-{String(pedido.id).padStart(3, "0")} - Mesa {pedido.mesa}</strong>
                  <span>
                    {pedido.cantidad_platos} plato(s) · {new Date(pedido.creado_en).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </span>
                </div>
                <div className="pedido-reciente__importe">
                  <strong>{formatearMoneda(pedido.total)}</strong>
                  <span>{pedido.metodo_pago || "—"}</span>
                </div>
                <span className={`pedido-reciente__estado pedido-reciente__estado--${pedido.estado}`}>
                  {traducirEstado(pedido.estado)}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;