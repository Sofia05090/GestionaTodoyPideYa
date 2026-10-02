//el archivo se encarga de proteger las rutas del panel de administrador, si no hay token redirige al login
//para que no cualquiera pueda acceder a las rutas del panel del admin, se crea un componente que verifica si hay un token en el localstorage, si no lo hay redirige al login, si lo hay permite acceder a las rutas
import {navigate, Outlet} from "react-router-dom";
import {obtenertoken} from "../../../servicios/authServicio";

function RutaProtegida() {
  const token = obtenertoken();
  const navigate = useNavigate(); // Hook de navegación para redirigir al login si no hay token

  //si no hay token, redirige al login
  if (!token) {
    navigate("/admin/login");
    return null; // Evita renderizar el contenido protegido mientras se redirige
  }
  //si esta autenticado, permite acceder a las rutas protegidas
  return <Outlet />;
}

export default RutaProtegida;