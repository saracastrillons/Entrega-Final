USE librosdb;

-- Ciudades
INSERT INTO CIUDAD (nombre_Ciudad,pais,departamento_Pais) VALUES
('Medellín','Colombia','Antioquia'),
('Bogotá','Colombia','Cundinamarca'),
('Cali','Colombia','Valle del Cauca');

-- Usuarios (PIN = últimos 4 del teléfono)
INSERT INTO USUARIO (id_Ciudad,nombre,correo,telefono) VALUES
(1,'Admin','admin@libros.com','3000000000'),
(1,'Sara','sara@ejemplo.com','3011112233'),
(2,'Juan','juan@ejemplo.com','3029997788'),
(3,'Ana','ana@ejemplo.com','3004445566');

-- Libros (propietario = id_Usuario)
INSERT INTO LIBRO (propietario,nombre_Libro,autor,publicacion,condicion) VALUES
(2,'Cien años de soledad','Gabriel García Márquez',1967,'bueno'),
(2,'El amor en los tiempos del cólera','Gabriel García Márquez',1985,'como_nuevo'),
(3,'Rayuela','Julio Cortázar',1963,'aceptable'),
(4,'La hojarasca','Gabriel García Márquez',1955,'deteriorado');

-- Publicaciones (precio NULL = solo visible/intercambio; >0 = venta)
INSERT INTO PUBLICACION (id_Libro, publicado_Por, estado, precio) VALUES
(1,2,'activa',120000.00),   -- venta
(2,2,'activa',NULL),        -- visible/intercambio
(3,3,'activa',80000.00);    -- venta

-- Reseñas
INSERT INTO RESENA (id_Usuario,id_Publicacion,calificacion,comentario) VALUES
(3,1,5,'Obra maestra'),
(2,1,4,'Muy bueno'),
(2,2,5,'Ideal para club de lectura');

-- Club de lectura + miembros
INSERT INTO CLUB_DE_LECTURA (id_Publicacion,nombre_Club,fecha_Creacion_Club,descripcion,lugar) VALUES
(1,'Macondo Club',CURRENT_DATE(),'Lectura conjunta de Gabo','Virtual');

INSERT INTO MIEMBROS_CLUB (id_Club,id_Usuario,rol) VALUES
(1,2,'admin'),
(1,3,'miembro');
