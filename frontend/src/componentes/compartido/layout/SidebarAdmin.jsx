//Barra de navegacion del admin
import { NavLink, useNavigate } from "react-router-dom";
import "../../compartido/layout/AdminLayout.css";
//se importa iconos
import {
  LayoutDashboard, // cuadrícula
  UtensilsCrossed, // cubiertos
  ClipboardList, // portapapeles
  History, // reloj
  BarChart2, // barras
  LogOut, // flecha
  ChefHat, // gorro
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
  //cerrar sesion el signOut le dice a firebase que invalide la sesion y replace evita q el boton regrese al panel sin autenticacion
  async function cerrarSesion() {
    await signOut(auth);
    navegar("/admin/login", { replace: true });
  }
  //correo del admin y su inicial
  const correoAdmin = auth.currentUser?.email ?? "";
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

      {/*Navegacion*/}
      <nav className="sidebar-nav">
        {LINKS_NAVEGACION.map(({ ruta, etiqueta, Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            // isActive es true cuando la URL actual coincide con "ruta"
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
