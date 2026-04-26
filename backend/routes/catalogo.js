import { Router } from 'express'
import pool from '../db/connection.js'
import { requireUser, requireAdmin } from '../middleware/jwtUser.js'

const router = Router()

const SLUG_RE = /^[a-z0-9_]{1,100}$/

function slugify(nombre) {
  const t = String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100)
  return t || 'categoria'
}

function trunc100(s) {
  const t = String(s || '').trim()
  return t.length > 100 ? t.slice(0, 100) : t
}

/** Catálogo activo: categorías con tipos activos (formulario registro, leyenda). */
router.get('/registro', requireUser, async (req, res) => {
  try {
    const [cats] = await pool.query(
      `SELECT id, slug, nombre, color, emergencia, orden
       FROM categorias_incidentes
       WHERE activo = 1
       ORDER BY orden ASC, id ASC`
    )
    const [tips] = await pool.query(
      `SELECT t.id, t.slug, t.nombre, t.id_categoria, t.activo, t.orden
       FROM tipos_de_incidentes t
       INNER JOIN categorias_incidentes c ON c.id = t.id_categoria AND c.activo = 1
       WHERE t.activo = 1
       ORDER BY t.orden ASC, t.id ASC`
    )
    const byCat = {}
    for (const t of tips) {
      if (!byCat[t.id_categoria]) byCat[t.id_categoria] = []
      byCat[t.id_categoria].push({
        id: t.id,
        slug: t.slug,
        nombre: t.nombre,
        orden: t.orden,
      })
    }
    const categorias = (cats || []).map((c) => ({
      id: c.id,
      slug: c.slug,
      nombre: c.nombre,
      color: c.color || '#64748b',
      emergencia: c.emergencia,
      orden: c.orden,
      tipos: byCat[c.id] || [],
    }))
    res.json({ categorias })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar el catálogo.' })
  }
})

