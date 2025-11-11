CREATE DATABASE IF NOT EXISTS librosdb;
USE librosdb;

CREATE TABLE CIUDAD (
  id_Ciudad INT PRIMARY KEY AUTO_INCREMENT,
  nombre_Ciudad VARCHAR(100) NOT NULL,
  pais VARCHAR(100) NOT NULL,
  departamento_Pais VARCHAR(100)
);

CREATE TABLE USUARIO (
  id_Usuario INT PRIMARY KEY AUTO_INCREMENT,
  id_Ciudad INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  telefono VARCHAR(25),
  CONSTRAINT fk_usuario_ciudad
    FOREIGN KEY (id_Ciudad) REFERENCES CIUDAD(id_Ciudad)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_usuario_correo UNIQUE (correo)
);

CREATE TABLE LIBRO (
  id_Libro INT PRIMARY KEY AUTO_INCREMENT,
  propietario INT NOT NULL,               
  nombre_Libro VARCHAR(200) NOT NULL,
  autor VARCHAR(150) NOT NULL,
  publicacion YEAR,                       
  condicion ENUM('nuevo','como_nuevo','bueno','aceptable','deteriorado') DEFAULT 'bueno',
  CONSTRAINT fk_libro_propietario
    FOREIGN KEY (propietario) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE PUBLICACION (
  id_Publicacion INT PRIMARY KEY AUTO_INCREMENT,
  id_Libro INT NOT NULL,
  publicado_Por INT NOT NULL,            
  estado ENUM('activa','pausada','cerrada') DEFAULT 'activa',
  fecha_Publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  precio DECIMAL(10,2),
  CONSTRAINT fk_publicacion_libro
    FOREIGN KEY (id_Libro) REFERENCES LIBRO(id_Libro)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_publicacion_usuario
    FOREIGN KEY (publicado_Por) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_publicacion_estado (estado),
  INDEX idx_publicacion_precio (precio)
);

CREATE TABLE RESENA (
  id_Resena INT PRIMARY KEY AUTO_INCREMENT,
  id_Usuario INT NOT NULL,
  id_Publicacion INT NOT NULL,
  calificacion TINYINT NOT NULL,
  comentario VARCHAR(500),
  fecha_Resena DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resena_usuario
    FOREIGN KEY (id_Usuario) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_resena_publicacion
    FOREIGN KEY (id_Publicacion) REFERENCES PUBLICACION(id_Publicacion)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT ck_resena_calificacion CHECK (calificacion BETWEEN 1 AND 5),
  CONSTRAINT uq_resena_unica UNIQUE (id_Usuario, id_Publicacion)
);

CREATE TABLE INTERCAMBIO (
  id_Intercambio INT PRIMARY KEY AUTO_INCREMENT,
  id_Publicacion INT NOT NULL,
  id_Solicitante INT NOT NULL,            
  id_Dueno INT NOT NULL,                  
  id_Ciudad_Intercambio INT NOT NULL,
  fecha_Intercambio DATETIME,
  estado_Intercambio ENUM('pendiente','aceptado','rechazado','realizado','cancelado') DEFAULT 'pendiente',
  CONSTRAINT fk_inter_pub
    FOREIGN KEY (id_Publicacion) REFERENCES PUBLICACION(id_Publicacion)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_inter_solicitante
    FOREIGN KEY (id_Solicitante) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inter_dueno
    FOREIGN KEY (id_Dueno) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inter_ciudad
    FOREIGN KEY (id_Ciudad_Intercambio) REFERENCES CIUDAD(id_Ciudad)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE VENTA (
  id_Venta INT PRIMARY KEY AUTO_INCREMENT,
  id_Publicacion INT NOT NULL,
  id_Vendedor INT NOT NULL,
  id_Comprador INT NOT NULL,
  id_Ciudad_Venta INT NOT NULL,
  estado_Venta ENUM('pendiente','pagada','enviada','entregada','cancelada') DEFAULT 'pendiente',
  precio DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_venta_pub
    FOREIGN KEY (id_Publicacion) REFERENCES PUBLICACION(id_Publicacion)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_venta_vendedor
    FOREIGN KEY (id_Vendedor) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venta_comprador
    FOREIGN KEY (id_Comprador) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venta_ciudad
    FOREIGN KEY (id_Ciudad_Venta) REFERENCES CIUDAD(id_Ciudad)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE CLUB_DE_LECTURA (
  id_Club INT PRIMARY KEY AUTO_INCREMENT,
  id_Publicacion INT,                    
  nombre_Club VARCHAR(150) NOT NULL,
  fecha_Creacion_Club DATE,
  descripcion VARCHAR(500),
  lugar VARCHAR(150),
  CONSTRAINT fk_club_publicacion
    FOREIGN KEY (id_Publicacion) REFERENCES PUBLICACION(id_Publicacion)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE MIEMBROS_CLUB (
  id_Club INT NOT NULL,
  id_Usuario INT NOT NULL,
  rol ENUM('admin','moderador','miembro') DEFAULT 'miembro',
  fecha_Inscripcion DATE DEFAULT (CURRENT_DATE),
  PRIMARY KEY (id_Club, id_Usuario),
  CONSTRAINT fk_miembro_club
    FOREIGN KEY (id_Club) REFERENCES CLUB_DE_LECTURA(id_Club)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_miembro_usuario
    FOREIGN KEY (id_Usuario) REFERENCES USUARIO(id_Usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
);
