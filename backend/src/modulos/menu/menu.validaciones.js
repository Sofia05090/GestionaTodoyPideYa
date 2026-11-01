const precioValido = (precio) => {
  if (precio === "" || precio === null || precio === undefined) return false;
  if (typeof precio === "string" && !/^\d+$/.test(precio)) return false;
  const valor = Number(precio);
  return Number.isSafeInteger(valor) && valor >= 0;
};

module.exports = { precioValido };
