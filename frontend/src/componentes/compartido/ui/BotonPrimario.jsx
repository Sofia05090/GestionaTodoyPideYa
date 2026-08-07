//Boton reutilizable

import "./BotonPrimario.css";

function BotonPrimario({
  texto,
  alHacer,
  cargando  = false,       
  tipo      = "submit",   
  ancho     = "completo",  
}) {
  return (
    <button
      type={tipo}
      onClick={alHacer}
      disabled={cargando}  // desactiva el botón mientras carga
      className={`boton-primario ${ancho === "completo" ? "boton-primario--completo" : ""}`}
    >
      {/* Si está cargando lo mostramos*/}
      {cargando ? "Cargando..." : texto}
    </button>
  );
}

export default BotonPrimario;