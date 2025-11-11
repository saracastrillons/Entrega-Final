const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

router.get('/catalogo-ordenado', auth, async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT L.nombre_Libro, L.autor, P.id_Publicacion, P.precio, P.estado
    FROM PUBLICACION P JOIN LIBRO L ON L.id_Libro=P.id_Libro
    WHERE P.estado='activa'
    ORDER BY L.nombre_Libro ASC`);
  res.json(rows);
});

router.get('/intercambio-por-ciudad', auth, async (req,res)=>{
  const { id_Ciudad } = req.query;
  const [rows] = await pool.query(`
    SELECT L.nombre_Libro, L.autor, U.nombre as dueno, C.nombre_Ciudad
    FROM PUBLICACION P
    JOIN LIBRO L ON L.id_Libro=P.id_Libro
    JOIN USUARIO U ON U.id_Usuario=L.propietario
    JOIN CIUDAD C ON C.id_Ciudad=U.id_Ciudad
    WHERE P.estado='activa' AND P.precio IS NULL AND C.id_Ciudad=?`, [id_Ciudad]);
  res.json(rows);
});

router.get('/buscar-libros', async (req,res)=>{
  const { q='' } = req.query;
  const [rows] = await pool.query(`
    SELECT L.*, P.id_Publicacion, P.precio, P.estado
    FROM LIBRO L
    LEFT JOIN PUBLICACION P ON P.id_Libro=L.id_Libro AND P.estado='activa'
    WHERE L.nombre_Libro LIKE ? OR L.autor LIKE ?`, [`%${q}%`,`%${q}%`]);
  res.json(rows);
});

router.get('/top-resenadores', auth, async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT U.id_Usuario, U.nombre, COUNT(*) total
    FROM RESENA R
    JOIN USUARIO U ON U.id_Usuario=R.id_Usuario
    GROUP BY U.id_Usuario
    ORDER BY total DESC
    LIMIT 10`);
  res.json(rows);
});

router.get('/mas-intercambiados', auth, async (req,res)=>{
  const { desde, hasta } = req.query;
  const [rows] = await pool.query(`
    SELECT L.nombre_Libro, COUNT(*) veces
    FROM INTERCAMBIO I
    JOIN PUBLICACION P ON P.id_Publicacion=I.id_Publicacion
    JOIN LIBRO L ON L.id_Libro=P.id_Libro
    WHERE I.estado_Intercambio='realizado'
      AND I.fecha_Intercambio BETWEEN ? AND ?
    GROUP BY L.id_Libro
    ORDER BY veces DESC
    LIMIT 10`, [desde, hasta]);
  res.json(rows);
});

router.get('/en-venta-por-precio', async (req,res)=>{
  const min = Number(req.query.min || 0);
  const max = Number(req.query.max || 999999999);
  const [rows] = await pool.query(`
    SELECT L.nombre_Libro, L.autor, P.precio
    FROM PUBLICACION P
    JOIN LIBRO L ON L.id_Libro=P.id_Libro
    WHERE P.estado='activa' AND P.precio BETWEEN ? AND ?
    ORDER BY P.precio ASC`, [min, max]);
  res.json(rows);
});

router.get('/autores-mejor-calificados', async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT L.autor, AVG(R.calificacion) promedio, COUNT(*) n
    FROM RESENA R
    JOIN PUBLICACION P ON P.id_Publicacion=R.id_Publicacion
    JOIN LIBRO L ON L.id_Libro=P.id_Libro
    GROUP BY L.autor
    HAVING n >= 2
    ORDER BY promedio DESC
    LIMIT 10`);
  res.json(rows);
});

module.exports = router;
