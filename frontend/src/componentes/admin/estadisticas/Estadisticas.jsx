import { useEffect, useState } from "react";
import { BarChart2, DollarSign, Package, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { obtenerEstadisticasPedidos } from "../../../servicios/pedidosServicio";
import "./Estadisticas.css";

const COLORES_CATEGORIA = ["#ed3949", "#f47755", "#f8a15f", "#df5b4f", "#f6bd7d"];

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

const prepararDias = (ventas, pedidos) => {
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

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activa = true;

    obtenerEstadisticasPedidos()
      .then((datos) => {
        if (activa) setEstadisticas(datos);
      })
      .catch((errorCarga) => {
        if (activa) setError(errorCarga.message || "No se pudieron cargar las estadísticas.");
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, []);

  const resumenSemana = estadisticas?.resumenSemana;
  const resumenMenu = estadisticas?.resumenMenu;
  const ventasSemanales = estadisticas?.ventasSemanales || [];
  const pedidosPorDia = estadisticas?.pedidosPorDia || [];
  const platosPopulares = estadisticas?.platosPopulares || [];
  const ventasPorCategoria = estadisticas?.ventasPorCategoria || [];
  const dias = prepararDias(ventasSemanales, pedidosPorDia);
  const maximoVendidos = Math.max(
    0,
    ...platosPopulares.map((plato) => Number(plato.cantidad_vendida || 0))
  );
  const hayVentas = dias.some((dia) => dia.ventas > 0);
  const hayPedidos = dias.some((dia) => dia.pedidos > 0);

  return (
    <main className="estadisticas-pagina">
      <header className="estadisticas-encabezado">
        <h1>Estadísticas y Analítica</h1>
        <p>Métricas y rendimiento del negocio</p>
      </header>

      {error && <p className="estadisticas-error" role="alert">{error}</p>}

      <section className="estadisticas-metricas" aria-label="Métricas del restaurante">
        <article className="estadistica-metrica">
          <DollarSign className="estadistica-metrica__icono" size={25} aria-hidden="true" />
          <div>
            <span className="estadistica-metrica__etiqueta">Ventas Totales</span>
            <strong className="estadistica-metrica__valor">
              {cargando || error ? "—" : formatearMoneda(resumenSemana?.ventas_totales)}
            </strong>
            <span className="estadistica-metrica__detalle">Últimos 7 días</span>
          </div>
        </article>

        <article className="estadistica-metrica">
          <BarChart2 className="estadistica-metrica__icono" size={25} aria-hidden="true" />
          <div>
            <span className="estadistica-metrica__etiqueta">Promedio Diario</span>
            <strong className="estadistica-metrica__valor">
              {cargando || error ? "—" : formatearMoneda(resumenSemana?.promedio_diario)}
            </strong>
            <span className="estadistica-metrica__detalle">Últimos 7 días</span>
          </div>
        </article>

        <article className="estadistica-metrica">
          <Package className="estadistica-metrica__icono" size={25} aria-hidden="true" />
          <div>
            <span className="estadistica-metrica__etiqueta">Platos en Menú</span>
            <strong className="estadistica-metrica__valor">
              {cargando || error ? "—" : Number(resumenMenu?.total_platos || 0)}
            </strong>
            <span className="estadistica-metrica__detalle">
              {cargando || error ? "" : `${Number(resumenMenu?.platos_disponibles || 0)} disponibles`}
            </span>
          </div>
        </article>

        <article className="estadistica-metrica">
          <TrendingUp className="estadistica-metrica__icono" size={25} aria-hidden="true" />
          <div>
            <span className="estadistica-metrica__etiqueta">Pedidos Totales</span>
            <strong className="estadistica-metrica__valor">
              {cargando || error ? "—" : Number(resumenSemana?.pedidos_totales || 0)}
            </strong>
            <span className="estadistica-metrica__detalle">Últimos 7 días</span>
          </div>
        </article>
      </section>

      <section className="estadisticas-graficas" aria-label="Actividad de los últimos siete días">
        <article className="estadisticas-panel estadisticas-grafica">
          <h2>Ventas por Día</h2>
          {cargando ? (
            <p className="estadisticas-estado">Cargando ventas...</p>
          ) : error ? null : !hayVentas ? (
            <p className="estadisticas-estado">No hay ventas registradas en los últimos 7 días.</p>
          ) : (
            <div className="estadisticas-grafica__lienzo">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dias} margin={{ top: 12, right: 14, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eaf0" strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tick={{ fill: "#737987", fontSize: 12 }} />
                  <YAxis
                    width={68}
                    tick={{ fill: "#737987", fontSize: 12 }}
                    tickFormatter={(valor) => Number(valor).toLocaleString("es-CO")}
                  />
                  <Tooltip formatter={(valor) => [formatearMoneda(valor), "Ventas"]} />
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
          )}
        </article>

        <article className="estadisticas-panel estadisticas-grafica">
          <h2>Pedidos por Día</h2>
          {cargando ? (
            <p className="estadisticas-estado">Cargando pedidos...</p>
          ) : error ? null : !hayPedidos ? (
            <p className="estadisticas-estado">No hay pedidos registrados en los últimos 7 días.</p>
          ) : (
            <div className="estadisticas-grafica__lienzo">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dias} margin={{ top: 12, right: 14, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eaf0" strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tick={{ fill: "#737987", fontSize: 12 }} />
                  <YAxis allowDecimals={false} width={42} tick={{ fill: "#737987", fontSize: 12 }} />
                  <Tooltip formatter={(valor) => [valor, "Pedidos"]} />
                  <Bar dataKey="pedidos" name="Pedidos" fill="#ed3949" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>

      <section className="estadisticas-detalle">
        <article className="estadisticas-panel estadisticas-top-platos">
          <h2>Top 5 Platos Más Vendidos</h2>
          {cargando ? (
            <p className="estadisticas-estado">Cargando platos...</p>
          ) : error ? null : platosPopulares.length === 0 ? (
            <p className="estadisticas-estado">No hay ventas de platos entregados para mostrar.</p>
          ) : (
            <div className="estadisticas-lista-platos">
              {platosPopulares.map((plato) => {
                const cantidad = Number(plato.cantidad_vendida || 0);
                const porcentaje = maximoVendidos ? (cantidad / maximoVendidos) * 100 : 0;

                return (
                  <div className="estadisticas-plato" key={plato.nombre}>
                    <div className="estadisticas-plato__cabecera">
                      <strong>{plato.nombre}</strong>
                      <span>{cantidad} ventas</span>
                    </div>
                    <div className="estadisticas-plato__barra" aria-label={`${cantidad} ventas`}>
                      <span style={{ width: `${porcentaje}%` }} />
                    </div>
                    <div className="estadisticas-plato__ingresos">
                      {formatearMoneda(plato.ingresos)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="estadisticas-panel estadisticas-categorias">
          <h2>Distribución por Categoría</h2>
          {cargando ? (
            <p className="estadisticas-estado">Cargando categorías...</p>
          ) : error ? null : ventasPorCategoria.length === 0 ? (
            <p className="estadisticas-estado">No hay platos categorizados en el menú.</p>
          ) : (
            <div className="estadisticas-categorias__lienzo">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(valor) => [`${valor} platos`, "En menú"]} />
                  <Pie
                    data={ventasPorCategoria}
                    dataKey="total"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius="54%"
                    paddingAngle={1}
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
                    isAnimationActive={false}
                  >
                    {ventasPorCategoria.map((categoria, indice) => (
                      <Cell
                        key={categoria.categoria}
                        fill={COLORES_CATEGORIA[indice % COLORES_CATEGORIA.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}