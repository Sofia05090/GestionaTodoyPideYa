//estado compartido del carrito y de la mesa. La lógica vive en carritoServicio.js
import { useState, useEffect } from "react";
import { CarritoContext } from "./CarritoContext";
import {
  agregarItem,
  cambiarCantidad as cambiarCantidadItem,
  eliminarItem,
  calcularTotal,
  calcularCantidadTotal,
} from "../servicios/carritoServicio";
import {
  escucharCambiosMenu,
  obtenerProductos,
} from "../servicios/menuClienteServicio";

export function CarritoProvider({ children }) {
  //inicializamos el estado leyendo del localStorage (así no se borra al ir al menú)
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem("carrito_items");
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  const [mesa, setMesa] = useState(() => {
    return localStorage.getItem("carrito_mesa") || "";
  });

  //cada vez que el carrito o la mesa cambien, se guardan automáticamente
  useEffect(() => {
    localStorage.setItem("carrito_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("carrito_mesa", mesa);
  }, [mesa]);

  useEffect(() => {
    let activo = true;
    let solicitudActual = 0;

    async function sincronizarPrecios() {
      const solicitud = ++solicitudActual;
      try {
        const productos = await obtenerProductos();
        if (!activo || solicitud !== solicitudActual) return;

        const preciosPorId = new Map(
          productos.map((producto) => [producto.id, producto.precio]),
        );
        setItems((actuales) =>
          actuales.map((item) => {
            const precioActualizado = preciosPorId.get(item.id);
            return precioActualizado === undefined || precioActualizado === item.precio
              ? item
              : { ...item, precio: precioActualizado };
          }),
        );
      } catch (error) {
        console.error("Error al sincronizar los precios del carrito:", error);
      }
    }

    const dejarDeEscuchar = escucharCambiosMenu(sincronizarPrecios);

    return () => {
      activo = false;
      dejarDeEscuchar();
    };
  }, []);

  const agregar = (producto) => setItems((actuales) => agregarItem(actuales, producto));
  const cambiarCantidad = (id, cantidad) =>
    setItems((actuales) => cambiarCantidadItem(actuales, id, cantidad));
  const eliminar = (id) => setItems((actuales) => eliminarItem(actuales, id));
  
  //al confirmar el pedido, vaciamos los platos, pero mantenemos la mesa guardada
  const vaciar = () => {
    setItems([]);
    localStorage.removeItem("carrito_items");
  };

  const valor = {
    items,
    mesa,
    setMesa,
    agregar,
    cambiarCantidad,
    eliminar,
    vaciar,
    total: calcularTotal(items),
    cantidadTotal: calcularCantidadTotal(items),
  };

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}