// frontend/src/contexto/UsuarioContexto.jsx
import { createContext, useContext, useState } from "react";
import { obtenerAdmin } from "../servicios/authServicio";

// creamos el contexto
const UsuarioContexto = createContext();

// creamos el Proveedor que envolverá la app
export const ProveedorUsuario = ({ children }) => {
  // inicializamos el estado leyendo lo que hay en el localStorage
  const [usuario, setUsuario] = useState(() => obtenerAdmin());

  // función para actualizar el estado global (y que el sidebar cambie de inmediato)
  const actualizarUsuario = (nuevosDatos) => {
    setUsuario((prev) => ({ ...prev, ...nuevosDatos }));
  };

  return (
    <UsuarioContexto.Provider value={{ usuario, actualizarUsuario }}>
      {children}
    </UsuarioContexto.Provider>
  );
};

// hook personalizado para usar el contexto fácilmente en cualquier componente
export const useUsuario = () => useContext(UsuarioContexto);