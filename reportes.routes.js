const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

/**
 * 1) Listar todos los libros publicados en el catálogo ordenados por título.
 */
router.get('/catalogo-ordenado', auth, async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT L.nombre_Libro, L.autor, P.id_Publicacion, P.precio, P.estado
    FROM PUBLICACION P
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE P.estado = 'activa'
    ORDER BY L.nombre_Libro ASC
  `);
  res.json(rows);
});

/**
 * 2) Libros disponibles para intercambio en una ciudad específica (paginados).
 *     Criterio: publicaciones activas con precio NULL y dueño en esa ciudad.
 *     Parámetros: id_Ciudad, page=1, size=10
 */
router.get('/intercambio-por-ciudad', auth, async (req,res)=>{
  const id_Ciudad = Number(req.query.id_Ciudad);
  const page = Number(req.query.page || 1);
  const size = Number(req.query.size || 10);
  const offset = (page-1)*size;
  if(!id_Ciudad) return res.status(400).json({error:'id_Ciudad requerido'});

  const [rows] = await pool.query(`
    SELECT P.id_Publicacion, L.nombre_Libro, L.autor, U.nombre AS dueno, C.nombre_Ciudad
    FROM PUBLICACION P
    JOIN LIBRO L   ON L.id_Libro = P.id_Libro
    JOIN USUARIO U ON U.id_Usuario = L.propietario
    JOIN CIUDAD C  ON C.id_Ciudad = U.id_Ciudad
    WHERE P.estado = 'activa' AND P.precio IS NULL AND U.id_Ciudad = ?
    ORDER BY L.nombre_Libro ASC
    LIMIT ? OFFSET ?
  `,[id_Ciudad, size, offset]);

  res.json({page, size, items: rows});
});

/**
 * 3) Buscar libros por título y autor (no hay "resumen" en el modelo).
 *     Parámetro: q
 */
router.get('/buscar-libros', async (req,res)=>{
  const q = `%${(req.query.q||'').trim()}%`;
  const [rows] = await pool.query(`
    SELECT L.id_Libro, L.nombre_Libro, L.autor, P.id_Publicacion, P.precio, P.estado
    FROM PUBLICACION P
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE P.estado='activa' AND (L.nombre_Libro LIKE ? OR L.autor LIKE ?)
    ORDER BY L.nombre_Libro ASC
  `,[q,q]);
  res.json(rows);
});

/**
 * 4) Buscar reseñas dentro de un libro (texto).
 *     Parámetros: id_Publicacion, q
 */
router.get('/buscar-resenas', async (req,res)=>{
  const { id_Publicacion, q='' } = req.query;
  if(!id_Publicacion) return res.status(400).json({error:'id_Publicacion requerido'});
  const [rows] = await pool.query(`
    SELECT R.*
    FROM RESENA R
    WHERE R.id_Publicacion = ? AND (R.comentario LIKE ?)
    ORDER BY R.fecha_Resena DESC
  `,[id_Publicacion, `%${q}%`]);
  res.json(rows);
});

/**
 * 5) Listar reseñas de un libro con su calificación promedio.
 */
router.get('/resenas-de-libro/:id_Publicacion', async (req,res)=>{
  const { id_Publicacion } = req.params;
  const [resenas] = await pool.query(
    `SELECT * FROM RESENA WHERE id_Publicacion = ? ORDER BY fecha_Resena DESC`, [id_Publicacion]
  );
  const [avg] = await pool.query(
    `SELECT AVG(calificacion) AS promedio FROM RESENA WHERE id_Publicacion = ?`, [id_Publicacion]
  );
  res.json({ resenas, promedio: Number(avg[0].promedio || 0).toFixed(2) });
});

/**
 * 6) Listar clubes de lectura activos y sus miembros (detalle).
 */
router.get('/clubes-activos-detalle', async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT C.id_Club, C.nombre_Club, C.descripcion, C.lugar,
           JSON_ARRAYAGG(JSON_OBJECT('id_Usuario', M.id_Usuario, 'rol', M.rol)) AS miembros
    FROM CLUB_DE_LECTURA C
    LEFT JOIN MIEMBROS_CLUB M ON M.id_Club = C.id_Club
    GROUP BY C.id_Club
    ORDER BY C.fecha_Creacion_Club DESC
  `);
  res.json(rows);
});

