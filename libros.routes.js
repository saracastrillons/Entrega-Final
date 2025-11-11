const router = require('express').Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

// Crear libro
router.post('/', auth, async (req,res)=>{
  const { nombre_Libro, autor, publicacion, condicion } = req.body;
  if(!nombre_Libro || !autor) return res.status(400).json({error:'nombre_Libro y autor son requeridos'});
  const propietario = req.user.id_Usuario;
  const [r] = await pool.query(
    'INSERT INTO LIBRO (propietario,nombre_Libro,autor,publicacion,condicion) VALUES (?,?,?,?,?)',
    [propietario, nombre_Libro, autor, publicacion || null, condicion || 'bueno']
  );
  res.json({ id_Libro: r.insertId });
});

// Modificar (solo dueño)
router.put('/:id', auth, async (req,res)=>{
  const { id } = req.params;
  const { nombre_Libro, autor, publicacion, condicion } = req.body;
  const [owner] = await pool.query('SELECT propietario FROM LIBRO WHERE id_Libro=?',[id]);
  if(!owner.length) return res.status(404).json({error:'No existe'});
  if(owner[0].propietario !== req.user.id_Usuario) return res.status(403).json({error:'No autorizado'});
  await pool.query(
    'UPDATE LIBRO SET nombre_Libro=?, autor=?, publicacion=?, condicion=? WHERE id_Libro=?',
    [nombre_Libro, autor, publicacion, condicion, id]
  );
  res.json({ ok:true });
});

// Borrar (solo dueño)
router.delete('/:id', auth, async (req,res)=>{
  const { id } = req.params;
  const [owner] = await pool.query('SELECT propietario FROM LIBRO WHERE id_Libro=?',[id]);
  if(!owner.length) return res.status(404).json({error:'No existe'});
  if(owner[0].propietario !== req.user.id_Usuario) return res.status(403).json({error:'No autorizado'});
  await pool.query('DELETE FROM LIBRO WHERE id_Libro=?',[id]);
  res.json({ ok:true });
});

// Listar mis libros
router.get('/mios', auth, async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM LIBRO WHERE propietario=?',[req.user.id_Usuario]);
  res.json(rows);
});

module.exports = router;
