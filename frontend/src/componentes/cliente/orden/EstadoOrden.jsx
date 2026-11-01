//Seguimiento del pedido: consulta el estado cada 3 segundos
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom"; // AÑADIDO: Link
import { obtenerOrden, ETIQUETAS_ESTADO } from "../../../servicios/ordenServicio";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import "./EstadoOrden.css";

const PASOS = ["pendiente", "preparando", "listo", "entregado"];

const MENSAJES = {
  pendiente: "Recibimos tu pedido. Pronto empezaremos a prepararlo.",
  preparando: "Estamos preparando tu pedido.",
  listo: "¡Tu pedido está listo!",
  entregado: "Pedido entregado. ¡Buen provecho!",
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
  
  // Validación flexible para el estado
  const estadoActual = orden?.estado ? String(orden.estado).toLowerCase() : "";
  const sePuedeEditar = estadoActual === "pendiente" || estadoActual === "pending";

  return (
    <div className="estado-contenedor">
      <div className="estado-wrapper">
        
        <div className="estado-header">
          <h1 className="estado-titulo">Pedido #{orden.id}</h1>
          {orden.mesa && <p className="estado-mesa">Mesa {orden.mesa}</p>}
        </div>

        <ol className="estado-pasos">
          {PASOS.map((paso, indice) => {
            let clase = "estado-paso";
            if (indice < indiceActual) clase += " estado-paso--hecho";
            if (indice === indiceActual) clase += " estado-paso--actual";

            return (
              <li key={paso} className={clase}>
                <span className="estado-paso-punto" />
                <span className="estado-paso-texto">{ETIQUETAS_ESTADO[paso] || paso}</span>
              </li>
            );
          })}
        </ol>

        <p className="estado-descripcion">{MENSAJES[orden.estado] || "Actualizando estado..."}</p>

        <div className="estado-tarjeta">
          <div className="estado-lista-items">
            {orden.items.map((item) => (
              <div key={item.id} className="estado-linea">
                <span>{item.cantidad}x {item.nombre}</span>
                <span>{formatearPrecio(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          {orden.notas && <p className="estado-notas"> {orden.notas}</p>}

          <div className="estado-linea estado-linea--total">
            <span>Total</span>
            <span>{formatearPrecio(orden.total)}</span>
          </div>
        </div>

        <div className="estado-acciones">
          {/* CAMBIO AQUÍ: Usamos el componente Link en lugar de button */}
          {sePuedeEditar && (
            <Link 
              to={`/orden/${orden.id}/editar`} 
              className="estado-boton-principal"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              Editar pedido
            </Link>
          )}
          
          <button className="estado-boton-secundario" type="button" onClick={() => navegar("/")}>
            Volver al inicio
          </button>
        </div>

      </div>
    </div>
  );
}

export default EstadoOrden;