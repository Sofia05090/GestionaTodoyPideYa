//el archivo se encarga de proteger las rutas del panel de administrador, si no hay token redirige al login
//para que no cualquiera pueda acceder a las rutas del panel del admin, se crea un componente que verifica si hay un token en el localstorage, si no lo hay redirige al login, si lo hay permite acceder a las rutas
import { Navigate, Outlet } from "react-router-dom";
import { obtenerToken } from "../../../servicios/authServicio";

function RutaProtegida() {
  const token = obtenerToken();

  //si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  //si esta autenticado, permite acceder a las rutas protegidas
  return <Outlet />;
}

export default RutaProtegida;