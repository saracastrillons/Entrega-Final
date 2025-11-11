const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const auth = require('./routes/auth.routes');
const libros = require('./routes/libros.routes');
const catalogo = require('./routes/catalogo.routes');
const resenas = require('./routes/resenas.routes');
const clubes = require('./routes/clubes.routes');
const intercambio = require('./routes/intercambio.routes');
const ventas = require('./routes/ventas.routes');
const reportes = require('./routes/reportes.routes');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', auth);
app.use('/api/libros', libros);
app.use('/api/catalogo', catalogo);
app.use('/api/resenas', resenas);
app.use('/api/clubes', clubes);
app.use('/api/intercambio', intercambio);
app.use('/api/ventas', ventas);
app.use('/api/reportes', reportes);

app.get('/api/health', (_,res)=>res.json({ok:true}));

module.exports = app;
