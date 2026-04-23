import { Router } from 'express'
import pool from '../db/connection.js'

const router = Router()

const SELECT_CAMPOS =
  'id, tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via, fecha, cerrado, estado, resultado_cierre, observacion_cierre_abierto'

function estadoDesdeFila(r) {
  const cerr = r.cerrado === 1 || r.cerrado === true
  const e = String(r.estado != null ? r.estado : '')
    .trim()
    .toLowerCase()
  if (cerr || e === 'cerrado') return { estado: 'cerrado', cerrado: true }
  if (e === 'en_proceso') return { estado: 'en_proceso', cerrado: false }
  return { estado: 'abierto', cerrado: false }
}

const SELECT_LISTADO = `${SELECT_CAMPOS}, TIMESTAMPDIFF(SECOND, fecha, NOW()) AS segundos_desde_registro`

function coorANumeroONull(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function mapRow(r) {
  const { estado, cerrado } = estadoDesdeFila(r)
  return {
    id: r.id,
    tipo: r.tipo,
    tipo_nombre: r.tipo_nombre,
    categoria: r.categoria,
    descripcion: r.descripcion || '',
    lat: coorANumeroONull(r.lat),
    lng: coorANumeroONull(r.lng),
    municipio: r.municipio || '',
    parroquia: r.parroquia || '',
    via: r.via || '',
    fecha: r.fecha ? new Date(r.fecha).toISOString() : null,
    cerrado,
    estado,
    resultado_cierre: r.resultado_cierre != null ? String(r.resultado_cierre) : '',
    observacion_cierre_abierto:
      r.observacion_cierre_abierto != null ? String(r.observacion_cierre_abierto) : '',
    segundos_desde_registro:
      r.segundos_desde_registro != null && r.segundos_desde_registro !== ''
        ? Number(r.segundos_desde_registro)
        : undefined,
  }
}

router.get('/', async (req, res) => {
  try {
    const soloAbiertos =
      req.query.solo_abiertos === '1' ||
      req.query.solo_abiertos === 'true'
    let sql = `SELECT ${SELECT_LISTADO} FROM incidentes`
    if (soloAbiertos) {
      sql +=
        " WHERE (cerrado = 0 OR cerrado IS NULL) AND (estado IS NULL OR estado IN ('abierto', 'en_proceso'))"
    }
    sql += ' ORDER BY fecha DESC'
    const [rows] = await pool.query(sql)
    const incidentes = rows.map(mapRow)
    res.json(incidentes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener incidentes' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via, fecha } = req.body
    if (tipo == null || String(tipo).trim() === '') {
      return res.status(400).json({ error: 'Falta el tipo de incidente' })
    }
    const latVal = coorANumeroONull(lat)
    const lngVal = coorANumeroONull(lng)
    const [result] = await pool.query(
      `INSERT INTO incidentes (tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via, fecha, cerrado, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'abierto')`,
      [
        tipo,
        tipo_nombre || tipo,
        categoria || 'otro',
        descripcion || '',
        latVal,
        lngVal,
        municipio || null,
        parroquia != null && String(parroquia).trim() !== '' ? String(parroquia).trim() : null,
        via != null && String(via).trim() !== '' ? String(via).trim() : null,
        fecha ? new Date(fecha) : new Date(),
      ]
    )
    const [rows] = await pool.query(
      `SELECT ${SELECT_CAMPOS} FROM incidentes WHERE id = ?`,
      [result.insertId]
    )
    res.status(201).json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al guardar incidente' })
  }
})

router.patch('/:id/estado', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' })
    const siguiente = String(req.body.estado != null ? req.body.estado : '')
      .trim()
      .toLowerCase()
    if (siguiente !== 'abierto' && siguiente !== 'en_proceso') {
      return res.status(400).json({ error: 'Solo se permite estado abierto o en_proceso.' })
    }
    const [prevRows] = await pool.query(
      'SELECT cerrado, estado FROM incidentes WHERE id = ?',
      [id]
    )
    if (!prevRows || prevRows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const prev = prevRows[0]
    if (prev.cerrado === 1 || prev.cerrado === true) {
      return res.status(409).json({ error: 'No se puede cambiar el estado: el incidente está cerrado.' })
    }
    const { estado: estActual } = estadoDesdeFila(prev)
    if (siguiente === 'abierto' && estActual === 'en_proceso') {
      return res.status(409).json({
        error: 'No se puede volver a abierto: el incidente ya pasó a en proceso.',
      })
    }
    const [result] = await pool.query(
      'UPDATE incidentes SET estado = ?, cerrado = 0 WHERE id = ?',
      [siguiente, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const [rows] = await pool.query(`SELECT ${SELECT_CAMPOS} FROM incidentes WHERE id = ?`, [id])
    res.json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar estado del incidente' })
  }
})

router.patch('/:id/cerrar', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' })
    const resultado =
      req.body.resultado != null ? String(req.body.resultado).trim() : ''
    if (!resultado) {
      return res.status(400).json({ error: 'Debe escribir el resultado del cierre.' })
    }
    if (resultado.length > 4000) {
      return res.status(400).json({ error: 'El resultado no puede superar 4000 caracteres.' })
    }
    const [prevRows] = await pool.query(
      'SELECT cerrado, estado FROM incidentes WHERE id = ?',
      [id]
    )
    if (!prevRows || prevRows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const prev = prevRows[0]
    if (prev.cerrado === 1 || prev.cerrado === true) {
      return res.status(409).json({ error: 'El incidente ya está cerrado.' })
    }
    const { estado } = estadoDesdeFila(prev)
    if (estado !== 'abierto' && estado !== 'en_proceso') {
      return res.status(409).json({
        error: 'Solo puede cerrar incidentes abiertos o en proceso.',
      })
    }
    const [result] = await pool.query(
      `UPDATE incidentes SET cerrado = 1, estado = 'cerrado', resultado_cierre = ? WHERE id = ?`,
      [resultado, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const [rows] = await pool.query(
      `SELECT ${SELECT_CAMPOS} FROM incidentes WHERE id = ?`,
      [id]
    )
    res.json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cerrar incidente' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' })
    const [prevRows] = await pool.query(
      'SELECT cerrado, estado, fecha, TIMESTAMPDIFF(SECOND, fecha, NOW()) AS segundos_desde_registro FROM incidentes WHERE id = ?',
      [id]
    )
    if (!prevRows || prevRows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const previo = prevRows[0]
    const { estado: estPrev, cerrado: cerrPrev } = estadoDesdeFila(previo)
    if (cerrPrev || estPrev === 'cerrado') {
      return res.status(409).json({ error: 'No se puede editar: el incidente está cerrado.' })
    }
    const segundosDesdeRegistro = Number(previo.segundos_desde_registro)
    if (Number.isFinite(segundosDesdeRegistro) && segundosDesdeRegistro >= 120) {
      return res.status(409).json({ error: 'No se puede editar: pasaron más de 2 minutos desde el registro.' })
    }
    const { tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via } = req.body
    if (tipo == null || String(tipo).trim() === '') {
      return res.status(400).json({ error: 'Falta el tipo de incidente' })
    }
    const latVal = coorANumeroONull(lat)
    const lngVal = coorANumeroONull(lng)
    const viaVal = via != null && String(via).trim() !== '' ? String(via).trim() : null
    const [result] = await pool.query(
      `UPDATE incidentes SET tipo = ?, tipo_nombre = ?, categoria = ?, descripcion = ?, lat = ?, lng = ?, municipio = ?, parroquia = ?, via = ? WHERE id = ?`,
      [
        tipo,
        tipo_nombre || tipo,
        categoria || 'otro',
        descripcion || '',
        latVal,
        lngVal,
        municipio || null,
        parroquia != null && String(parroquia).trim() !== '' ? String(parroquia).trim() : null,
        viaVal,
        id,
      ]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' })
    }
    const [rows] = await pool.query(
      `SELECT ${SELECT_CAMPOS} FROM incidentes WHERE id = ?`,
      [id]
    )
    res.json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar incidente' })
  }
})

export default router
