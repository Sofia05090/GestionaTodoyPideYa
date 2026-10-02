// Pantalla de inicio de sesión
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { iniciarSesion } from "../../../servicios/authServicio";
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import InputCampo from "../../compartido/ui/InputCampo";
import "./LoginAdmin.css";

function LoginAdmin() {
  //formulario
  const [correoAdmin, setCorreo] = useState(""); // estado que guarda el correo del admin
  const [contrasena, setContrasena] = useState(""); // estado que guarda la contraseña del admin
  const [cargando, setCargando] = useState(false); // evita doble clic
  const [error, setError] = useState(""); // mensaje al usuario

  const navegar = useNavigate();

  //envio del formulario, evitamos que el navegador recargue la pagina
  async function manejarLogin(evento) {
    evento.preventDefault();
    setCargando(true);
    setError("");

    try {
      await iniciarSesion(correoAdmin, contrasena);
      navegar("/admin/dashboard"); //dirige al dashboard del admin
    } catch (errorLogin) {
      setError(errorLogin.message || "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-contenedor">
      <div className="login-card">
        {/* Ícono */}
        <div className="login-icono-contenedor">
          <ChefHat size={30} color="white" />
        </div>

        <h1 className="login-titulo">Bienvenido</h1>
        <p className="login-subtitulo">
          Ingresa tus datos para acceder al sistema
        </p>

        <form onSubmit={manejarLogin} className="login-formulario">
           <InputCampo
            etiqueta="Correo electrónico"
            id="correo"
            tipo="email"
            valor={correoAdmin}
            alCambiar={(e) => setCorreo(e.target.value)}
            placeholder="admin@gmail.com"
            
          />

          <InputCampo
            etiqueta="Contraseña"
            id="contrasena"
            tipo="password"
            valor={contrasena}
            alCambiar={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"

          />

          {/* Mensaje de error de autenticación */}
          {error && <p className="login-error">{error}</p>}

          {/*boton Primario maneja el gradiente y el texto de carga*/}
          <BotonPrimario
            texto="Iniciar sesión"
            cargando={cargando}
            ancho="completo"
          />
          
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;