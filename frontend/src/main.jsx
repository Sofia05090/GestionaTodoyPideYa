import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ProveedorUsuario } from './contexto/UsuarioContexto.jsx' //se importa el proveedor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*se envuelve la app con el proveedor para que todos los componentes tengan acceso*/}
    <ProveedorUsuario>
      <App />
    </ProveedorUsuario>
  </StrictMode>,
)
