import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import "./SelectorDesplegable.css";

export default function SelectorDesplegable({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const menuId = useId();
  const seleccionada = options.find((option) => option.value === value);

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarAlHacerClicFuera = (evento) => {
      if (!contenedorRef.current?.contains(evento.target)) setAbierto(false);
    };

    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    return () => document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
  }, [abierto]);

  const manejarTeclado = (evento) => {
    if (evento.key === "Escape") {
      setAbierto(false);
      contenedorRef.current?.querySelector(".selector-desplegable__boton")?.focus();
      return;
    }

    if (!abierto || !["ArrowDown", "ArrowUp", "Home", "End"].includes(evento.key)) {
      return;
    }

    const opciones = [...contenedorRef.current.querySelectorAll('[role="option"]')];
    if (!opciones.length) return;

    evento.preventDefault();
    const indiceActual = opciones.indexOf(document.activeElement);
    let indiceSiguiente;

    if (evento.key === "Home") indiceSiguiente = 0;
    else if (evento.key === "End") indiceSiguiente = opciones.length - 1;
    else if (indiceActual === -1) {
      indiceSiguiente = Math.max(options.findIndex((option) => option.value === value), 0);
    } else {
      const desplazamiento = evento.key === "ArrowDown" ? 1 : -1;
      indiceSiguiente = (indiceActual + desplazamiento + opciones.length) % opciones.length;
    }

    opciones[indiceSiguiente].focus();
  };

  const elegirOpcion = (opcion) => {
    onChange(opcion.value);
    setAbierto(false);
    contenedorRef.current?.querySelector(".selector-desplegable__boton")?.focus();
  };

  return (
    <div
      ref={contenedorRef}
      className={`selector-desplegable ${abierto ? "selector-desplegable--abierto" : ""} ${className}`.trim()}
      onKeyDown={manejarTeclado}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAbierto(false);
      }}
    >
      <button
        className="selector-desplegable__boton"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={menuId}
        onClick={() => setAbierto((actual) => !actual)}
      >
        <span>{seleccionada?.label ?? options[0]?.label ?? "Seleccionar"}</span>
        <ChevronDown className="selector-desplegable__flecha" size={16} aria-hidden="true" />
      </button>

      {abierto && (
        <div className="selector-desplegable__menu" id={menuId} role="listbox" aria-label={ariaLabel}>
          {options.map((opcion) => {
            const estaSeleccionada = opcion.value === value;

            return (
              <button
                key={opcion.value}
                className={`selector-desplegable__opcion ${estaSeleccionada ? "selector-desplegable__opcion--seleccionada" : ""}`}
                type="button"
                role="option"
                aria-selected={estaSeleccionada}
                onClick={() => elegirOpcion(opcion)}
              >
                <span>{opcion.label}</span>
                {estaSeleccionada && <Check size={17} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}