//Estructura que envuelve todas las pantallas del admin

import SidebarAdmin from "./SidebarAdmin";
import "./AdminLayout.css";

function AdminLayout({ children }) { //children es el dashboard
  return (
    <div className="admin-layout">


      <main className="admin-contenido">
        {children}
      </main>

    {/*hace siempre visible el menu de navegacion a la derecha */}
      <SidebarAdmin />

    </div>
  );
}

export default AdminLayout;