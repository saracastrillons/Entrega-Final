const pool = require('../db');

async function comprar(id_Publicacion, id_Comprador, id_Ciudad_Venta, precio){
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [pub] = await conn.query('SELECT * FROM PUBLICACION WHERE id_Publicacion=? FOR UPDATE',[id_Publicacion]);
    if(!pub.length) throw new Error('No existe');
    if(pub[0].estado !== 'activa') throw new Error('No disponible');

    const id_Vendedor = pub[0].publicado_Por;
    const valor = (precio!==undefined && precio!==null) ? precio : pub[0].precio;
    if(!valor) throw new Error('Precio requerido');

    const [venta] = await conn.query(
      `INSERT INTO VENTA (id_Publicacion,id_Vendedor,id_Comprador,id_Ciudad_Venta,estado_Venta,precio)
       VALUES (?,?,?,?, 'pendiente', ?)`,
      [id_Publicacion, id_Vendedor, id_Comprador, id_Ciudad_Venta, valor]
    );
    await conn.query(`UPDATE PUBLICACION SET estado='pausada' WHERE id_Publicacion=?`,[id_Publicacion]);

    await conn.commit();
    return { id_Venta: venta.insertId };
  } catch(e){
    await conn.rollback(); throw e;
  } finally { conn.release(); }
}

module.exports = { comprar };
