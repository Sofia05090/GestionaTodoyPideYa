// Estado compartido del carrito y de la mesa. La lógica vive en carritoServicio.js
import { useState } from "react";
import { CarritoContext } from "./CarritoContext";
import {
  agregarItem,
  cambiarCantidad as cambiarCantidadItem,
  eliminarItem,
  calcularTotal,
  calcularCantidadTotal,
} from "../servicios/carritoServicio";

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [mesa, setMesa] = useState("");

  const agregar = (producto) => setItems((actuales) => agregarItem(actuales, producto));
  const cambiarCantidad = (id, cantidad) =>
    setItems((actuales) => cambiarCantidadItem(actuales, id, cantidad));
  const eliminar = (id) => setItems((actuales) => eliminarItem(actuales, id));
  const vaciar = () => setItems([]);

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