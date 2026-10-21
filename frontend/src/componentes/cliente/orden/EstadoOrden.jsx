// [SOLO-WEB] Seguimiento del pedido: consulta el estado cada 3 segundos
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerOrden, ETIQUETAS_ESTADO } from "../../../servicios/ordenServicio";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import "./EstadoOrden.css";

const PASOS = ["pending", "preparing", "ready", "delivered"];

const MENSAJES = {
  pending: "Recibimos tu pedido. Pronto empezaremos a prepararlo.",
  preparing: "Estamos preparando tu pedido.",
  ready: "¡Tu pedido está listo!",
  delivered: "Pedido entregado. ¡Buen provecho!",
};

function EstadoOrden() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [orden, setOrden] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarOrden() {
      try {
        const ordenObtenida = await obtenerOrden(id);
        if (!activo) return;
        setOrden(ordenObtenida);
        setError("");
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarOrden();
    const intervalo = setInterval(cargarOrden, 3000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [id]);

  if (cargando) {
    return (
      <div className="estado-contenedor">
        <p className="estado-mensaje">Cargando tu pedido...</p>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="estado-contenedor">
        <p className="estado-mensaje">{error || "No encontramos tu pedido."}</p>
        <button className="estado-boton-secundario" type="button" onClick={() => navegar("/")}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const indiceActual = PASOS.indexOf(orden.estado);

  return (
    <div className="estado-contenedor">
      <h1 className="estado-titulo">Pedido #{orden.id}</h1>
      <p className="estado-mesa">Mesa {orden.mesa}</p>

      <ol className="estado-pasos">
        {PASOS.map((paso, indice) => {
          let clase = "estado-paso";
          if (indice < indiceActual) clase += " estado-paso--hecho";
          if (indice === indiceActual) clase += " estado-paso--actual";

          return (
            <li key={paso} className={clase}>
              <span className="estado-paso-punto" />
              <span className="estado-paso-texto">{ETIQUETAS_ESTADO[paso]}</span>
            </li>
          );
        })}
      </ol>

      <p className="estado-descripcion">{MENSAJES[orden.estado]}</p>

      <div className="estado-tarjeta">
        {orden.items.map((item) => (
          <div key={item.id} className="estado-linea">
            <span>
              {item.cantidad}x {item.nombre}
            </span>
            <span>{formatearPrecio(item.precio * item.cantidad)}</span>
          </div>
        ))}

        {orden.notas && <p className="estado-notas">📝 {orden.notas}</p>}

        <div className="estado-linea estado-linea--total">
          <span>Total</span>
          <span>{formatearPrecio(orden.total)}</span>
        </div>
      </div>

      {orden.estado === "pending" && (
        <button
          className="estado-boton-principal"
          type="button"
          onClick={() => navegar(`/orden/${orden.id}/editar`)}
        >
          Editar pedido
        </button>
      )}
      <button className="estado-boton-secundario" type="button" onClick={() => navegar("/")}>
        Volver al inicio
      </button>
    </div>
  );
}

export default EstadoOrden;