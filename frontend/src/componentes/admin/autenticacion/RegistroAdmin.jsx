import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { registrarAdmin } from "../../../servicios/authServicio";
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import InputCampo from "../../compartido/ui/InputCampo";
import "./LoginAdmin.css";
import "./RegistroAdmin.css";

export default function RegistroAdmin() {
  const [campos, setCampos] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    codigoRegistro: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const navegar = useNavigate();

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setCampos((actuales) => ({ ...actuales, [name]: value }));
  };

  const manejarRegistro = async (evento) => {
    evento.preventDefault();
    setError("");

    if (campos.contrasena !== campos.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await registrarAdmin({
        nombre: campos.nombre.trim(),
        correo: campos.correo.trim(),
        contrasena: campos.contrasena,
        codigoRegistro: campos.codigoRegistro,
      });
      navegar("/admin/dashboard", { replace: true });
    } catch (errorRegistro) {
      setError(errorRegistro.message || "No se pudo crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-contenedor registro-contenedor">
      <div className="login-card registro-card">
        <div className="login-icono-contenedor">
          <ChefHat size={30} color="white" />
        </div>

        <h1 className="login-titulo">Crear cuenta</h1>
        <p className="login-subtitulo">Completa el formulario para registrarte</p>

        <form onSubmit={manejarRegistro} className="login-formulario">
          <InputCampo
            etiqueta="Nombre completo"
            id="nombre"
            nombre="nombre"
            valor={campos.nombre}
            alCambiar={actualizarCampo}
            placeholder="Tu nombre completo"
            requerido
            maxLength={100}
            autoComplete="name"
          />
          <InputCampo
            etiqueta="Correo electrónico"
            id="correo-registro"
            nombre="correo"
            tipo="email"
            valor={campos.correo}
            alCambiar={actualizarCampo}
            placeholder="admin@restaurante.com"
            requerido
            maxLength={150}
            autoComplete="email"
          />
          <InputCampo
            etiqueta="Código de invitación"
            id="codigo-registro"
            nombre="codigoRegistro"
            tipo="password"
            valor={campos.codigoRegistro}
            alCambiar={actualizarCampo}
            placeholder="Solicita el código al administrador"
            requerido
            maxLength={256}
            autoComplete="off"
          />
          <InputCampo
            etiqueta="Contraseña"
            id="contrasena-registro"
            nombre="contrasena"
            tipo="password"
            valor={campos.contrasena}
            alCambiar={actualizarCampo}
            placeholder="Mínimo 8 caracteres"
            requerido
            minLength={8}
            autoComplete="new-password"
          />
          <InputCampo
            etiqueta="Confirmar contraseña"
            id="confirmar-contrasena"
            nombre="confirmarContrasena"
            tipo="password"
            valor={campos.confirmarContrasena}
            alCambiar={actualizarCampo}
            placeholder="Repite tu contraseña"
            requerido
            minLength={8}
            autoComplete="new-password"
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <BotonPrimario texto="Registrarse" cargando={cargando} ancho="completo" />
        </form>

        <p className="login-pie">
          ¿Ya tienes cuenta? <Link to="/admin/login" className="login-pie-enlace">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}