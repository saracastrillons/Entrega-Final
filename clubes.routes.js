const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

router.post('/', auth, async (req,res)=>{
  const { id_Publicacion, nombre_Club, descripcion, lugar } = req.body;
  const [r] = await pool.query(
    `INSERT INTO CLUB_DE_LECTURA (id_Publicacion,nombre_Club,fecha_Creacion_Club,descripcion,lugar)
     VALUES (?,?,CURRENT_DATE(),?,?)`,
    [id_Publicacion || null, nombre_Club, descripcion || null, lugar || null]
  );
  const id_Club = r.insertId;
  await pool.query(
    `INSERT INTO MIEMBROS_CLUB (id_Club,id_Usuario,rol) VALUES (?,?, 'admin')`,
    [id_Club, req.user.id_Usuario]
  );
  res.json({ id_Club });
});

router.post('/:id_Club/unirse', auth, async (req,res)=>{
  const { id_Club } = req.params;
  await pool.query(`INSERT IGNORE INTO MIEMBROS_CLUB (id_Club,id_Usuario,rol) VALUES (?,?, 'miembro')`,
    [id_Club, req.user.id_Usuario]);
  res.json({ ok:true });
});

router.get('/activos', async (req,res)=>{
  const [rows] = await pool.query(`
    SELECT C.id_Club, C.nombre_Club, C.descripcion, C.lugar, COUNT(M.id_Usuario) miembros
    FROM CLUB_DE_LECTURA C
    LEFT JOIN MIEMBROS_CLUB M ON M.id_Club=C.id_Club
    GROUP BY C.id_Club
    ORDER BY C.fecha_Creacion_Club DESC`);
  res.json(rows);
});

module.exports = router;
