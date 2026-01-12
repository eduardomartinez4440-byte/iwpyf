create database YumexBD;
use YumexBD;

CREATE TABLE CUENTAS (
    -- identificadores
    ID_CUENTA INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PASSWORD NVARCHAR(100) NOT NULL,
    token_sesion VARCHAR(255),
    -- detalle
    ROL ENUM('Invitado','Cliente','Administrador') NOT NULL DEFAULT 'Cliente'
);

CREATE TABLE PLATILLOS (
    -- identificadores
    ID_PLATILLO INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE VARCHAR(100) NOT NULL,
    
    -- detalles del platillo
    PRECIO DECIMAL(10,2) NOT NULL,
    DISPONIBLE BOOLEAN DEFAULT TRUE,
    DESCRIPCION TEXT,
    IMAGEN VARCHAR(255)
);

CREATE TABLE PEDIDOS (
    -- Identificadores
    ID_PEDIDO INT AUTO_INCREMENT PRIMARY KEY,
    ID_CUENTA INT,
    FECHA_COMPRA TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tabla de detalles del pedido
    ID_PLATILLO INT,
    CANTIDAD INT,
    TOTAL DECIMAL(10,2),
    
    -- llaves
    FOREIGN KEY (ID_PLATILLO) REFERENCES PLATILLOS(ID_PLATILLO),
    FOREIGN KEY (ID_CUENTA) REFERENCES CUENTAS(ID_CUENTA)
);


CREATE TABLE PEDIDO_DETALLE (
    ID_DETALLE INT AUTO_INCREMENT PRIMARY KEY,
    ID_PEDIDO INT NOT NULL,
    ID_PLATILLO INT NOT NULL,
    CANTIDAD INT NOT NULL,
    PRECIO_UNITARIO DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (ID_PEDIDO) REFERENCES pedidos(ID_PEDIDO) ON DELETE CASCADE,
    FOREIGN KEY (ID_PLATILLO) REFERENCES platillos(ID_PLATILLO)
);


CREATE TABLE RESEÑAS (
    -- identificador
    ID_RESEÑA INT AUTO_INCREMENT PRIMARY KEY,
    ID_PLATILLO INT,

    -- detalles
    ID_CUENTA INT NULL,
    CALIFICACION INT CHECK (calificacion BETWEEN 1 AND 5),
    COMENTARIOS TEXT,
    FECHA TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- llaves
    FOREIGN KEY (ID_PLATILLO) REFERENCES PLATILLOS(ID_PLATILLO),
    FOREIGN KEY (ID_CUENTA) REFERENCES CUENTAS(ID_CUENTA)
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


-- inserta usuarios iniciales
INSERT INTO CUENTAS	(NOMBRE, EMAIL ,PASSWORD,ROL) VALUES ('Luis','LuisEnrique@gmail.com', 'Le982895544','Administrador');
select * from cuentas;

INSERT INTO PLATILLOS (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Barbacoa', 80, TRUE, 'Suave, jugosa y con auténtico sabor tradicional, perfecta para comenzar el día con energía','barbacoa.jpg');
INSERT INTO PLATILLOS (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('huevos Revueltos',80,TRUE,'Clásicos, esponjosos y recién preparados, ideales para un desayuno rápido y delicioso.','huevos.jpg');
INSERT INTO PLATILLOS (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Flautas Ahogadas',80,TRUE,'Crocantes por fuera, bañadas en salsa y acompañadas de crema y queso para un antojo irresistible.','flautasah.jpg');
INSERT INTO PLATILLOS (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Enchiladas',80,TRUE,'Tortillas suaves rellenas y cubiertas de salsa, crema y queso, con el auténtico toque mexicano','enchiladas.jpg');
INSERT INTO PLATILLOS (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Chilaquiles',80,TRUE,'Totopos crujientes bañados en salsa roja o verde, acompañados de crema, queso y el toque casero que amas.','chilquiles.jpg');
INSERT INTO PLATILLOS (NOMBRE, PRECIO, DISPONIBLE, DESCRIPCION, IMAGEN) VALUES ('Molletes',80,TRUE,'Pan suave con frijoles, queso gratinado y pico de gallo fresco, un desayuno sencillo pero lleno de sabor.','molletes.jpg');
select * from platillos;

ALTER TABLE CUENTAS ADD ACTIVO BOOLEAN DEFAULT TRUE;
ALTER TABLE PLATILLOS ADD ACTIVO BOOLEAN DEFAULT TRUE;
ALTER TABLE pedidos ADD COLUMN ESTADO VARCHAR(20) NOT NULL DEFAULT 'prep';
select * from pedidos;