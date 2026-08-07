// panel del administrador

// Primera pantalla que ve el admin después de iniciar sesión.
// Tiene secciones:
//    Métricas del día
//    Lista de pedidos activos en tiempo real
//
// Solo mostramos pedidos "pending" o "preparing".
// "ready" y "delivered" se manejan en otro módulo.

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { ShoppingBag, DollarSign, Clock } from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  //Estado del componente
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [totalVentasHoy, setTotalVentasHoy] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Consultamos pedidos activos ordenados del más reciente para mostrarlos
    const consultaPedidosActivos = query(
      collection(db, "ordenes"),
      where("status", "in", ["pending", "preparing"]),
      orderBy("createdAt", "desc"),
    );

    // con onSnapshot mantenemos una conexión permanente con Firestore
    const detenerEscucha = onSnapshot(consultaPedidosActivos, (resultado) => {
      // doc.id es el ID del documento; doc.data() trae los campos
      const listaNueva = resultado.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPedidosActivos(listaNueva);
      setCargando(false); //le quitamos el Cargando
    });

    // Detener la escucha evita errores de memoria después de cerrar sesión.
    return () => detenerEscucha();
  }, []);

  // Traducción de estados para la UI
  // Los estados en Firestore están en inglés porque fueron definidos asi en la base de datos (pending, preparing) ready y delivered se manejan en otro módulo
  // Esta función los convierte al español para mostrarlos.
  function traducirEstado(estado) {
    const traducciones = {
      pending: "En espera",
      preparing: "Preparando",
      ready: "Listo",
      delivered: "Entregado",
    };
    return traducciones[estado] || estado;
  }

  //Pedidos que todavía no se han puesto a preparar
  const pedidosEnEspera = pedidosActivos.filter(
    (pedido) => pedido.status === "pending",
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
          <ShoppingBag size={24} className="metrica-icono" />
          <div>
            <p className="metrica-numero">{pedidosActivos.length}</p>
            <p className="metrica-etiqueta">Pedidos activos</p>
          </div>
        </div>

        <div className="metrica-card">
          <DollarSign size={24} className="metrica-icono" />
          <div>
            <p className="metrica-numero">
              ${totalVentasHoy.toLocaleString("es-CO")}
            </p>
            <p className="metrica-etiqueta">Ventas hoy</p>
          </div>
        </div>

        <div className="metrica-card">
          <Clock size={24} className="metrica-icono" />
          <div>
            <p className="metrica-numero">{pedidosEnEspera}</p>
            <p className="metrica-etiqueta">En espera</p>
          </div>
        </div>
      </section>

      {/*Lista de pedidos activos*/}
      <section className="dashboard-pedidos">
        <h2>Pedidos activos</h2>

        {/* casos: cargando / sin pedidos / la lista */}
        {cargando ? (
          <p className="estado-texto">Cargando pedidos...</p>
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
        <span className="pedido-mesa">{pedido.tableId}</span>
        <span className={`pedido-estado estado-${pedido.status}`}>
          {traducirEstado(pedido.status)}
        </span>
      </div>

      {/* Lista de platos del pedido */}
      <ul className="pedido-items">
        {pedido.items?.map((item, indice) => (
          <li key={indice}>
            {item.quantity}x {item.dishName} — $
            {item.price.toLocaleString("es-CO")}
          </li>
        ))}
      </ul>

      {/* Nota del cliente (solo si escribió algo) */}
      {pedido.customerNotes && (
        <p className="pedido-nota">📝 {pedido.customerNotes}</p>
      )}

      {/* Total alineado a la derecha */}
      <p className="pedido-total">
        Total: ${pedido.total?.toLocaleString("es-CO")}
      </p>
    </div>
  );
}

export default Dashboard;
