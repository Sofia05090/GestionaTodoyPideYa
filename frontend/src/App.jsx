// Navegacion de la aplicacion
// como ahora se usa rutas anidadas para el panel admin, adminlayout se declara una sola vez como ruta padre y los componentes hijos (Dashboard,GestionMenu y demas) se anidan dentro, entonces adminlayout usa outlet para renderizar el hijo automaticamente
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./componentes/compartido/layout/AdminLayout";
import LoginAdmin from "./componentes/admin/autenticacion/LoginAdmin";
import RegistroAdmin from "./componentes/admin/autenticacion/RegistroAdmin";
import Dashboard from "./componentes/admin/dashboard/Dashboard";
import GestionMenu from "./componentes/admin/menu/GestionMenu";
import PedidosActivos from "./componentes/admin/pedidos/PedidosActivos";
import HistorialPedidos from "./componentes/admin/historial/HistorialPedidos";
import Estadisticas from "./componentes/admin/estadisticas/Estadisticas";
import RutaProtegida from "./componentes/admin/dashboard/RutaProtegida";
import Inicio from "./componentes/cliente/inicio/Inicio";
import Menu from "./componentes/cliente/menu/Menu";
import { CarritoProvider } from "./contexto/CarritoProvider";
import EscanearQR from "./componentes/cliente/inicio/EscanearQR";
import Carrito from "./componentes/cliente/carrito/Carrito";
import EstadoOrden from "./componentes/cliente/orden/EstadoOrden";
import EditarOrden from "./componentes/cliente/orden/EditarOrden";

function App() {
  return (
    // el provider envuelve todo para que el carrito se comparta entre las pantallas del cliente
    <CarritoProvider>
      <BrowserRouter>
        <Routes>
          {/*pantallas del cliente*/}
          <Route path="/" element={<Inicio />} />
          <Route path="/escanear-qr" element={<EscanearQR />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/orden/:id" element={<EstadoOrden />} />
          <Route path="/orden/:id/editar" element={<EditarOrden />} />

          {/* ruta que redirige al login */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          {/* el inicio de sesión no muestra el menu lateral */}
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/registro" element={<RegistroAdmin />} />

          {/* estas pantallas usan el diseño del administrador y su menu lateral tambien estas rutas son protegidas*/}
          <Route element={<RutaProtegida />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="menu" element={<GestionMenu />} />
              <Route path="pedidos" element={<PedidosActivos />} />
              <Route path="historial" element={<HistorialPedidos />} />
              <Route path="estadisticas" element={<Estadisticas />} />
            </Route>
          </Route>

          {/* redirige por defecto a las rutas no encontradas al menu*/}
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </BrowserRouter>
    </CarritoProvider>
  );
}

export default App;