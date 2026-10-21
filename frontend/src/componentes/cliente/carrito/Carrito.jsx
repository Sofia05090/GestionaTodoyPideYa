// Decide qué vista mostrar según si hay productos en el carrito
import { useCarrito } from "../../../hooks/useCarrito";
import CarritoVacio from "./CarritoVacio";
import CarritoLleno from "./CarritoLleno";

function Carrito() {
  const { cantidadTotal } = useCarrito();
  return cantidadTotal === 0 ? <CarritoVacio /> : <CarritoLleno />;
}

export default Carrito;