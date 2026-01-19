create database YumexBD;
use YumexBD;

CREATE TABLE cuentas (
    -- identificadores
    ID_CUENTA INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PASSWORD NVARCHAR(100) NOT NULL,
    token_sesion VARCHAR(255),
    -- detalle
    ROL ENUM('Invitado','Cliente','Administrador','Empleado') NOT NULL DEFAULT 'Cliente',
    ACTIVO BOOLEAN DEFAULT TRUE
);



CREATE TABLE platillos (
    -- identificadores
    ID_PLATILLO INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE VARCHAR(100) NOT NULL,
    
    -- detalles del platillo
    PRECIO DECIMAL(10,2) NOT NULL,
    DISPONIBLE BOOLEAN DEFAULT TRUE,
    DESCRIPCION TEXT,
    IMAGEN VARCHAR(255),
    ACTIVO BOOLEAN DEFAULT TRUE,
    STOCK INT NOT NULL,
	CATEGORIA VARCHAR(50),
    TIEMPO_PREPARACION NVARCHAR(50) NOT NULL
);

CREATE TABLE pedidos (
    -- Identificadores
    ID_PEDIDO INT AUTO_INCREMENT PRIMARY KEY,
    ID_CUENTA INT,
    FECHA_COMPRA TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tabla de detalles del pedido
    TOTAL DECIMAL(10,2),
    ESTADO VARCHAR(20) NOT NULL DEFAULT 'prep',
    TIPO_PAGO ENUM('efectivo', 'tarjeta') NOT NULL DEFAULT 'efectivo',
    ID_DIRECCION INT NULL,
	TIPO_ENTREGA ENUM('LOCAL','DOMICILIO') NOT NULL,

);


CREATE TABLE pedido_detalle (
    ID_DETALLE INT AUTO_INCREMENT PRIMARY KEY,
    ID_PEDIDO INT NOT NULL,
    ID_PLATILLO INT NOT NULL,
    CANTIDAD INT NOT NULL,
    PRECIO_UNITARIO DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (ID_PEDIDO) REFERENCES pedidos(ID_PEDIDO) ON DELETE CASCADE,
    FOREIGN KEY (ID_PLATILLO) REFERENCES platillos(ID_PLATILLO)
);


CREATE TABLE reseñas (
    -- identificador
    ID_RESEÑA INT AUTO_INCREMENT PRIMARY KEY,
    ID_PLATILLO INT,

    -- detalles
    ID_CUENTA INT NULL,
    CALIFICACION INT CHECK (calificacion BETWEEN 1 AND 5),
    COMENTARIOS TEXT,
    FECHA TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- llaves
    FOREIGN KEY (ID_PLATILLO) REFERENCES platillos(ID_PLATILLO),
    FOREIGN KEY (ID_CUENTA) REFERENCES cuentas(ID_CUENTA)
);


CREATE TABLE CONTACTO(
	-- identificador
    ID_CONTACTO INT PRIMARY KEY,
    
    -- detalles
    NOMBRE VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) NOT NULL,
    TELEFONO NVARCHAR(100) NOT NULL,
    MENSAJE TEXT,
    COMPRAS VARCHAR(100) NOT NULL,
    PRECIO_TOTAL DECIMAL(10,2) NOT NULL,
    FORMA_DE_CONTACTO VARCHAR(100) NOT NULL,
    FECHA VARCHAR(100) NOT NULL,
    HORA VARCHAR(100) NOT NULL
    
);

CREATE TABLE direcciones (
  ID_DIRECCION INT AUTO_INCREMENT PRIMARY KEY,
  ID_CUENTA INT NOT NULL,
  CALLE VARCHAR(100),
  NUM_EXT VARCHAR(10),
  NUM_INT VARCHAR(10),
  COLONIA VARCHAR(100),
  CP VARCHAR(10),
  MUNICIPIO VARCHAR(100),
  CIUDAD VARCHAR(100),
  PAIS VARCHAR(100),
  FOREIGN KEY (ID_CUENTA) REFERENCES cuentas(ID_CUENTA)
);

