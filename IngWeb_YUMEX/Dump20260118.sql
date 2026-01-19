-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: yumexbd
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contacto`
--

DROP TABLE IF EXISTS `contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacto` (
  `ID_CONTACTO` int NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `TELEFONO` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `MENSAJE` text,
  `COMPRAS` varchar(100) NOT NULL,
  `PRECIO_TOTAL` decimal(10,2) NOT NULL,
  `FORMA_DE_CONTACTO` varchar(100) NOT NULL,
  `FECHA` varchar(100) NOT NULL,
  `HORA` varchar(100) NOT NULL,
  PRIMARY KEY (`ID_CONTACTO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacto`
--

LOCK TABLES `contacto` WRITE;
/*!40000 ALTER TABLE `contacto` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas`
--

DROP TABLE IF EXISTS `cuentas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas` (
  `ID_CUENTA` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(100) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `token_sesion` varchar(255) DEFAULT NULL,
  `ROL` enum('Invitado','Cliente','Administrador','Empleado') NOT NULL DEFAULT 'Cliente',
  `ACTIVO` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ID_CUENTA`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas`
--

LOCK TABLES `cuentas` WRITE;
/*!40000 ALTER TABLE `cuentas` DISABLE KEYS */;
INSERT INTO `cuentas` VALUES (1,'Luis','LuisEnrique@gmail.com','Le982895544',NULL,'Empleado',1),(2,'Lalo','MartinezAparicio@gmail.com','Ma123456789',NULL,'Administrador',1),(3,'prueba','Prueba@gmail.com','Pr982895544',NULL,'Cliente',1),(4,'Renata','RenataLadron@gmail.com','Rl123456789',NULL,'Administrador',1),(5,'bettsy','BettsyFuentes@gmail.com','Bf123456789','2d6a46af-94f7-4be7-9a3b-828354e8b90f','Cliente',1);
/*!40000 ALTER TABLE `cuentas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direcciones` (
  `ID_DIRECCION` int NOT NULL AUTO_INCREMENT,
  `ID_CUENTA` int NOT NULL,
  `CALLE` varchar(100) DEFAULT NULL,
  `NUM_EXT` varchar(10) DEFAULT NULL,
  `NUM_INT` varchar(10) DEFAULT NULL,
  `COLONIA` varchar(100) DEFAULT NULL,
  `CP` varchar(10) DEFAULT NULL,
  `MUNICIPIO` varchar(100) DEFAULT NULL,
  `CIUDAD` varchar(100) DEFAULT NULL,
  `PAIS` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID_DIRECCION`),
  KEY `ID_CUENTA` (`ID_CUENTA`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`ID_CUENTA`) REFERENCES `cuentas` (`ID_CUENTA`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,1,'Rafael M. Hidalgo','25','2','Granjas Valle','55270','Ectaepec','Mexico','Mexico'),(2,1,'extra','110','1','nose','2546','nose','nose','nose'),(3,1,'nose','2','2','nose','1234','nose','nose','nose'),(4,5,'nose','2','3','nose','1234','nose','nose','nose');
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_detalle`
--

DROP TABLE IF EXISTS `pedido_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_detalle` (
  `ID_DETALLE` int NOT NULL AUTO_INCREMENT,
  `ID_PEDIDO` int NOT NULL,
  `ID_PLATILLO` int NOT NULL,
  `CANTIDAD` int NOT NULL,
  `PRECIO_UNITARIO` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ID_DETALLE`),
  KEY `ID_PEDIDO` (`ID_PEDIDO`),
  KEY `ID_PLATILLO` (`ID_PLATILLO`),
  CONSTRAINT `pedido_detalle_ibfk_1` FOREIGN KEY (`ID_PEDIDO`) REFERENCES `pedidos` (`ID_PEDIDO`) ON DELETE CASCADE,
  CONSTRAINT `pedido_detalle_ibfk_2` FOREIGN KEY (`ID_PLATILLO`) REFERENCES `platillos` (`ID_PLATILLO`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalle`
--

LOCK TABLES `pedido_detalle` WRITE;
/*!40000 ALTER TABLE `pedido_detalle` DISABLE KEYS */;
INSERT INTO `pedido_detalle` VALUES (1,1,3,1,80.00),(2,2,4,1,80.00),(3,3,6,1,80.00),(4,4,2,1,80.00),(5,5,1,1,40.00),(6,6,3,1,80.00),(7,7,1,4,40.00),(8,8,5,3,80.00),(9,9,3,1,80.00),(10,9,7,1,25.00),(11,10,3,1,80.00),(12,11,3,1,80.00),(13,12,5,5,80.00),(14,13,1,3,40.00),(15,14,1,1,40.00),(16,15,1,1,40.00),(17,16,1,1,40.00),(18,18,1,1,40.00),(19,31,1,1,40.00),(20,32,1,1,40.00);
/*!40000 ALTER TABLE `pedido_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `ID_PEDIDO` int NOT NULL AUTO_INCREMENT,
  `ID_CUENTA` int DEFAULT NULL,
  `FECHA_COMPRA` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TOTAL` decimal(10,2) DEFAULT NULL,
  `ESTADO` varchar(20) NOT NULL DEFAULT 'prep',
  `TIPO_PAGO` enum('efectivo','tarjeta') NOT NULL DEFAULT 'efectivo',
  `ID_DIRECCION` int DEFAULT NULL,
  `TIPO_ENTREGA` enum('LOCAL','DOMICILIO') NOT NULL,
  PRIMARY KEY (`ID_PEDIDO`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,5,'2026-01-14 22:07:40',80.00,'done','efectivo',NULL,'LOCAL'),(2,5,'2026-01-14 22:27:11',80.00,'prep','efectivo',NULL,'LOCAL'),(3,5,'2026-01-14 22:36:02',80.00,'prep','efectivo',NULL,'LOCAL'),(4,5,'2026-01-14 22:36:14',80.00,'prep','tarjeta',NULL,'LOCAL'),(5,5,'2026-01-14 23:15:55',40.00,'prep','tarjeta',NULL,'LOCAL'),(6,5,'2026-01-14 23:16:41',80.00,'prep','tarjeta',NULL,'LOCAL'),(7,5,'2026-01-14 23:33:08',160.00,'prep','tarjeta',NULL,'LOCAL'),(8,5,'2026-01-14 23:38:18',240.00,'prep','tarjeta',NULL,'LOCAL'),(9,1,'2026-01-15 02:18:10',105.00,'done','efectivo',NULL,'LOCAL'),(10,1,'2026-01-15 02:48:15',80.00,'done','efectivo',NULL,'LOCAL'),(11,1,'2026-01-15 02:48:53',80.00,'ready','efectivo',NULL,'LOCAL'),(12,5,'2026-01-15 06:26:46',400.00,'prep','efectivo',NULL,'LOCAL'),(13,5,'2026-01-15 06:27:39',120.00,'prep','tarjeta',NULL,'LOCAL'),(14,2,'2026-01-16 05:03:42',40.00,'prep','efectivo',NULL,'LOCAL'),(15,1,'2026-01-18 03:05:30',40.00,'prep','tarjeta',NULL,'LOCAL'),(16,1,'2026-01-18 03:36:02',40.00,'prep','tarjeta',NULL,'LOCAL'),(17,1,'2026-01-18 04:36:56',NULL,'prep','tarjeta',NULL,'LOCAL'),(18,1,'2026-01-18 04:36:58',40.00,'prep','tarjeta',NULL,'LOCAL'),(19,1,'2026-01-18 04:37:10',NULL,'prep','efectivo',1,'DOMICILIO'),(20,1,'2026-01-18 06:20:07',40.00,'prep','efectivo',NULL,'LOCAL'),(21,1,'2026-01-18 06:27:05',40.00,'prep','efectivo',1,'DOMICILIO'),(22,1,'2026-01-18 06:27:16',40.00,'prep','efectivo',NULL,'LOCAL'),(23,1,'2026-01-18 06:40:45',40.00,'prep','tarjeta',1,'DOMICILIO'),(24,1,'2026-01-18 06:42:42',40.00,'prep','tarjeta',1,'DOMICILIO'),(25,1,'2026-01-18 06:44:19',40.00,'prep','tarjeta',1,'DOMICILIO'),(26,1,'2026-01-18 06:45:07',40.00,'prep','tarjeta',1,'DOMICILIO'),(27,1,'2026-01-18 06:58:17',40.00,'prep','tarjeta',1,'DOMICILIO'),(28,1,'2026-01-18 07:01:48',40.00,'prep','tarjeta',1,'DOMICILIO'),(29,1,'2026-01-18 07:05:28',40.00,'prep','tarjeta',1,'DOMICILIO'),(30,1,'2026-01-18 07:05:28',40.00,'prep','tarjeta',1,'DOMICILIO'),(31,1,'2026-01-18 07:10:37',40.00,'prep','tarjeta',NULL,'LOCAL'),(32,1,'2026-01-18 07:37:52',40.00,'prep','tarjeta',NULL,'LOCAL');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platillos`
--

DROP TABLE IF EXISTS `platillos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platillos` (
  `ID_PLATILLO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(100) NOT NULL,
  `PRECIO` decimal(10,2) NOT NULL,
  `DISPONIBLE` tinyint(1) DEFAULT '1',
  `DESCRIPCION` text,
  `IMAGEN` varchar(255) DEFAULT NULL,
  `ACTIVO` tinyint(1) DEFAULT '1',
  `STOCK` int NOT NULL DEFAULT '0',
  `CATEGORIA` varchar(50) DEFAULT NULL,
  `TIEMPO_PREPARACION` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`ID_PLATILLO`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platillos`
--

LOCK TABLES `platillos` WRITE;
/*!40000 ALTER TABLE `platillos` DISABLE KEYS */;
INSERT INTO `platillos` VALUES (1,'Barbacoas',40.00,1,'Suave, jugosa y con auténtico sabor tradicional, perfecta para comenzar el día con energía','1768239270216-images (4).jpg',1,4,'undefined','15'),(2,'huevos Revueltos',80.00,1,'Clásicos, esponjosos y recién preparados, ideales para un desayuno rápido y delicioso.','huevos.jpg',1,0,'desayuno',''),(3,'Flautas Ahogadas',80.00,1,'Crocantes por fuera, bañadas en salsa y acompañadas de crema y queso para un antojo irresistible.','flautasah.jpg',1,0,NULL,''),(4,'Enchiladas',80.00,1,'Tortillas suaves rellenas y cubiertas de salsa, crema y queso, con el auténtico toque mexicano','enchiladas.jpg',1,0,NULL,''),(5,'Chilaquiles',80.00,1,'Totopos crujientes bañados en salsa roja o verde, acompañados de crema, queso y el toque casero que amas.','chilquiles.jpg',1,0,NULL,''),(6,'Molletes',80.00,1,'Pan suave con frijoles, queso gratinado y pico de gallo fresco, un desayuno sencillo pero lleno de sabor.','molletes.jpg',1,0,NULL,''),(7,'prueba',25.00,1,'agua de chia','1768443413773-Aguaconchia.jpg',1,0,NULL,''),(8,'extra',10.00,1,'extra','1768458631683-5e24abf767caa628583348-e1644352382351-635x635.jpeg',1,0,NULL,''),(9,'Tacos de enchilada',20.00,1,'tacos de carne enchilada con piña','1768630143284-Enchilada-ta-02.jpg',1,10,'Tacos','30'),(10,'prueba',7.00,1,'hola','1768630672780-logo_upiita.png',1,0,'Tacos','20'),(11,'Agua de limon con chia',15.00,1,'agua de limon','1768631757771-Aguaconchia.jpg',1,5,'Bebida','10');
/*!40000 ALTER TABLE `platillos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reseñas`
--

DROP TABLE IF EXISTS `reseñas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reseñas` (
  `ID_RESEÑA` int NOT NULL AUTO_INCREMENT,
  `ID_PLATILLO` int DEFAULT NULL,
  `ID_CUENTA` int DEFAULT NULL,
  `CALIFICACION` int DEFAULT NULL,
  `COMENTARIOS` text,
  `FECHA` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_RESEÑA`),
  KEY `ID_PLATILLO` (`ID_PLATILLO`),
  KEY `ID_CUENTA` (`ID_CUENTA`),
  CONSTRAINT `reseñas_ibfk_1` FOREIGN KEY (`ID_PLATILLO`) REFERENCES `platillos` (`ID_PLATILLO`),
  CONSTRAINT `reseñas_ibfk_2` FOREIGN KEY (`ID_CUENTA`) REFERENCES `cuentas` (`ID_CUENTA`),
  CONSTRAINT `reseñas_chk_1` CHECK ((`calificacion` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reseñas`
--

LOCK TABLES `reseñas` WRITE;
/*!40000 ALTER TABLE `reseñas` DISABLE KEYS */;
INSERT INTO `reseñas` VALUES (1,2,1,5,'muy rico','2026-01-14 02:56:53'),(2,2,1,5,'estaba muy rico, la carne bien cocida','2026-01-14 03:57:54'),(3,2,2,1,'admin reseña','2026-01-14 04:34:52');
/*!40000 ALTER TABLE `reseñas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarjetas`
--

DROP TABLE IF EXISTS `tarjetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarjetas` (
  `ID_TARJETA` int NOT NULL AUTO_INCREMENT,
  `ID_CUENTA` int NOT NULL,
  `TITULAR` varchar(100) DEFAULT NULL,
  `NUM_TARJETA` varchar(20) DEFAULT NULL,
  `FECHA_EXP` varchar(10) DEFAULT NULL,
  `CVV` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`ID_TARJETA`),
  KEY `ID_CUENTA` (`ID_CUENTA`),
  CONSTRAINT `tarjetas_ibfk_1` FOREIGN KEY (`ID_CUENTA`) REFERENCES `cuentas` (`ID_CUENTA`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarjetas`
--

LOCK TABLES `tarjetas` WRITE;
/*!40000 ALTER TABLE `tarjetas` DISABLE KEYS */;
INSERT INTO `tarjetas` VALUES (1,1,'Salazar Fuentes','1234567891234567','20/35','456'),(2,1,'Salazar Fuentes','1234567891234567','20/35','000'),(3,1,'Salazar Fuentes','1234567891234567','20/35','000'),(4,1,'Salazar Fuentes','1234567891234567','20/35','000'),(5,1,'Salazar Fuentes','1234567891234567','20/35','000');
/*!40000 ALTER TABLE `tarjetas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-18 21:23:05
