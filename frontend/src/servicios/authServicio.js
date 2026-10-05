const API_URL = "http://localhost:5000/api/auth";

const guardarSesion = (datos) => {
  localStorage.setItem("adminToken", datos.token);
  localStorage.setItem("adminUsuario", JSON.stringify(datos.admin));
  return datos.admin;
};

export const iniciarSesion = async (correo, contrasena) => {
  const respuesta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo iniciar sesión.");
  }

  return guardarSesion(datos);
};

export const registrarAdmin = async ({ nombre, correo, contrasena, codigoRegistro }) => {
  const respuesta = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, correo, contrasena, codigoRegistro }),
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo crear la cuenta.");
  }

  return guardarSesion(datos);
};

export const obtenerToken = () => localStorage.getItem("adminToken");

export const obtenerAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUsuario") || "null");
  } catch {
    return null;
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUsuario");
};
