import pool from './connection.js'
import { CATEGORIAS_INICIO, TIPOS_INICIO, GRUPO_POR_TIPO } from './semillaCatalogoData.js'

function trunc100(s) {
  const t = String(s || '').trim()
  return t.length > 100 ? t.slice(0, 100) : t
}

/**
 * Sólo si tablas de catálogo están vacías: inserta categorías y tipos iniciales.
 */
export async function seedCatalogoVacio() {
  const [rc] = await pool.query('SELECT COUNT(*) as n FROM categorias_incidentes')
  const [rt] = await pool.query('SELECT COUNT(*) as n FROM tipos_de_incidentes')
  if ((rc[0]?.n ?? 0) > 0 || (rt[0]?.n ?? 0) > 0) {
    return
  }
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const mapSlugCatId = {}
    for (const cat of CATEGORIAS_INICIO) {
      const [r] = await conn.query(
        `INSERT INTO categorias_incidentes (slug, nombre, color, activo, orden, emergencia)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [cat.slug, cat.nombre, cat.color, cat.orden, cat.emergencia || 'Si']
      )
      mapSlugCatId[cat.slug] = r.insertId
    }
    for (const tip of TIPOS_INICIO) {
      const g = GRUPO_POR_TIPO[tip.slug] || 'otro'
      const idC = mapSlugCatId[g]
      if (idC == null) {
        console.warn('[seed] Tipo sin categoría, omitido:', tip.slug, g)
        continue
      }
      await conn.query(
        `INSERT INTO tipos_de_incidentes (slug, nombre, id_categoria, activo, orden)
         VALUES (?, ?, ?, 1, 0)`,
        [tip.slug, trunc100(tip.nombre), idC]
      )
    }
    await conn.commit()
    console.log('[db] Catálogo de incidentes sembrado (categorías y tipos).')
  } catch (e) {
    await conn.rollback()
    console.warn('[db] No se pudo sembrar catálogo:', e.message)
  } finally {
    conn.release()
  }
}
