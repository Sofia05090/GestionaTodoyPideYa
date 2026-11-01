//Pantalla de incio de cliente - bienvenida, boton pedido
import { Link, useNavigate } from "react-router-dom";
import "./Inicio.css";

function Inicio() {

    const navegar = useNavigate(); //para poder realizar cambios de pantallas entre incio, escanear qr y menu

    return (

        <main className="inicio-contenedor">
            <section className="inicio-contenido">
                <h1 className="inicio-titulo">¡Bienvenido!</h1>
                <p className="inicio-subtitulo">Gestione todo y pida ya</p>
                <button
                    className="inicio-boton inicio-boton-pedido"
                    type="button"
                    onClick={() => navegar("/escanear-qr")}
                >
                    Comenzar pedido
                </button>
                {/* El botón de escanear QR fue eliminado de aquí */}
                <Link to="/admin/login" className="inicio-acceso-admin">
                    Acceso administrador
                </Link>
            </section>
        </main>


    );
}

export default Inicio;