CREATE TABLE tarjetas (
  ID_TARJETA INT AUTO_INCREMENT PRIMARY KEY,
  ID_CUENTA INT NOT NULL,
  TITULAR VARCHAR(100),
  NUM_TARJETA VARCHAR(20),
  FECHA_EXP VARCHAR(10),
  CVV VARCHAR(5),
  FOREIGN KEY (ID_CUENTA) REFERENCES cuentas(ID_CUENTA)
);


-- Total de ventas
SELECT IFNULL(SUM(TOTAL),0) AS ventas FROM pedidos;
-- Número de pedidos
SELECT COUNT(*) AS pedidos FROM pedidos;
-- Ticket promedio
SELECT IFNULL(AVG(TOTAL),0) AS ticket FROM pedidos;
-- Artículos en menú
SELECT COUNT(*) AS menu FROM platillos;

SELECT 
  p.NOMBRE,
  SUM(pd.CANTIDAD) AS total_vendido,
  SUM(pd.CANTIDAD * pd.PRECIO_UNITARIO) AS total_generado
FROM pedidos pe
JOIN pedido_detalle pd ON pe.ID_PEDIDO = pd.ID_PEDIDO
JOIN platillos p ON pd.ID_PLATILLO = p.ID_PLATILLO
WHERE MONTH(pe.FECHA_COMPRA) = MONTH(CURRENT_DATE())
  AND YEAR(pe.FECHA_COMPRA) = YEAR(CURRENT_DATE())
GROUP BY p.ID_PLATILLO
ORDER BY total_vendido DESC
LIMIT 1;











-- inserta usuarios iniciales
INSERT INTO cuentas	(NOMBRE, EMAIL ,PASSWORD,ROL) VALUES ('Luis','LuisEnrique@gmail.com', 'Le982895544','Administrador');


INSERT INTO platillos (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Barbacoa', 80, TRUE, 'Suave, jugosa y con auténtico sabor tradicional, perfecta para comenzar el día con energía','barbacoa.jpg');
INSERT INTO platillos (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('huevos Revueltos',80,TRUE,'Clásicos, esponjosos y recién preparados, ideales para un desayuno rápido y delicioso.','huevos.jpg');
INSERT INTO platillos (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Flautas Ahogadas',80,TRUE,'Crocantes por fuera, bañadas en salsa y acompañadas de crema y queso para un antojo irresistible.','flautasah.jpg');
INSERT INTO platillos (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Enchiladas',80,TRUE,'Tortillas suaves rellenas y cubiertas de salsa, crema y queso, con el auténtico toque mexicano','enchiladas.jpg');
INSERT INTO platillos (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Chilaquiles',80,TRUE,'Totopos crujientes bañados en salsa roja o verde, acompañados de crema, queso y el toque casero que amas.','chilquiles.jpg');
INSERT INTO platillos (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Molletes',80,TRUE,'Pan suave con frijoles, queso gratinado y pico de gallo fresco, un desayuno sencillo pero lleno de sabor.','molletes.jpg');

ALTER TABLE cuentas MODIFY ROL ENUM('Invitado','Cliente','Administrador','Empleado') NOT NULL DEFAULT 'Cliente';

UPDATE cuentas SET ROL = 'Cliente' WHERE ROL = 'Empleado';
ALTER TABLE cuentas MODIFY ROL ENUM('Invitado','Cliente','Administrador') NOT NULL DEFAULT 'Cliente';
ALTER TABLE pedidos MODIFY ESTADO VARCHAR(20) NOT NULL DEFAULT 'prep';
ALTER TABLE pedidos ADD COLUMN TIPO_PAGO ENUM('efectivo', 'tarjeta') NOT NULL DEFAULT 'efectivo';
ALTER TABLE platillos ADD STOCK INT NOT NULL DEFAULT 0;
ALTER TABLE platillos ADD CATEGORIA VARCHAR(50);
ALTER TABLE platillos ADD TIEMPO_PREPARACION NVARCHAR(50) NOT NULL;
ALTER TABLE pedidos ADD ID_DIRECCION INT NULL;
ALTER TABLE pedidos ADD TIPO_ENTREGA ENUM('LOCAL','DOMICILIO') NOT NULL;




select * from cuentas;
select * from platillos;
select * from pedidos;
select * from pedido_detalle;
select * from tarjetas;
select * from direcciones;



