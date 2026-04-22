-- Base de datos para Protección Civil Carabobo (ejecutar en MySQL / XAMPP)
CREATE DATABASE IF NOT EXISTS proteccion_civil_carabobo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proteccion_civil_carabobo;

CREATE TABLE IF NOT EXISTS incidentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(80) NOT NULL,
  tipo_nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL DEFAULT 'otro',
  descripcion TEXT,
  lat DECIMAL(10, 6) DEFAULT NULL,
  lng DECIMAL(10, 6) DEFAULT NULL,
  municipio VARCHAR(80) DEFAULT NULL,
  parroquia VARCHAR(80) DEFAULT NULL,
  via VARCHAR(500) DEFAULT NULL COMMENT 'calle, avenida o referencia',
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cerrado TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = cerrado (sincronizado con estado=cerrado)',
  estado VARCHAR(20) NOT NULL DEFAULT 'abierto' COMMENT 'abierto | en_proceso | cerrado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
