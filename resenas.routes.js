const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

router.post('/', auth, async (req,res)=>{
  const { id_Publicacion, calificacion, comentario } = req.body;
  await pool.query(
    'INSERT INTO RESENA (id_Usuario,id_Publicacion,calificacion,comentario) VALUES (?,?,?,?)',
    [req.user.id_Usuario, id_Publicacion, calificacion, comentario || null]
  );
  res.json({ ok:true });
});

router.get('/buscar', async (req,res)=>{
  const { id_Publicacion, q='' } = req.query;
  const [rows] = await pool.query(
    `SELECT * FROM RESENA WHERE id_Publicacion=? AND (comentario LIKE ?) ORDER BY fecha_Resena DESC`,
    [id_Publicacion, `%${q}%`]
  );
  res.json(rows);
});

router.get('/de-libro/:id_Publicacion', async (req,res)=>{
  const { id_Publicacion } = req.params;
  const [resenas] = await pool.query('SELECT * FROM RESENA WHERE id_Publicacion=?',[id_Publicacion]);
  const [avg] = await pool.query('SELECT AVG(calificacion) as promedio FROM RESENA WHERE id_Publicacion=?',[id_Publicacion]);
  res.json({ resenas, promedio: Number(avg[0].promedio || 0).toFixed(2) });
});

module.exports = router;
