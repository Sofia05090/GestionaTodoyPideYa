// seccion del modal de perfil del admin, donde puede cambiar su nombre, correo y contraseña
import { useState } from "react";
import { X, User, Mail, Lock, Check } from "lucide-react";
import { useUsuario } from "../../../contexto/UsuarioContexto";
import { actualizarPerfilAdmin, cerrarSesion as cerrarSesionAdmin } from "../../../servicios/authServicio";
import { useNavigate } from "react-router-dom";
import {createPortal} from "react-dom";
import InputCampo from "../../compartido/ui/InputCampo";
import "./ModalPerfil.css";

export default function ModalPerfil({ alCerrar }) {
  const { usuario, actualizarUsuario } = useUsuario();
  const navegar = useNavigate();
  
  // estado del formulario
  const [formulario, setFormulario] = useState({
    nombre: usuario?.nombre || "",
    correo: usuario?.correo || "",
    contrasenaNueva: "",
    confirmarContrasena: "",
  });
  
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // manejo de cambios en los inputs
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setError(""); // Limpiamos el error al escribir
  };

  // envio del formulario
  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    // validaciones
    if (formulario.contrasenaNueva || formulario.confirmarContrasena) {
      if (formulario.contrasenaNueva !== formulario.confirmarContrasena) {
        setError("Las contraseñas nuevas no coinciden.");
        return;
      }
      if (formulario.contrasenaNueva.length < 8) {
        setError("La nueva contraseña debe tener al menos 8 caracteres.");
        return;
      }
    }

    setGuardando(true);
    try {
      // llamada al backend
      const adminActualizado = await actualizarPerfilAdmin({
        nombre: formulario.nombre,
        correo: formulario.correo,
        contrasenaNueva: formulario.contrasenaNueva,
      });

      // actualizamos el contexto global para que el sidebar cambie de inmediato
      actualizarUsuario(adminActualizado);
      
      // feedback visual
      setGuardadoExitoso(true);
      
      // esperamos 2.5 segundos
      setTimeout(() => {
        setGuardadoExitoso(false);
        
        // si cambio la contraseña, por seguridad cerramos sesión y pedimos login de nuevo
        if (formulario.contrasenaNueva) {
          cerrarSesionAdmin();
          navegar("/admin/login", { replace: true });
        } else {
          alCerrar();
        }
      }, 2500);

    } catch (errorPeticion) {
      setError(errorPeticion.message || "Ocurrió un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  // función para obtener las iniciales del nombre
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "A";
    return nombre.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return createPortal(
    <div className="modal-perfil-fondo" onClick={alCerrar}>
      <div className="modal-perfil-contenido" onClick={(e) => e.stopPropagation()}>
        
        {/* boton Cerrar */}
        <button className="modal-perfil-cerrar" onClick={alCerrar} type="button" aria-label="Cerrar modal">
          <X size={24} />
        </button>

        {/* encabezado */}
        <div className="modal-perfil-encabezado">
          <h2 className="modal-perfil-titulo-principal">Mi Perfil</h2>
          <p className="modal-perfil-subtitulo">Actualiza tu información personal</p>
        </div>

        {/* avatar con iniciales */}
        <div className="modal-perfil-avatar">
          {obtenerIniciales(formulario.nombre)}
        </div>

        <form onSubmit={manejarEnvio}>
          
          {/* seccion: información personal */}
          <div className="modal-perfil-seccion">
            <p className="modal-perfil-etiqueta-seccion">Información Personal</p>
            
            <InputCampo
              etiqueta={<><User size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}} /> Nombre</>}
              id="nombre"
              nombre="nombre"
              tipo="text"
              valor={formulario.nombre}
              alCambiar={manejarCambio}
              requerido
            />
            
            <InputCampo
              etiqueta={<><Mail size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}} /> Correo electrónico</>}
              id="correo"
              nombre="correo"
              tipo="email"
              valor={formulario.correo}
              alCambiar={manejarCambio}
              requerido
            />
          </div>

          <hr className="modal-perfil-divisor" />

          {/* seccion: cambiar contraseña */}
          <div className="modal-perfil-seccion">
            <p className="modal-perfil-etiqueta-seccion">Cambiar Contraseña</p>
            
            <InputCampo
              etiqueta={<><Lock size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}} /> Nueva contraseña</>}
              id="contrasenaNueva"
              nombre="contrasenaNueva"
              tipo="password"
              valor={formulario.contrasenaNueva}
              alCambiar={manejarCambio}
              placeholder="••••••••"
            />
            
            <InputCampo
              etiqueta="Confirmar contraseña"
              id="confirmarContrasena"
              nombre="confirmarContrasena"
              tipo="password"
              valor={formulario.confirmarContrasena}
              alCambiar={manejarCambio}
              placeholder="••••••••"
            />
          </div>

          {/* mensaje de error */}
          {error && <p className="modal-perfil-error">{error}</p>}

          {/* botones de acción */}
          <div className="modal-perfil-botones">
            <button
              type="button"
              onClick={alCerrar}
              className="modal-perfil-btn-cancelar"
              disabled={guardando || guardadoExitoso}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={guardando || guardadoExitoso}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none",
                background: guardadoExitoso ? "#22c55e" : "linear-gradient(90deg, #EA524B, #F49E60)",
                color: "white",
                fontWeight: "600",
                fontSize: "0.95rem",
                cursor: guardando || guardadoExitoso ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                opacity: guardando ? 0.7 : 1,
                fontFamily: "var(--fuente-principal)"
              }}
            >
              {guardadoExitoso ? (
                <><Check size={20} /> Guardado</>
              ) : guardando ? (
                "Guardando..."
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}