// Navegacion de la aplicacion
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./componentes/compartido/layout/AdminLayout";
import LoginAdmin  from "./componentes/admin/autenticacion/LoginAdmin";
import Dashboard   from "./componentes/admin/dashboard/Dashboard";

function App() {
  
  return(
<BrowserRouter>
      <Routes>

        {/* Ruta que redirige al login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/*pantalla completa sin sidebar (login)*/}
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/*las rutas de panel del admin con sidebar y AdminLayout dibuja el menu de navegacion automaticamente.  */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        </Routes>
        </BrowserRouter>
  );
}

export default App