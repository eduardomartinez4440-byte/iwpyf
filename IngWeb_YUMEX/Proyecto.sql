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
  `ROL` enum('Invitado','Cliente','Administrador') NOT NULL DEFAULT 'Cliente',
  `ACTIVO` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ID_CUENTA`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas`
--

LOCK TABLES `cuentas` WRITE;
/*!40000 ALTER TABLE `cuentas` DISABLE KEYS */;
INSERT INTO `cuentas` VALUES (1,'Luis','LuisEnrique@gmail.com','Le982895544',NULL,'Cliente',1),(2,'Lalo','MartinezAparicio@gmail.com','Ma123456789',NULL,'Administrador',1),(3,'prueba','Prueba@gmail.com','Pr982895544',NULL,'Cliente',1),(4,'Renata','RenataLadron@gmail.com','Rl123456789',NULL,'Administrador',1);
/*!40000 ALTER TABLE `cuentas` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalle`
--

LOCK TABLES `pedido_detalle` WRITE;
/*!40000 ALTER TABLE `pedido_detalle` DISABLE KEYS */;
INSERT INTO `pedido_detalle` VALUES (1,1,2,1,80.00),(2,2,3,1,80.00),(3,3,1,1,40.00);
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
  `ID_PLATILLO` int DEFAULT NULL,
  `CANTIDAD` int DEFAULT NULL,
  `TOTAL` decimal(10,2) DEFAULT NULL,
  `ESTADO` varchar(20) NOT NULL DEFAULT 'prep',
  PRIMARY KEY (`ID_PEDIDO`),
  KEY `ID_PLATILLO` (`ID_PLATILLO`),
  KEY `ID_CUENTA` (`ID_CUENTA`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`ID_PLATILLO`) REFERENCES `platillos` (`ID_PLATILLO`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`ID_CUENTA`) REFERENCES `cuentas` (`ID_CUENTA`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,2,'2026-01-12 14:17:57',NULL,NULL,80.00,'prep'),(2,1,'2026-01-12 17:07:33',NULL,NULL,80.00,'prep'),(3,2,'2026-01-12 17:34:47',NULL,NULL,40.00,'prep');
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
  PRIMARY KEY (`ID_PLATILLO`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platillos`
--

LOCK TABLES `platillos` WRITE;
/*!40000 ALTER TABLE `platillos` DISABLE KEYS */;
INSERT INTO `platillos` VALUES (1,'Barbacoas',40.00,1,'Suave, jugosa y con auténtico sabor tradicional, perfecta para comenzar el día con energía','1768239270216-images (4).jpg',1),(2,'huevos Revueltos',80.00,1,'Clásicos, esponjosos y recién preparados, ideales para un desayuno rápido y delicioso.','huevos.jpg',1),(3,'Flautas Ahogadas',80.00,1,'Crocantes por fuera, bañadas en salsa y acompañadas de crema y queso para un antojo irresistible.','flautasah.jpg',1),(4,'Enchiladas',80.00,1,'Tortillas suaves rellenas y cubiertas de salsa, crema y queso, con el auténtico toque mexicano','enchiladas.jpg',1),(5,'Chilaquiles',80.00,1,'Totopos crujientes bañados en salsa roja o verde, acompañados de crema, queso y el toque casero que amas.','chilquiles.jpg',1),(6,'Molletes',80.00,1,'Pan suave con frijoles, queso gratinado y pico de gallo fresco, un desayuno sencillo pero lleno de sabor.','molletes.jpg',1);
/*!40000 ALTER TABLE `platillos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 12:55:23
