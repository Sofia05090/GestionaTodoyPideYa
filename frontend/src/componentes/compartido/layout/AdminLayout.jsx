//Estructura que envuelve todas las pantallas del admin
//se cambia a rutas anidadas para hacer el codigo mas limpio y no duplicar codigo, adminlayout ya no recibe children, ahora con outlet react router rellena automaticamente el componente hijo 
import SidebarAdmin from "./SidebarAdmin";
import "./AdminLayout.css";
import { Outlet } from "react-router-dom";

function AdminLayout() {
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