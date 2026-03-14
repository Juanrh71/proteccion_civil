import { Router } from 'express'
import pool from '../db/connection.js'

const router = Router()

/** GET /api/incidentes - Listar todos los incidentes */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, fecha FROM incidentes ORDER BY fecha DESC'
    )
    const incidentes = rows.map((r) => ({
      id: r.id,
      tipo: r.tipo,
      tipo_nombre: r.tipo_nombre,
      categoria: r.categoria,
      descripcion: r.descripcion || '',
      lat: Number(r.lat),
      lng: Number(r.lng),
      municipio: r.municipio || '',
      fecha: r.fecha ? new Date(r.fecha).toISOString() : null,
    }))
    res.json(incidentes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener incidentes' })
  }
})

/** POST /api/incidentes - Crear incidente */
router.post('/', async (req, res) => {
  try {
    const { tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, fecha } = req.body
    if (tipo == null || lat == null || lng == null) {
      return res.status(400).json({ error: 'Faltan tipo, lat o lng' })
    }
    const [result] = await pool.query(
      `INSERT INTO incidentes (tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo,
        tipo_nombre || tipo,
        categoria || 'otro',
        descripcion || '',
        lat,
        lng,
        municipio || null,
        fecha ? new Date(fecha) : new Date(),
      ]
    )
    const [rows] = await pool.query(
      'SELECT id, tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, fecha FROM incidentes WHERE id = ?',
      [result.insertId]
    )
    const nuevo = rows[0]
    res.status(201).json({
      id: nuevo.id,
      tipo: nuevo.tipo,
      tipo_nombre: nuevo.tipo_nombre,
      categoria: nuevo.categoria,
      descripcion: nuevo.descripcion || '',
      lat: Number(nuevo.lat),
      lng: Number(nuevo.lng),
      municipio: nuevo.municipio || '',
      fecha: nuevo.fecha ? new Date(nuevo.fecha).toISOString() : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al guardar incidente' })
  }
})

/** PUT /api/incidentes/:id - Actualizar incidente */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' })
    const { tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, fecha } = req.body
    if (tipo == null || lat == null || lng == null) {
      return res.status(400).json({ error: 'Faltan tipo, lat o lng' })
    }
    const [result] = await pool.query(
      `UPDATE incidentes SET tipo = ?, tipo_nombre = ?, categoria = ?, descripcion = ?, lat = ?, lng = ?, municipio = ?, fecha = ? WHERE id = ?`,
      [
        tipo,
        tipo_nombre || tipo,
        categoria || 'otro',
        descripcion || '',
        lat,
        lng,
        municipio || null,
        fecha ? new Date(fecha) : new Date(),
        id,
      ]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const [rows] = await pool.query(
      'SELECT id, tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, fecha FROM incidentes WHERE id = ?',
      [id]
    )
    const actualizado = rows[0]
    res.json({
      id: actualizado.id,
      tipo: actualizado.tipo,
      tipo_nombre: actualizado.tipo_nombre,
      categoria: actualizado.categoria,
      descripcion: actualizado.descripcion || '',
      lat: Number(actualizado.lat),
      lng: Number(actualizado.lng),
      municipio: actualizado.municipio || '',
      fecha: actualizado.fecha ? new Date(actualizado.fecha).toISOString() : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar incidente' })
  }
})

export default router
