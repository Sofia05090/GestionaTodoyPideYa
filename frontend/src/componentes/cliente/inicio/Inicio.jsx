//Pantalla de incio de cliente - bienvenida, boton pedido
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import {
    escucharCambiosSoporte,
    obtenerNumeroWhatsappSoporte,
} from "../../../servicios/soporteServicio";
import "./Inicio.css";

function Inicio() {
    const [numeroSoporte, setNumeroSoporte] = useState("");
    const [errorSoporte, setErrorSoporte] = useState("");
    const navegar = useNavigate(); //para poder realizar cambios de pantallas entre incio, escanear qr y menu

    useEffect(() => {
        let activo = true;
        let cambiosEnVivo = 0;

        const dejarDeEscuchar = escucharCambiosSoporte((numero) => {
            cambiosEnVivo += 1;
            if (activo) {
                setNumeroSoporte(numero);
                setErrorSoporte("");
            }
        });

        obtenerNumeroWhatsappSoporte()
            .then((numero) => {
                if (activo && cambiosEnVivo === 0) setNumeroSoporte(numero);
            })
            .catch((error) => {
                console.error("No se pudo cargar el número de soporte:", error);
                if (activo) setErrorSoporte("No se pudo cargar el contacto de soporte.");
            });

        return () => {
            activo = false;
            dejarDeEscuchar();
        };
    }, []);

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
                {numeroSoporte && (
                    <a
                        className="inicio-soporte"
                        href={`https://wa.me/57${numeroSoporte}?text=${encodeURIComponent("Hola, necesito soporte con mi pedido. ID del pedido: ")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MessageCircle size={18} aria-hidden="true" />
                        <span>¿Tienes problemas con tu pedido?</span>
                    </a>
                )}
                {errorSoporte && (
                    <p className="inicio-soporte-error" role="status">
                        {errorSoporte}
                    </p>
                )}
            </section>
        </main>


    );
}

export default Inicio;