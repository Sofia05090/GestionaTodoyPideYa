//Pantalla de incio de cliente - bienvenida, boton pedido y boton QR

import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react"; //Icono de cubiertos cruzados
import "./Inicio.css";

function Inicio() {

    const navegar = useNavigate(); //para poder realizar cambios de pantallas entre incio, menu y escanear qr

    return (

        <div className="inicio-contenedor">

            <h1 className="inicio-titulo">¡Bienvenido!</h1>

            <p className="inicio-subtitulo">Gestione Todo y Pide Ya</p>

            <button className="inicio-boton inicio-boton-pedido" onClick={() => navegar("/menu")}>
                <span>Comenzar Pedido</span>
            </button>

            <button className="inicio-boton inicio-boton-qr" onClick={() => navegar("/escanear-qr")}>
                <QrCode size={20} />
                <span>Escanea el código QR de tu mesa</span>
            </button>

        </div>


    );
}

export default Inicio;