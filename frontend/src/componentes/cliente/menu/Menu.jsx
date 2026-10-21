// [SOLO-WEB] Pantalla de menú: buscador, filtro por categoría, platos y botón del carrito
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { obtenerProductos, obtenerCategorias } from "../../../servicios/menuClienteServicio";
import { formatearPrecio } from "../../../servicios/carritoServicio";
import { useCarrito } from "../../../hooks/useCarrito";
import "./Menu.css";

// Quita mayúsculas y tildes para que "monona" encuentre "Moñona"
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function Menu() {
  const navegar = useNavigate();
  const { items, agregar, cantidadTotal } = useCarrito();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const productosObtenidos = await obtenerProductos();
        const categoriasObtenidas = await obtenerCategorias();

        if (!activo) return;
        setProductos(productosObtenidos);
        setCategorias(categoriasObtenidas);
      } catch (e) {
        if (activo) setError(e.message || "No se pudo cargar el menú.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // Se calcula en cada render a partir de los estados, no necesita un estado propio
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaActiva === "Todos" || producto.categoria === categoriaActiva;
    const coincideBusqueda = normalizar(producto.nombre).includes(normalizar(busqueda));
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="menu-contenedor">
      <div className="menu-encabezado">
        <h1 className="menu-titulo">Menú</h1>

        <button
          className="menu-boton-carrito"
          type="button"
          onClick={() => navegar("/carrito")}
          aria-label="Ver carrito"
        >
          <ShoppingCart size={22} />
          {cantidadTotal > 0 && <span className="menu-carrito-contador">{cantidadTotal}</span>}
        </button>
      </div>

      <div className="menu-buscador">
        <Search size={18} />
        <input
          className="menu-buscador-input"
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar plato..."
        />
      </div>

      <div className="menu-categorias">
        {["Todos", ...categorias].map((categoria) => (
          <button
            key={categoria}
            type="button"
            className={
              categoria === categoriaActiva
                ? "menu-categoria menu-categoria--activa"
                : "menu-categoria"
            }
            onClick={() => setCategoriaActiva(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      {cargando && <p className="menu-mensaje">Cargando menú...</p>}
      {error && <p className="menu-mensaje menu-mensaje--error">{error}</p>}
      {!cargando && !error && productosFiltrados.length === 0 && (
        <p className="menu-mensaje">No encontramos platos con ese filtro.</p>
      )}

      <div className="menu-lista">
        {productosFiltrados.map((producto) => {
          const enCarrito = items.find((item) => item.id === producto.id);

          return (
            <article key={producto.id} className="menu-tarjeta">
              <div className="menu-tarjeta-info">
                <h3 className="menu-tarjeta-nombre">{producto.nombre}</h3>
                <p className="menu-tarjeta-descripcion">{producto.descripcion}</p>
                <p className="menu-tarjeta-precio">{formatearPrecio(producto.precio)}</p>
              </div>

              <button
                className="menu-boton-agregar"
                type="button"
                onClick={() => agregar(producto)}
                disabled={!producto.disponible}
              >
                {!producto.disponible
                  ? "Agotado"
                  : enCarrito
                  ? `Agregar (${enCarrito.cantidad})`
                  : "Agregar"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Menu;