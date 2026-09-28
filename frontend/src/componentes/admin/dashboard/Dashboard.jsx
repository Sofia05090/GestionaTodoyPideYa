// panel del administrador

// Primera pantalla que ve el admin después de iniciar sesión
// Tiene secciones:
//    Métricas del día
//    Lista de pedidos activos en tiempo real
//
// Solo mostramos pedidos pendientes o en preparación.

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, TrendingUp } from "lucide-react"; // estos iconos se usan en la parte de métricas del dashboard
import { obtenerPedidosActivos } from "../../../servicios/pedidosServicio";
import "./Dashboard.css"; 

function Dashboard() {
  //Estado del componente
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const totalVentasHoy = 0;
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarPedidos() {
      try {
        const pedidos = await obtenerPedidosActivos();
        if (activo) {
          setPedidosActivos(pedidos);
          setError("");
        }
      } catch (errorCarga) {
        if (activo) setError(errorCarga.message || "No se pudieron cargar los pedidos.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarPedidos();
    const intervalo = window.setInterval(cargarPedidos, 5000);

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
              ${totalVentasHoy.toLocaleString("es-CO")}
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

      {/*Lista de pedidos activos*/}
      <section className="dashboard-pedidos">
        <h2>Pedidos activos</h2>

        {/* casos: cargando / sin pedidos / la lista */}
        {cargando ? (
          <p className="estado-texto">Cargando pedidos...</p>
        ) : error ? (
          <p className="estado-texto">{error}</p>
        ) : pedidosActivos.length === 0 ? (
          <p className="estado-texto">No hay pedidos activos por ahora.</p>
        ) : (
          <div className="lista-pedidos">
            {pedidosActivos.map((pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                traducirEstado={traducirEstado}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// TarjetaPedido que muestra un pedido individual en la lista de pedidos activos

function TarjetaPedido({ pedido, traducirEstado }) {
  return (
    <div className="tarjeta-pedido">
      {/* Mesa y estado */}
      <div className="pedido-cabecera">
        <span className="pedido-mesa">Mesa {pedido.mesa}</span>
        <span className={`pedido-estado estado-${{ pendiente: "pending", preparando: "preparing", listo: "ready", entregado: "delivered" }[pedido.estado] || ""}`}>
          {traducirEstado(pedido.estado)}
        </span>
      </div>

      {/* Lista de platos del pedido */}
      <ul className="pedido-items">
        {pedido.items?.map((item, indice) => (
          <li key={indice}>
            {item.cantidad}x {item.nombre_plato} — $
            {Number(item.precio_venta).toLocaleString("es-CO")}
          </li>
        ))}
      </ul>

      {/* Nota del cliente (solo si escribió algo) */}
      {pedido.notas && (
        <p className="pedido-nota"> {pedido.notas}</p>
      )}

      {/* Total alineado a la derecha */}
      <p className="pedido-total">Total: ${Number(pedido.total || 0).toLocaleString("es-CO")}</p>
    </div>
  );
}

export default Dashboard;