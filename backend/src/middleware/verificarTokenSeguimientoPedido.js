//se crea este archivo para verificar el token de seguimiento del pedido, que se envia en la cabecera de la peticion, y se verifica que sea valido y que corresponda al pedido solicitado
const jwt = require("jsonwebtoken");

const verificarTokenSeguimientoPedido = (req, res, next) => {
  const encabezado = req.headers.authorization || "";
  const coincidencia = encabezado.match(/^Bearer\s+(.+)$/i);

  if (!coincidencia) {
    return res.status(401).json({ mensaje: "Se requiere el código de seguimiento del pedido." });
  }

  try {
    const datos = jwt.verify(coincidencia[1], process.env.JWT_SECRETO);
    if (
      datos.tipo !== "seguimiento_pedido" ||
      String(datos.pedidoId) !== String(req.params.id)
    ) {
      return res.status(403).json({ mensaje: "El código no permite consultar este pedido." });
    }

    next();
  } catch {
    return res.status(403).json({ mensaje: "El código de seguimiento no es válido o expiró." });
  }
};

module.exports = verificarTokenSeguimientoPedido;