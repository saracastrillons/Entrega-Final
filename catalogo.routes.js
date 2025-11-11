const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

// publicar un libro
router.post('/publicar', auth, async (req,res)=>{
  const { id_Libro, precio } = req.body; // precio null=solo visible; >0 = venta
  const [own] = await pool.query('SELECT propietario FROM LIBRO WHERE id_Libro=?',[id_Libro]);
  if(!own.length || own[0].propietario !== req.user.id_Usuario) return res.status(403).json({error:'No autorizado'});
  const [r] = await pool.query(
    'INSERT INTO PUBLICACION (id_Libro,publicado_Por,estado,precio) VALUES (?,?,?,?)',
    [id_Libro, req.user.id_Usuario, 'activa', (precio===null||precio===undefined)? null : precio]
  );
  res.json({ id_Publicacion: r.insertId });
});

// catálogo público (no requiere auth) con paginación & orden por título
router.get('/listar', async (req,res)=>{
  const page = Number(req.query.page||1);
  const size = Number(req.query.size||10);
  const q = req.query.q || '';
  const offset = (page-1)*size;
  const [rows] = await pool.query(`
    SELECT P.id_Publicacion, L.nombre_Libro, L.autor, P.precio, P.estado
    FROM PUBLICACION P
    JOIN LIBRO L ON L.id_Libro = P.id_Libro
    WHERE P.estado='activa' AND (L.nombre_Libro LIKE ? OR L.autor LIKE ?)
    ORDER BY L.nombre_Libro ASC
    LIMIT ? OFFSET ?`, [`%${q}%`,`%${q}%`, size, offset]);
  res.json(rows);
});

module.exports = router;
