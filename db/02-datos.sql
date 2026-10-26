-- INSERTAR PRODUCTOS

-- CALDOS
INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES
(1, 'Caldo de costilla', 'Porción de costilla, papa, consome', 13000, '', 1),
(1, 'Caldo de pollo', 'Pierna pernil, papa, consomé', 15000, '', 1);

-- SOPAS / BANDEJAS id 3
INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES
(3, 'Sopa de mondongo', 'Cuajo, callo y librillo', 13000, '', 1),
(3, 'Bandeja carne sudada', 'Carne de res bota, arroz de fideos, papa en salsa y arepa con mantequilla', 19000, '', 1),
(3, 'Carne asada', 'Carne de res bota asada, arroz de fideos, papa en salsa y arepa con mantequilla', 19000, '', 1),
(3, 'Pollo a la brasa', 'Pollo pierna pernil, arroz de fideos y arepa con mantequilla', 18000, '', 1),
(3, 'Pollo sudado', 'Pollo pierna pernil sudado, arroz de fideos y arepa con mantequilla', 19000, '', 1),
(3, 'Bandeja de costilla sudada', 'Costilla de res sudada, arroz de fideos, papa sudada y arepa con mantequilla', 25000, '', 1),
(3, 'Bandeja carne en salsa BBQ', '190g de carne de res, porción de arroz de fideos, papa en salsa y arepa con mantequilla', 19000, '', 1),
(3, 'Pollo en salsa BBQ', 'Pierna pernil, porción de arroz de fideos, papa en salsa y arepa con mantequilla', 19000, '', 1),
(3, 'Costilla en salsa BBQ', 'Porción de costilla, arroz de fideos, papa en salsa y arepa con mantequilla', 25000, '', 1),
(3, 'Chorizo con arroz', 'Arroz de fideos, papa en salsa, arepa con mantequilla y chorizo santarrosano', 17000, '', 1),
(3, 'Pincho con arroz', 'Arroz de fideos, papa en salsa, arepa con mantequilla y pincho de pollo', 17000, '', 1),
(3, 'Huevos fritos o revueltos con arroz', 'Arroz de fideos, papa en salsa y arepa con mantequilla', 17000, '', 1);

-- MOÑONAS  Porciones id 4
INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES
(4, 'Moñona carne asada', 'Porción de carne asada, arroz de fideos, papa en salsa y huevos fritos o revueltos', 22000, '', 1),
(4, 'Moñona carne sudada', 'Porción de carne sudada, arroz de fideos, papa en salsa y huevos fritos o revueltos', 19000, '', 1),
(4, 'Moñona pollo sudado', 'Pierna pernil, arroz de fideos, papa, arepa y huevo', 22000, '', 1),
(4, 'Moñona pollo a la brasa', 'Pollo a la brasa, arroz de fideos, papa, arepa y huevo', 22000, '', 1),
(4, 'Moñona de costilla sudada', 'Costilla sudada, arroz de fideos, papa, arepa y huevo', 28000, '', 1),
(4, 'Moñona carne en salsa BBQ', 'Carne de res en salsa BBQ, huevo, arroz de fideos, arepa con mantequilla y papa', 22000, '', 1),
(4, 'Moñona pollo en salsa BBQ', 'Pollo en salsa BBQ, arroz de fideos, papa, arepa y huevo', 22000, '', 1),
(4, 'Moñona costilla en salsa BBQ', 'Costilla en salsa BBQ, arroz de fideos, papa, arepa y huevo', 28000, '', 1),
(4, 'Moñona con chorizo', 'Arroz de fideos, papa en salsa, arepa con mantequilla, chorizo y huevos fritos o revueltos', 22000, '', 1),
(4, 'Moñona con pincho', 'Arroz de fideos, papa en salsa, arepa con mantequilla, pincho de pollo y huevos fritos o revueltos', 22000, '', 1);

-- EXTRAS Y PORCIONES id 5
INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES
(5, 'Pincho de pollo con arepa', 'Pincho de pollo, arepa y limón o ají', 8000, '', 1),
(5, 'Pincho de pollo con papa', 'Pincho de pollo, papa y limón o ají', 9000, '', 1),
(5, 'Chorizo con arepa', 'Chorizo santarrosano de cerdo con arepa', 8000, '', 1),
(5, 'Chorizo con papa', 'Chorizo santarrosano de cerdo con papa en salsa o salada', 9000, '', 1),
(5, 'Porción de arroz de fideos', 'Porción de arroz de fideos', 3000, '', 1),
(5, 'Porción de papa en salsa', 'Porción de papa en salsa', 4000, '', 1),
(5, 'Arepa asada con mantequilla', 'Arepa asada con mantequilla', 1000, '', 1),
(5, 'Cigarrillo', 'Lucky o Mustang', 1500, '', 1);

-- BEBIDAS id 2
INSERT INTO productos (categoria_id, nombre, descripcion, precio, url_imagen, disponible) VALUES
(2, 'Tinto', 'Canela, panela y café', 1000, '', 1),
(2, 'Gaseosa personal Postobón', 'Manzana, Colombiana, Uva, Pepsi, SevenUp, Jugos Hit', 3000, '', 1),
(2, 'Gaseosa personal Coca Cola', 'Coca Cola personal', 3000, '', 1),
(2, 'Botella de agua sin gas', 'Botella de agua', 3000, '', 1),
(2, 'Gaseosa Coca Cola 1.5L', 'Gaseosa Coca Cola 1.5 Litros', 12000, '', 1);
