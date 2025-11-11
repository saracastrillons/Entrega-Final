const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Login por correo + PIN (últimos 4 dígitos del teléfono)
router.post('/login', async (req,res)=>{
  const { correo, pin } = req.body;
  if(!correo || !pin) return res.status(400).json({error:'correo y pin son requeridos'});
  const [rows] = await pool.query('SELECT id_Usuario, correo, telefono FROM USUARIO WHERE correo=?',[correo]);
  if(!rows.length) return res.status(401).json({error:'Credenciales inválidas'});
  const user = rows[0];
  const last4 = (user.telefono || '').slice(-4);
  if(last4 !== String(pin)) return res.status(401).json({error:'PIN incorrecto'});
  const token = jwt.sign({ id_Usuario: user.id_Usuario, correo: user.correo }, process.env.JWT_SECRET, {expiresIn:'8h'});
  res.json({ token });
});

module.exports = router;
