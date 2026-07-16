// Pantalla de inicio de sesión
import { useState }                            from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate }                         from "react-router-dom";
import "./LoginAdmin.css";

function LoginAdmin() {

  //formulario
  const [correo,     setCorreo]     = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando,   setCargando]   = useState(false); // evita doble clic
  const [error,      setError]      = useState("");    // mensaje al usuario

  const navegar = useNavigate();
  const auth    = getAuth();

  //envío del formulario evitamos que el navegador recargue la página
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

        <h1 className="login-titulo">Gestione Todo</h1>
        <p className="login-subtitulo">Panel de Administración</p>

        <form onSubmit={manejarLogin} className="login-formulario">

          <div className="campo-grupo">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div className="campo-grupo">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/*aparece si Firebase rechaza las credenciales */}
          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="boton-login"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;
