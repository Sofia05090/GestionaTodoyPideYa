// Pantalla de inicio de sesión
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import BotonPrimario from "../../compartido/ui/BotonPrimario";
import InputCampo from "../../compartido/ui/InputCampo";
import "./LoginAdmin.css";

function LoginAdmin() {
  //formulario
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false); // evita doble clic
  const [error, setError] = useState(""); // mensaje al usuario

  const navegar = useNavigate();
  const auth = getAuth();

  //envio del formulario, evitamos que el navegador recargue la página
  async function manejarLogin(evento) {
    evento.preventDefault();
    setCargando(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
      // si el login exitoso, vamos al panel principal
      navegar("/admin/dashboard");
    } catch (errorDeFirebase) {
      // Le damos un error claro al usuario
      setError("Correo o contraseña incorrectos. Intenta de nuevo.");
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
            valor={correo}
            alCambiar={(e) => setCorreo(e.target.value)}
            placeholder="admin@gmail.com"
            requerido
          />

          <InputCampo
            etiqueta="Contraseña"
            id="contrasena"
            tipo="password"
            valor={contrasena}
            alCambiar={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            requerido
          />

          {/*aparece si Firebase rechaza las credenciales */}
          {error && <p className="login-error">{error}</p>}

          {/*boton Primario maneja el gradiente y el texto de carga*/}
          <BotonPrimario
            texto="Iniciar sesión"
            cargando={cargando}
            ancho="completo"
          />
          
        </form>
        {/*de momento, sin funcionalidad */}
        <p className="login-pie">
          ¿No tienes cuenta?{" "}
          <span className="login-pie-enlace">Regístrate</span>
        </p>
      </div>
    </div>
  );
}

export default LoginAdmin;
