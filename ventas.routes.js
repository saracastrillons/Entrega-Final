const router = require('express').Router();
const auth = require('../middlewares/auth');
const pool = require('../db');
const svc = require('../services/ventas.service');

router.post('/comprar', auth, async (req,res)=>{
  const { id_Publicacion, id_Ciudad_Venta, precio } = req.body;
  try {
    const r = await svc.comprar(id_Publicacion, req.user.id_Usuario, id_Ciudad_Venta, precio);
    res.json(r);
  } catch(e){ res.status(400).json({error:e.message}); }
});

router.get('/mias', auth, async (req,res)=>{
  const [rows] = await pool.query(
    `SELECT V.*, L.nombre_Libro, P.precio as precio_publicacion
     FROM VENTA V
     JOIN PUBLICACION P ON P.id_Publicacion=V.id_Publicacion
     JOIN LIBRO L ON L.id_Libro=P.id_Libro
     WHERE V.id_Comprador=?`, [req.user.id_Usuario]
  );
  res.json(rows);
});

module.exports = router;
