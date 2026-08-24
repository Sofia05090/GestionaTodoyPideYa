// Aqui guardamos juntos los datos que la persona escribe en un formulario
// Lo usamos, por ejemplo, para agregar o editar un plato del menu

import { useState } from "react";

function useFormulario(valoresIniciales) {

  // al principio guardamos el formulario con los valores que recibimos
  const [campos, setCampos] = useState(valoresIniciales);

  // cuando la persona escribe o marca una opción,
  // actualizamos solo el dato que cambio
  function manejarCambio(nombreCampo, valor) {
    setCampos((camposActuales) => ({
      ...camposActuales,       // dejamos intactos los demas datos
      [nombreCampo]: valor,    // actualizamos el dato que cambio
    }));
  }

  // cuando editamos un plato, ponemos aqui lso datos
  function cargarDatos(datosExternos) {
    setCampos(datosExternos);
  }

  // despues de guardar o cancelar, dejamos el formulario como al principio
  function reiniciar() {
    setCampos(valoresIniciales);
  }

  // devolvemos los datos y las funciones que usará el formulario
  return { campos, manejarCambio, cargarDatos, reiniciar };
}

export default useFormulario;
