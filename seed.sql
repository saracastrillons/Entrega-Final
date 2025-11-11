USE librosdb;

INSERT INTO CIUDAD (nombre_Ciudad,pais,departamento_Pais)
VALUES ('Medellín','Colombia','Antioquia'),
       ('Bogotá','Colombia','Cundinamarca'),
       ('Cali','Colombia','Valle del Cauca');

INSERT INTO USUARIO (id_Ciudad,nombre,correo,telefono)
VALUES 
 (1,'Admin','admin@libros.com','3000000000'),
 (1,'Sara','sara@ejemplo.com','3011112233'),
 (2,'Juan','juan@ejemplo.com','3029997788'),
 (3,'Ana','ana@ejemplo.com','3004445566');

INSERT INTO LIBRO (propietario,nombre_Libro,autor,publicacion,condicion)
VALUES 
 (2,'Cien años de soledad','Gabriel García Márquez',1967,'bueno'),
 (3,'Rayuela','Julio Cortázar',1963,'como_nuevo'),
 (4,'El amor en los tiempos del cólera','Gabriel García Márquez',1985,'nuevo');

INSERT INTO PUBLICACION (id_Libro, publicado_Por, estado, precio)
VALUES
 (1,2,'activa',120000.00),   -- venta
 (2,3,'activa',NULL),        -- solo visible / intercambio
 (3,4,'activa',80000.00);    -- venta

INSERT INTO RESENA (id_Usuario,id_Publicacion,calificacion,comentario)
VALUES (3,1,5,'Obra maestra'),
       (2,1,4,'Muy bueno'),
       (2,2,5,'Imperdible en club');

INSERT INTO CLUB_DE_LECTURA (id_Publicacion, nombre_Club, fecha_Creacion_Club, descripcion, lugar)
VALUES (1,'Macondo Club',CURRENT_DATE(),'Lectura conjunta de Gabo','Virtual');

INSERT INTO MIEMBROS_CLUB (id_Club,id_Usuario,rol) VALUES (1,2,'admin'),(1,3,'miembro');