/**
 * 7) Listar propuestas de intercambio pendientes que ha recibido el usuario autenticado.
 */
router.get('/intercambios-pendientes-recibidos', auth, async (req,res)=>{
  const id = req.user.id_Usuario;
  const [rows] = await pool.query(`
    SELECT I.*, L.nombre_Libro
    FROM INTERCAMBIO I
    JOIN PUBLICACION P ON P.id_Publicacion = I.id_Publicacion
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE I.id_Dueno = ? AND I.estado_Intercambio = 'pendiente'
    ORDER BY I.id_Intercambio DESC
  `,[id]);
  res.json(rows);
});

/**
 * 8) Listar órdenes de compra del usuario (estado incluido).
 */
router.get('/ordenes-compra', auth, async (req,res)=>{
  const id = req.user.id_Usuario;
  const [rows] = await pool.query(`
    SELECT V.*, L.nombre_Libro, P.precio AS precio_publicacion
    FROM VENTA V
    JOIN PUBLICACION P ON P.id_Publicacion = V.id_Publicacion
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE V.id_Comprador = ?
    ORDER BY V.id_Venta DESC
  `,[id]);
  res.json(rows);
});

/**
 * 9) Usuarios que han hecho más reseñas en el catálogo (top N).
 *     Parámetro opcional: limit (por defecto 10)
 */
router.get('/top-resenadores', async (req,res)=>{
  const limit = Math.min(Number(req.query.limit || 10), 50);
  const [rows] = await pool.query(`
    SELECT U.id_Usuario, U.nombre, U.correo, COUNT(*) AS total_resenas
    FROM RESENA R
    JOIN USUARIO U ON U.id_Usuario = R.id_Usuario
    GROUP BY U.id_Usuario
    ORDER BY total_resenas DESC
    LIMIT ?
  `,[limit]);
  res.json(rows);
});

/**
 * 10) Libros más intercambiados en un rango de fechas (según INTERCAMBIO 'realizado').
 *      Parámetros: desde (YYYY-MM-DD), hasta (YYYY-MM-DD)
 */
router.get('/mas-intercambiados', async (req,res)=>{
  const { desde, hasta } = req.query;
  if(!desde || !hasta) return res.status(400).json({error:'desde y hasta son requeridos (YYYY-MM-DD)'});
  const [rows] = await pool.query(`
    SELECT L.id_Libro, L.nombre_Libro, COUNT(*) AS veces
    FROM INTERCAMBIO I
    JOIN PUBLICACION P ON P.id_Publicacion = I.id_Publicacion
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE I.estado_Intercambio = 'realizado'
      AND DATE(I.fecha_Intercambio) BETWEEN ? AND ?
    GROUP BY L.id_Libro
    ORDER BY veces DESC
  `,[desde, hasta]);
  res.json(rows);
});

/**
 * 11) Libros en venta dentro de un rango de precios.
 *      Parámetros: min, max
 */
router.get('/venta-por-precio', async (req,res)=>{
  const min = Number(req.query.min || 0);
  const max = Number(req.query.max || 999999999);
  const [rows] = await pool.query(`
    SELECT P.id_Publicacion, L.nombre_Libro, L.autor, P.precio
    FROM PUBLICACION P
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE P.estado = 'activa' AND P.precio IS NOT NULL
      AND P.precio BETWEEN ? AND ?
    ORDER BY P.precio ASC
  `,[min,max]);
  res.json(rows);
});

/**
 * 12) Consulta adicional (ejemplo): autores mejor calificados.
 */
router.get('/autores-mejor-calificados', async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT L.autor, AVG(R.calificacion) AS promedio, COUNT(*) AS n
    FROM RESENA R
    JOIN PUBLICACION P ON P.id_Publicacion = R.id_Publicacion
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    GROUP BY L.autor
    HAVING n >= 2
    ORDER BY promedio DESC
    LIMIT 10
  `);
  res.json(rows);
});

module.exports = router;
