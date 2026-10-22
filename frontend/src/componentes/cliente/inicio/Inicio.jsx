//Pantalla de incio de cliente - bienvenida, boton pedido y boton QR

import { Link, useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import "./Inicio.css";

function Inicio() {

    const navegar = useNavigate(); //para poder realizar cambios de pantallas entre incio, menu y escanear qr

    return (

        <main className="inicio-contenedor">
            <section className="inicio-contenido">
                <h1 className="inicio-titulo">¡Bienvenido!</h1>
                <p className="inicio-subtitulo">Gestione todo y pida ya</p>
                <button
                    className="inicio-boton inicio-boton-pedido"
                    type="button"
                    onClick={() => navegar("/menu")}
                >
                    Comenzar pedido
                </button>
                <button
                    className="inicio-boton inicio-boton-qr"
                    type="button"
                    onClick={() => navegar("/escanear-qr")}
                >
                    <QrCode size={20} />
                    <span>Escanea el código QR de tu mesa</span>
                </button>
                <Link to="/admin/login" className="inicio-acceso-admin">
                    Acceso administrador
                </Link>
            </section>
        </main>


    );
}

export default Inicio;