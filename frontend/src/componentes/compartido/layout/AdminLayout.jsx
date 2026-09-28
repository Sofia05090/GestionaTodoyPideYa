//Estructura que envuelve todas las pantallas del admin
//se cambia a rutas anidadas para hacer el codigo mas limpio y no duplicar codigo, adminlayout ya no recibe children, ahora con outlet react router rellena automaticamente el componente hijo 
import SidebarAdmin from "./SidebarAdmin";
import "./AdminLayout.css";
import { Navigate, Outlet } from "react-router-dom";
import { obtenerToken } from "../../../servicios/authServicio";

function AdminLayout() {
  if (!obtenerToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <main className="admin-contenido">
        {/*se renderiza el componente de la ruta, cambiando automaticamente cuando el admin navega entre el Dashboard, GestionMenu y demas */}
        <Outlet />
      </main>

    {/*hace siempre visible el menu de navegacion a la derecha */}
      <SidebarAdmin />

    </div>
  );
}

export default AdminLayout;