/** Toda la jerarquía (admin): incluye inactivos. */
router.get('/completo', requireAdmin, async (req, res) => {
  try {
    const [cats] = await pool.query(
      `SELECT id, slug, nombre, color, activo, orden, emergencia
       FROM categorias_incidentes
       ORDER BY orden ASC, id ASC`
    )
    const [tips] = await pool.query(
      `SELECT id, slug, nombre, id_categoria, activo, orden
       FROM tipos_de_incidentes
       ORDER BY id_categoria ASC, orden ASC, id ASC`
    )
    const byCat = {}
    for (const t of tips) {
      if (!byCat[t.id_categoria]) byCat[t.id_categoria] = []
      byCat[t.id_categoria].push(t)
    }
    res.json({
      categorias: (cats || []).map((c) => ({
        ...c,
        activo: c.activo === 1 || c.activo === true,
        tipos: (byCat[c.id] || []).map((t) => ({
          ...t,
          activo: t.activo === 1 || t.activo === true,
        })),
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar el catálogo (admin).' })
  }
})

router.post('/categorias', requireAdmin, async (req, res) => {
  try {
    const { nombre, slug: slugIn, color, emergencia, orden } = req.body
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: 'Indique el nombre de la categoría.' })
    }
    const slug = (slugIn && String(slugIn).trim()) || slugify(nombre)
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({
        error: 'El identificador (slug) solo puede usar minúsculas, números y guion bajo.',
      })
    }
    const [dup] = await pool.query('SELECT id FROM categorias_incidentes WHERE slug = ?', [slug])
    if (dup.length) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese identificador.' })
    }
    const col = color && String(color).trim() ? String(color).trim() : '#64748b'
    const em = emergencia === 'No' ? 'No' : 'Si'
    const or = Number.isFinite(Number(orden)) ? Math.floor(Number(orden)) : 0
    const [r] = await pool.query(
      `INSERT INTO categorias_incidentes (slug, nombre, color, activo, orden, emergencia)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [slug, trunc100(nombre), col, or, em]
    )
    res.status(201).json({
      id: r.insertId,
      slug,
      nombre: trunc100(nombre),
      color: col,
      activo: true,
      orden: or,
      emergencia: em,
    })
  } catch (err) {
    console.error(err)
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Identificador duplicado.' })
    }
    res.status(500).json({ error: 'Error al crear la categoría.' })
  }
})

router.patch('/categorias/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' })
    const { activo, nombre, color, orden, emergencia } = req.body
    const [prev] = await pool.query('SELECT id FROM categorias_incidentes WHERE id = ?', [id])
    if (!prev.length) return res.status(404).json({ error: 'Categoría no encontrada' })
    const parts = []
    const vals = []
    if (activo !== undefined) {
      parts.push('activo = ?')
      vals.push(activo === true || activo === 1 || activo === '1' ? 1 : 0)
    }
    if (nombre != null && String(nombre).trim() !== '') {
      parts.push('nombre = ?')
      vals.push(trunc100(nombre))
    }
    if (color != null && String(color).trim() !== '') {
      parts.push('color = ?')
      vals.push(String(color).trim())
    }
    if (orden !== undefined && Number.isFinite(Number(orden))) {
      parts.push('orden = ?')
      vals.push(Math.floor(Number(orden)))
    }
    if (emergencia === 'Si' || emergencia === 'No') {
      parts.push('emergencia = ?')
      vals.push(emergencia)
    }
    if (parts.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar.' })
    }
    vals.push(id)
    await pool.query(
      `UPDATE categorias_incidentes SET ${parts.join(', ')} WHERE id = ?`,
      vals
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar la categoría.' })
  }
})

router.post('/tipos', requireAdmin, async (req, res) => {
  try {
    const { id_categoria, nombre, slug: slugIn, orden } = req.body
    const idCat = parseInt(id_categoria, 10)
    if (isNaN(idCat)) {
      return res.status(400).json({ error: 'Indique la categoría (id_categoria).' })
    }
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: 'Indique el nombre del tipo.' })
    }
    const [c] = await pool.query('SELECT id FROM categorias_incidentes WHERE id = ?', [idCat])
    if (!c.length) {
      return res.status(400).json({ error: 'Categoría no encontrada.' })
    }
    const slug = (slugIn && String(slugIn).trim()) || slugify(nombre)
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({
        error: 'El identificador (slug) solo puede usar minúsculas, números y guion bajo.',
      })
    }
    const or = Number.isFinite(Number(orden)) ? Math.floor(Number(orden)) : 0
    const [dup] = await pool.query('SELECT id FROM tipos_de_incidentes WHERE slug = ?', [slug])
    if (dup.length) {
      return res.status(409).json({ error: 'Ya existe un tipo con ese identificador.' })
    }
    const [r] = await pool.query(
      `INSERT INTO tipos_de_incidentes (slug, nombre, id_categoria, activo, orden)
       VALUES (?, ?, ?, 1, ?)`,
      [slug, trunc100(nombre), idCat, or]
    )
    res.status(201).json({
      id: r.insertId,
      slug,
      nombre: trunc100(nombre),
      id_categoria: idCat,
      activo: true,
      orden: or,
    })
  } catch (err) {
    console.error(err)
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Identificador duplicado.' })
    }
    res.status(500).json({ error: 'Error al crear el tipo de incidente.' })
  }
})

router.patch('/tipos/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' })
    const { activo, nombre, id_categoria, orden } = req.body
    const [prev] = await pool.query('SELECT id FROM tipos_de_incidentes WHERE id = ?', [id])
    if (!prev.length) return res.status(404).json({ error: 'Tipo no encontrado' })
    if (id_categoria != null) {
      const idCat = parseInt(id_categoria, 10)
      const [c] = await pool.query('SELECT id FROM categorias_incidentes WHERE id = ?', [idCat])
      if (!c.length) {
        return res.status(400).json({ error: 'Categoría no encontrada.' })
      }
    }
    const parts = []
    const vals = []
    if (activo !== undefined) {
      parts.push('activo = ?')
      vals.push(activo === true || activo === 1 || activo === '1' ? 1 : 0)
    }
    if (nombre != null && String(nombre).trim() !== '') {
      parts.push('nombre = ?')
      vals.push(trunc100(nombre))
    }
    if (id_categoria != null) {
      parts.push('id_categoria = ?')
      vals.push(parseInt(id_categoria, 10))
    }
    if (orden !== undefined && Number.isFinite(Number(orden))) {
      parts.push('orden = ?')
      vals.push(Math.floor(Number(orden)))
    }
    if (parts.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar.' })
    }
    vals.push(id)
    await pool.query(
      `UPDATE tipos_de_incidentes SET ${parts.join(', ')} WHERE id = ?`,
      vals
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar el tipo.' })
  }
})

export default router
