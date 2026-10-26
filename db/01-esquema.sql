  CREATE DATABASE IF NOT EXISTS gestione_todo_y_pida_ya;
  USE gestione_todo_y_pida_ya;

  -- 1. Tabla: categorias
  CREATE TABLE categorias (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
  );

  -- 2. Tabla: productos
  CREATE TABLE productos (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT            NOT NULL,
    nombre       VARCHAR(100)   NOT NULL,
    precio       DECIMAL(10,2)  NOT NULL,
    descripcion  TEXT,
    url_imagen   VARCHAR(500)   DEFAULT '',
    disponible   BOOLEAN        DEFAULT TRUE,
    creado_en    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
  );

  -- 3. Tabla: pedidos
 
  CREATE TABLE pedidos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    mesa        VARCHAR(20)   NOT NULL,
    estado      ENUM('pendiente','preparando','listo','entregado','cancelado') DEFAULT 'pendiente',
    notas       TEXT,
    metodo_pago ENUM('efectivo','transferencia') DEFAULT 'efectivo',
    creado_en   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
  );

  -- 4. Tabla: pedido_items
  CREATE TABLE pedido_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id     INT            NOT NULL,
    producto_id   INT            NOT NULL,
    nombre_plato  VARCHAR(100)   NOT NULL,  -- Registro histórico inmutable
    cantidad      INT            NOT NULL DEFAULT 1,
    precio_venta  DECIMAL(10,2)  NOT NULL,  -- Precio exacto al momento de venta
    notas_item    VARCHAR(150)   DEFAULT '', -- Ej: "Sin cilantro", "Poca sal"
    FOREIGN KEY (pedido_id)   REFERENCES pedidos(id)   ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
  );

  -- 5. Tabla: inventario
  CREATE TABLE inventario (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(100)  NOT NULL,
    cantidad_actual      DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidad_medida        ENUM('kg','libras','unidades','litros') NOT NULL,
    stock_minimo         DECIMAL(10,2) NOT NULL DEFAULT 0,
    ultima_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  -- 6. Tabla: administradores
  CREATE TABLE administradores (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    correo     VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- Hash bcrypt
    creado_en  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  );

 
  -- VISTAS SQL


  -- Vista 1: Pedidos con total calculado automáticamente
  CREATE VIEW vista_pedidos_con_total AS
  SELECT 
      p.id AS pedido_id,
      p.mesa,
      p.estado,
      p.metodo_pago,
      p.notas,
      p.creado_en,
      COALESCE(SUM(pi.cantidad * pi.precio_venta), 0) AS total
  FROM pedidos p
  LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
  GROUP BY p.id;

  -- Vista 2: Reporte diario automatizado
  CREATE VIEW vista_reporte_diario AS
  SELECT 
      DATE(p.creado_en) AS fecha,
      COUNT(DISTINCT p.id) AS total_pedidos,
      COALESCE(SUM(pi.cantidad * pi.precio_venta), 0) AS total_ventas
  FROM pedidos p
  JOIN pedido_items pi ON p.id = pi.pedido_id
  WHERE p.estado = 'entregado'
  GROUP BY DATE(p.creado_en);

  -- Vista 3: Top de productos más vendidos
  CREATE VIEW vista_platos_mas_vendidos AS
  SELECT 
      pi.producto_id,
      pi.nombre_plato,
      SUM(pi.cantidad) AS total_unidades_vendidas,
      SUM(pi.cantidad * pi.precio_venta) AS ingresos_generados
  FROM pedido_items pi
  JOIN pedidos p ON pi.pedido_id = p.id
  WHERE p.estado = 'entregado'
  GROUP BY pi.producto_id, pi.nombre_plato
  ORDER BY total_unidades_vendidas DESC;

 
  -- DATOS INICIALES
  INSERT INTO categorias (nombre) VALUES 
  ('Caldos'), 
  ('Bebidas'), 
  ('Acompañamientos'), 
  ('Porciones'),
  ('Extras y Porciones');