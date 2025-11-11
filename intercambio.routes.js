const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');
const svc = require('../services/intercambio.service');

router.post('/solicitar', auth, async (req,res)=>{
  const { id_Publicacion, id_Ciudad_Intercambio } = req.body;
  const [p] = await pool.query('SELECT publicado_Por FROM PUBLICACION WHERE id_Publicacion=?',[id_Publicacion]);
  if(!p.length) return res.status(404).json({error:'Publicación no existe'});
  const id_Dueno = p[0].publicado_Por;

  const [r] = await pool.query(
    `INSERT INTO INTERCAMBIO (id_Publicacion,id_Solicitante,id_Dueno,id_Ciudad_Intercambio,estado_Intercambio)
     VALUES (?,?,?,?, 'pendiente')`,
    [id_Publicacion, req.user.id_Usuario, id_Dueno, id_Ciudad_Intercambio]
  );
  res.json({ id_Intercambio: r.insertId });
});

router.get('/pendientes/recibidas', auth, async (req,res)=>{
  const [rows] = await pool.query(
    `SELECT I.*, L.nombre_Libro
     FROM INTERCAMBIO I
     JOIN PUBLICACION P ON P.id_Publicacion=I.id_Publicacion
     JOIN LIBRO L ON L.id_Libro=P.id_Libro
     WHERE I.id_Dueno=? AND I.estado_Intercambio='pendiente'`,
     [req.user.id_Usuario]
  );
  res.json(rows);
});

router.post('/:id/aceptar', auth, async (req,res)=>{
  try {
    const r = await svc.aceptarIntercambio(req.params.id, req.user.id_Usuario);
    res.json(r);
  } catch(e){ res.status(400).json({error:e.message}); }
});

module.exports = router;
