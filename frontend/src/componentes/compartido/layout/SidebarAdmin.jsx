// Barra de navegacion del admin
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./SidebarAdmin.css";
//se importa los iconos de lucide-react para el menu de navegacion del admin
import {
  LayoutDashboard, // cuadrícula del dashboard
  UtensilsCrossed, // cubiertos de gestión de menu
  ClipboardList, // portapapeles de pedidos activos
  History, // reloj de historial
  BarChart2, // barras de estadisticas
  LogOut, // flecha de cerrar sesion
  ChefHat, // logo gorro de chef
} from "lucide-react";

//Se crea la seccion para añadir un objeto
const LINKS_NAVEGACION = [
  {
    ruta: "/admin/dashboard",
    etiqueta: "Dashboard",
    Icono: LayoutDashboard,
  },
  {
    ruta: "/admin/menu",
    etiqueta: "Gestión de Menú",
    Icono: UtensilsCrossed,
  },
  {
    ruta: "/admin/pedidos",
    etiqueta: "Pedidos Activos",
    Icono: ClipboardList,
  },
  {
    ruta: "/admin/historial",
    etiqueta: "Historial",
    Icono: History,
  },
  {
    ruta: "/admin/estadisticas",
    etiqueta: "Estadísticas",
    Icono: BarChart2,
  },
];

function SidebarAdmin() {
  const navegar = useNavigate();
  const [correoAdmin, setCorreoAdmin] = useState("");

  // Firebase puede tardar un momento en recuperar la sesion despues de recargar
  useEffect(() => {
    const dejarDeEscuchar = onAuthStateChanged(auth, (usuario) => {
      setCorreoAdmin(usuario?.email ?? "");
    });

    return () => dejarDeEscuchar();
  }, []);

  // Cerramos la sesion y volvemos a la pantalla de inicio de sesion
  async function cerrarSesion() {
    await signOut(auth);
    navegar("/admin/login", { replace: true });
  }

  // Tomamos la primera letra del correo para mostrarla en el círculo.
  const inicialAvatar = correoAdmin.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      {/*estructura del nav */}
      {/*Cabeza del menu de navegacion*/}
      <div className="sidebar-cabecera">
        <div className="sidebar-logo">
          <ChefHat size={28} />
        </div>
        <div>
          <p className="sidebar-nombre-negocio">Gestione Todo Y Pida Ya</p>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <nav className="sidebar-nav">
        {LINKS_NAVEGACION.map(({ ruta, etiqueta, Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            // marcamos el enlace de la pantalla actual
            className={({ isActive }) =>
              isActive ? "sidebar-link sidebar-link--activo" : "sidebar-link"
            }
          >
            <Icono size={18} />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>

      {/*Pie */}
      <div className="sidebar-pie">
        {/* Avatar circular con la inicial + correo del admin */}
        <div className="sidebar-admin-info">
          <div className="sidebar-avatar">{inicialAvatar}</div>
          <div className="sidebar-admin-textos">
            <p className="sidebar-admin-nombre">Admin</p>
            <p className="sidebar-admin-correo">{correoAdmin}</p>
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        <button
          onClick={cerrarSesion}
          className="sidebar-boton-logout"
          type="button"
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarAdmin;