const pool = require('../db');

async function aceptarIntercambio(id_Intercambio, id_Dueno){
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM INTERCAMBIO WHERE id_Intercambio=? FOR UPDATE',[id_Intercambio]);
    if(!rows.length) throw new Error('No existe');
    const i = rows[0];
    if(i.id_Dueno !== id_Dueno) throw new Error('No autorizado');
    if(i.estado_Intercambio !== 'pendiente') throw new Error('Estado inválido');

    await conn.query(`UPDATE INTERCAMBIO SET estado_Intercambio='aceptado' WHERE id_Intercambio=?`,[id_Intercambio]);
    await conn.query(`UPDATE PUBLICACION SET estado='pausada' WHERE id_Publicacion=?`,[i.id_Publicacion]);
    await conn.commit();
    return { ok:true };
  } catch(e){
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { aceptarIntercambio };
