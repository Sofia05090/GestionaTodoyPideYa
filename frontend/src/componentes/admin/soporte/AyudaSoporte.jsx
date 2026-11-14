import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Save } from "lucide-react";
import {
  guardarNumeroWhatsappSoporte,
  obtenerNumeroWhatsappSoporte,
} from "../../../servicios/soporteServicio";
import "./AyudaSoporte.css";

const formatearNumero = (numero) =>
  numero ? `${numero.slice(0, 3)} ${numero.slice(3, 6)} ${numero.slice(6)}` : "";

function AyudaSoporte() {
  const [numero, setNumero] = useState("");
  const [numeroGuardado, setNumeroGuardado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;
    obtenerNumeroWhatsappSoporte()
      .then((valor) => {
        if (activo) {
          setNumero(valor);
          setNumeroGuardado(valor);
        }
      })
      .catch((errorCarga) => {
        if (activo) setError(errorCarga.message || "No se pudo cargar el número de soporte.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const numeroInvalido = numero !== "" && !/^\d{10}$/.test(numero);
  const puedeGuardar =
    !cargando &&
    !guardando &&
    !numeroInvalido &&
    numero !== numeroGuardado;

  function cambiarNumero(evento) {
    const digitos = evento.target.value.replace(/\D/g, "");
    const numeroLocal =
      digitos.length === 12 && digitos.startsWith("57")
        ? digitos.slice(2)
        : digitos;
    if (numeroLocal.length <= 10) {
      setNumero(numeroLocal);
      setError("");
      setMensaje("");
    }
  }

  async function guardarNumero(evento) {
    evento.preventDefault();
    if (!puedeGuardar) return;

    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const valor = await guardarNumeroWhatsappSoporte(numero);
      setNumero(valor);
      setNumeroGuardado(valor);
      setMensaje("Número de WhatsApp guardado y compartido con los clientes.");
    } catch (errorGuardado) {
      setError(errorGuardado.message || "No se pudo guardar el número.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="ayuda-soporte">
      <header className="ayuda-soporte__encabezado">
        <h1>Ayuda y soporte</h1>
        <p>Configura el canal oficial y consulta cómo atender las PQR de tus clientes.</p>
      </header>

      <section className="ayuda-soporte__tarjeta" aria-labelledby="canal-soporte-titulo">
        <h2 id="canal-soporte-titulo">Canal oficial configurado</h2>
        <div className="ayuda-soporte__canal-encabezado">
          <div>
            <h3>Canal oficial de WhatsApp</h3>
            <p>Cuenta utilizada para recibir solicitudes de soporte.</p>
          </div>
          <span
            className={numeroGuardado
              ? "ayuda-soporte__estado ayuda-soporte__estado--activo"
              : "ayuda-soporte__estado"}
            role="status"
          >
            {numeroGuardado ? "Canal activo" : "Sin configurar"}
          </span>
        </div>

        <form className="ayuda-soporte__numero" onSubmit={guardarNumero}>
          <label htmlFor="numero-whatsapp">Número de WhatsApp para soporte</label>
          <div className="ayuda-soporte__entrada">
            <span className="ayuda-soporte__prefijo" aria-label="Prefijo de país Colombia">
              +57
            </span>
            <input
              id="numero-whatsapp"
              name="numeroWhatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={formatearNumero(numero)}
              onChange={cambiarNumero}
              placeholder="300 123 4567"
              maxLength={16}
              disabled={cargando || guardando}
              aria-describedby="ayuda-numero-whatsapp"
              aria-invalid={numeroInvalido}
            />
          </div>
          <p id="ayuda-numero-whatsapp" className="ayuda-soporte__ayuda">
            Ingresa 10 dígitos. Puedes pegar el número completo con +57; ejemplo: 300 123 4567.
            Al guardarlo, el cambio se comparte en vivo con los clientes que tengan abierto el sitio.
          </p>
          {numeroInvalido && (
            <p className="ayuda-soporte__error" role="alert">
              El número debe tener 10 dígitos después del prefijo +57.
            </p>
          )}
          {error && <p className="ayuda-soporte__error" role="alert">{error}</p>}
          {mensaje && <p className="ayuda-soporte__exito" role="status">{mensaje}</p>}
          <button
            className="ayuda-soporte__guardar"
            type="submit"
            disabled={!puedeGuardar}
          >
            <Save size={17} aria-hidden="true" />
            <span>{guardando ? "Guardando..." : "Guardar número"}</span>
          </button>
        </form>

        <a
          className="ayuda-soporte__bandeja"
          href="https://web.whatsapp.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!numeroGuardado}
          tabIndex={numeroGuardado ? undefined : -1}
          onClick={(evento) => {
            if (!numeroGuardado) evento.preventDefault();
          }}
        >
          <MessageCircle size={19} aria-hidden="true" />
          <span>Abrir bandeja de PQR en WhatsApp Web</span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
        <p className="ayuda-soporte__ayuda">
          Se abrirá la cuenta de WhatsApp que tenga sesión iniciada en este navegador.
        </p>
      </section>

      <section className="ayuda-soporte__tarjeta" aria-labelledby="guia-soporte-titulo">
        <h2 id="guia-soporte-titulo">Guía rápida para el administrador</h2>
        <ol className="ayuda-soporte__guia">
          <li>
            Los clientes escribirán un mensaje similar a: “Hola, necesito soporte con mi pedido”, seguido del número de su pedido.
          </li>
          <li>Copia o identifica el ID del pedido recibido.</li>
          <li>Busca ese mismo ID en Pedidos Activos o Historial para consultar la orden.</li>
        </ol>
      </section>
    </div>
  );
}

export default AyudaSoporte;
