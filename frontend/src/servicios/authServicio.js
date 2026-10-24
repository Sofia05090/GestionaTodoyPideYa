//este archivo contiene las funciones para manejar la autenticación del administrador, incluyendo inicio de sesión, registro y gestión de la sesión en el almacenamiento local del navegador
const API_URL = "http://localhost:5000/api/auth";

const guardarSesion = (datos) => {
  localStorage.setItem("adminToken", datos.token);
  localStorage.setItem("adminUsuario", JSON.stringify(datos.admin));
  return datos.admin;
};
//función para iniciar sesión del administrador, recibe correo y contraseña, devuelve el admin y guarda el token en el almacenamiento local
export const iniciarSesion = async (correo, contrasena) => {
  try {
    const respuesta = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ correo, contrasena }),
    });
    
    // se verifica si la respuesta es correcta, si no lo es se lanza un error con el mensaje del backend
    if (!respuesta.ok) {
      const datosError = await respuesta.json();
      throw new Error(datosError.mensaje || "Error al iniciar sesión");
    }
    // si la respuesta es correcta, se guarda el token y los datos del admin
    const datos = await respuesta.json();
    return guardarSesion(datos);
  } catch (error) {
    console.error("Error en la petición fetch:", error);
    throw error;
  }
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

export const actualizarPerfilAdmin = async ({ nombre, correo, contrasenaActual, contrasenaNueva }) => {
  const respuesta = await fetch(`${API_URL}/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({ nombre, correo, contrasenaActual, contrasenaNueva }),
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo actualizar el perfil.");
  }

  const admin = datos.admin;
  localStorage.setItem("adminUsuario", JSON.stringify(admin));
  if (datos.token) {
    localStorage.setItem("adminToken", datos.token);
  }
  return admin;
};