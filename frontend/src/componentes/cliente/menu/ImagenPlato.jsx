// [SOLO-WEB] Imagen del plato con respaldo si no existe o no carga
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";

function ImagenPlato({ src, alt }) {
  const [fallo, setFallo] = useState(false);

  if (!src || fallo) {
    return (
      <div className="imagen-plato imagen-plato--vacia">
        <UtensilsCrossed size={32} />
      </div>
    );
  }

  return (
    <img
      className="imagen-plato"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

export default ImagenPlato;