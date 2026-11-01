const assert = require("node:assert/strict");
const { test } = require("node:test");
const { precioValido } = require("./menu.validaciones");

test("acepta precios enteros no negativos en pesos colombianos", () => {
  assert.equal(precioValido(0), true);
  assert.equal(precioValido("14000"), true);
  assert.equal(precioValido("1500"), true);
  assert.equal(precioValido("1050"), true);
  assert.equal(precioValido("14000.50"), false);
  assert.equal(precioValido("14.000"), false);
  assert.equal(precioValido(-1000), false);
  assert.equal(precioValido(""), false);
});
