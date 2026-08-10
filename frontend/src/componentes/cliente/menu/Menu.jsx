// Pantalla de menu - buscador, boton carrito, filtro y platos

import { useNavigate } from "react-router-dom";
import "./Menu.css";

function Menu() {

    const navegar = useNavigate(); // para desplazarse a carrito 

    return(

        <div className="menu-contenedor">

            <h1 className="menu-titulo">Menú</h1>

        </div>

    );

}

export default Menu;
