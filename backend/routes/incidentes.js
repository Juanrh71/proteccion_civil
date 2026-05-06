import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import pool from '../db/connection.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_cambiar_en_produccion'
const MUNICIPIOS_CARABOBO = [
  'Valencia',
  'Naguanagua',
  'San Diego',
  'Guacara',
  'Mariara',
  'Diego Ibarra',
  'Puerto Cabello',
  'Juan José Mora',
  'Bejuma',
  'Miranda',
  'Montalbán',
  'Carlos Arvelo',
]
const CARABOBO_BOUNDS = {
  minLat: 9.95,
  maxLat: 10.48,
  minLng: -68.55,
  maxLng: -67.32,
}

/** Id de usuario autenticado (Bearer) o null */
function idUsuarioAutenticado(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    const id = payload.id
    if (id == null) return null
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

const SELECT_CAMPOS =
  'id, tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via, fecha, cerrado, estado, resultado_cierre, observacion_cierre_abierto, heridos_cierre, fallecidos_cierre'

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
const MINUTOS_AUTO_CIERRE_LLUVIA = 40
const LLUVIA_TIPOS_AUTO_CIERRE = [
  'precipitaciones_leves',
  'precipitaciones_moderadas',
  'precipitaciones_fuertes',
  'precipitaciones_severas',
  'precipitaciones_torrenciales',
  // compatibilidad con slugs previos
  'lluvia_leve',
  'lluvia_moderada',
  'lluvia_fuerte',
]

async function autoCerrarIncidentesLluviaPorTiempo() {
  try {
    const placeholders = LLUVIA_TIPOS_AUTO_CIERRE.map(() => '?').join(',')
    const sql = `
      UPDATE incidentes
      SET
        cerrado = 1,
        estado = 'cerrado',
        fecha_cierre = NOW(),
        resultado_cierre = CASE
          WHEN resultado_cierre IS NULL OR TRIM(resultado_cierre) = ''
            THEN 'Cierre automático por tiempo: incidente de lluvia mayor a 40 minutos.'
          ELSE resultado_cierre
        END
      WHERE
        tipo IN (${placeholders})
        AND (cerrado = 0 OR cerrado IS NULL)
        AND (estado IS NULL OR estado IN ('abierto', 'en_proceso'))
        AND TIMESTAMPDIFF(MINUTE, fecha, NOW()) >= ?`
    await pool.query(sql, [...LLUVIA_TIPOS_AUTO_CIERRE, MINUTOS_AUTO_CIERRE_LLUVIA])
  } catch (e) {
    console.warn('[incidentes] auto-cierre lluvia:', e.message)
  }
}

const uploadsEvidencias = path.join(process.cwd(), 'uploads', 'evidencias')
try {
  fs.mkdirSync(uploadsEvidencias, { recursive: true })
} catch {
  /* ignorar si ya existe o sin permiso en arranque */
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsEvidencias),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 24)
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 12)}${ext}`)
    },
  }),
})

/** Alineado a ENUM('No','Heridos','Muertos') en incidentes.afectados */
function afectadosEnumDesdeConteos(nHeridos, nFallecidos) {
  if (nHeridos > 0 && nFallecidos > 0) return 'Muertos'
  if (nHeridos > 0) return 'Heridos'
  if (nFallecidos > 0) return 'Muertos'
  return 'No'
}

function coorANumeroONull(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizarTexto(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function municipioEsCarabobo(municipio) {
  const mNorm = normalizarTexto(municipio)
  if (!mNorm) return false
  return MUNICIPIOS_CARABOBO.some((m) => normalizarTexto(m) === mNorm)
}

function coordenadasEnCarabobo(lat, lng) {
  return (
    lat >= CARABOBO_BOUNDS.minLat &&
    lat <= CARABOBO_BOUNDS.maxLat &&
    lng >= CARABOBO_BOUNDS.minLng &&
    lng <= CARABOBO_BOUNDS.maxLng
  )
}

function validarUbicacionIncidente({ municipio, via, lat, lng }) {
  const viaTrim = String(via || '').trim()
  if (!viaTrim) {
    return 'La calle, avenida o referencia es obligatoria.'
  }
  if (!municipioEsCarabobo(municipio)) {
    return 'Solo se permiten municipios del estado Carabobo.'
  }
  const tieneLat = lat != null
  const tieneLng = lng != null
  if (tieneLat !== tieneLng) {
    return 'Debe indicar latitud y longitud juntas.'
  }
  if (tieneLat && !coordenadasEnCarabobo(lat, lng)) {
    return 'Las coordenadas deben ubicarse dentro del estado Carabobo.'
  }
  return ''
}

function enteroONull(v) {
  if (v == null || v === '') return null
  const n = parseInt(String(v), 10)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

function mapRow(r) {
  const { estado, cerrado } = estadoDesdeFila(r)
  const hc = enteroONull(r.heridos_cierre)
  const fc = enteroONull(r.fallecidos_cierre)
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
    heridos: hc ?? 0,
    fallecidos: fc ?? 0,
    resultado_cierre: r.resultado_cierre != null ? String(r.resultado_cierre) : '',
    observacion_cierre_abierto:
      r.observacion_cierre_abierto != null ? String(r.observacion_cierre_abierto) : '',
    heridos_cierre: hc,
    fallecidos_cierre: fc,
    segundos_desde_registro:
      r.segundos_desde_registro != null && r.segundos_desde_registro !== ''
        ? Number(r.segundos_desde_registro)
        : undefined,
  }
}

/** Catálogo para la app (primer dropdown) */
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre FROM categorias_incidentes ORDER BY nombre ASC'
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
})

/** Tipos para la app (segundo dropdown) */
router.get('/tipos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, id_categoria, nombre FROM tipos_de_incidentes ORDER BY nombre ASC'
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener tipos' })
  }
})

/**
 * Reporte desde app móvil (multipart: campo archivo `evidencia`).
 * Inserta usando catálogo tipos/categorías; `incidentes.tipo` guarda el slug del tipo.
 */
router.post('/reportar', upload.single('evidencia'), async (req, res) => {
  try {
    const {
      id_de_reportante,
      id_tipo,
      descripcion,
      lat,
      lng,
      municipio,
      parroquia,
      via,
      tipo_de_reportante,
      afectados,
      heridos_cierre,
      fallecidos_cierre,
    } = req.body

    const idRep = parseInt(id_de_reportante, 10)
    const idTipo = parseInt(id_tipo, 10)
    if (!Number.isFinite(idRep) || idRep < 1) {
      return res.status(400).json({ error: 'id_de_reportante inválido' })
    }
    if (!Number.isFinite(idTipo) || idTipo < 1) {
      return res.status(400).json({ error: 'id_tipo inválido' })
    }

    const nHeridos = parseInt(heridos_cierre, 10) || 0
    const nFallecidos = parseInt(fallecidos_cierre, 10) || 0
    const afAllowed = ['No', 'Heridos', 'Muertos']
    let estadoAfectados = afectadosEnumDesdeConteos(nHeridos, nFallecidos)
    if (afectados != null && afAllowed.includes(String(afectados).trim())) {
      estadoAfectados = String(afectados).trim()
    }

    const evidencia_visual = req.file ? req.file.filename : null

    const procDb = 'movil'

    const tipoRep =
      tipo_de_reportante === 'oficial' || tipo_de_reportante === 'ciudadano'
        ? tipo_de_reportante
        : 'ciudadano'

    const sql = `
      INSERT INTO incidentes (
        id_de_reportante,
        tipo,
        tipo_nombre,
        categoria,
        descripcion,
        lat,
        lng,
        municipio,
        parroquia,
        via,
        procedencia,
        evidencia_visual,
        estado,
        cerrado,
        fecha,
        afectados,
        heridos_cierre,
        fallecidos_cierre,
        tipo_de_reportante
      )
      SELECT
        ?,
        COALESCE(NULLIF(TRIM(t.slug), ''), CONCAT('id_', t.id)),
        t.nombre,
        c.nombre,
        ?,
        ?, ?, ?, ?, ?,
        ?,
        ?,
        'abierto',
        0,
        NOW(),
        ?,
        ?, ?,
        ?
      FROM tipos_de_incidentes t
      INNER JOIN categorias_incidentes c ON t.id_categoria = c.id
      WHERE t.id = ?`

    const latVal = coorANumeroONull(lat)
    const lngVal = coorANumeroONull(lng)
    const errorUbicacion = validarUbicacionIncidente({
      municipio,
      via,
      lat: latVal,
      lng: lngVal,
    })
    if (errorUbicacion) {
      return res.status(400).json({ error: errorUbicacion })
    }

    const [result] = await pool.query(sql, [
      idRep,
      descripcion || '',
      latVal,
      lngVal,
      String(municipio).trim(),
      parroquia || null,
      String(via).trim(),
      procDb,
      evidencia_visual,
      estadoAfectados,
      nHeridos,
      nFallecidos,
      tipoRep,
      idTipo,
    ])

    res.status(201).json({ ok: true, id: result.insertId })
  } catch (err) {
    console.error('Error en POST /reportar:', err)
    res.status(500).json({ error: 'Error al guardar el reporte' })
  }
})

router.get('/mis-reportes/:id_usuario', async (req, res) => {
  const idUsuario = parseInt(req.params.id_usuario, 10)
  if (!Number.isFinite(idUsuario) || idUsuario < 1) {
    return res.status(400).json({ error: 'id_usuario inválido' })
  }
  try {
    const query = `
      SELECT
        id,
        tipo_nombre,
        categoria,
        descripcion,
        estado,
        afectados,
        heridos_cierre,
        fallecidos_cierre,
        created_at
      FROM incidentes
      WHERE id_de_reportante = ?
      ORDER BY created_at DESC`

    const [rows] = await pool.query(query, [idUsuario])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener el historial' })
  }
})

router.get('/mapa-global', async (req, res) => {
  try {
    await autoCerrarIncidentesLluviaPorTiempo()
    const query = `
      SELECT
        id, tipo_nombre, categoria, lat, lng, estado, created_at
      FROM incidentes
      WHERE estado != 'cerrado'
      ORDER BY created_at DESC`

    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar el mapa' })
  }
})

router.get('/', async (req, res) => {
  try {
    await autoCerrarIncidentesLluviaPorTiempo()
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
    const idReportante = idUsuarioAutenticado(req)
    if (idReportante == null) {
      return res
        .status(401)
        .json({ error: 'Inicie sesión para registrar un incidente (token requerido).' })
    }
    const [usr] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [idReportante])
    if (!usr || usr.length === 0) {
      return res.status(401).json({ error: 'Usuario no válido. Vuelva a iniciar sesión.' })
    }

    const { tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via, fecha } = req.body
    if (tipo == null || String(tipo).trim() === '') {
      return res.status(400).json({ error: 'Falta el tipo de incidente' })
    }
    const latVal = coorANumeroONull(lat)
    const lngVal = coorANumeroONull(lng)
    const errorUbicacion = validarUbicacionIncidente({
      municipio,
      via,
      lat: latVal,
      lng: lngVal,
    })
    if (errorUbicacion) {
      return res.status(400).json({ error: errorUbicacion })
    }
    const [result] = await pool.query(
      `INSERT INTO incidentes (tipo, tipo_nombre, categoria, descripcion, lat, lng, municipio, parroquia, via, fecha, cerrado, estado, id_de_reportante, tipo_de_reportante)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'abierto', ?, 'ciudadano')`,
      [
        tipo,
        tipo_nombre || tipo,
        categoria != null && String(categoria).trim() !== '' ? String(categoria).trim() : null,
        descripcion || '',
        latVal,
        lngVal,
        String(municipio).trim(),
        parroquia != null && String(parroquia).trim() !== '' ? String(parroquia).trim() : null,
        String(via).trim(),
        fecha ? new Date(fecha) : new Date(),
        idReportante,
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
    const desdeEnProceso = estado === 'en_proceso'
    let heridosCierre = null
    let fallecidosCierre = null
    if (desdeEnProceso) {
      const h = parseInt(req.body.heridos_cierre, 10)
      const f = parseInt(req.body.fallecidos_cierre, 10)
      if (!Number.isFinite(h) || h < 0 || h > 999999) {
        return res.status(400).json({ error: 'Indique un número válido de heridos (0 o más).' })
      }
      if (!Number.isFinite(f) || f < 0 || f > 999999) {
        return res.status(400).json({ error: 'Indique un número válido de fallecidos (0 o más).' })
      }
      heridosCierre = h
      fallecidosCierre = f
    }

    let sql = `UPDATE incidentes SET cerrado = 1, estado = 'cerrado', resultado_cierre = ?`
    const params = [resultado]
    if (desdeEnProceso) {
      sql += ', heridos_cierre = ?, fallecidos_cierre = ?'
      params.push(heridosCierre, fallecidosCierre)
    }
    sql += ' WHERE id = ?'
    params.push(id)

    const [result] = await pool.query(sql, params)
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
    const errorUbicacion = validarUbicacionIncidente({
      municipio,
      via,
      lat: latVal,
      lng: lngVal,
    })
    if (errorUbicacion) {
      return res.status(400).json({ error: errorUbicacion })
    }
    const viaVal = String(via).trim()
    const [result] = await pool.query(
      `UPDATE incidentes SET tipo = ?, tipo_nombre = ?, categoria = ?, descripcion = ?, lat = ?, lng = ?, municipio = ?, parroquia = ?, via = ? WHERE id = ?`,
      [
        tipo,
        tipo_nombre || tipo,
        categoria != null && String(categoria).trim() !== '' ? String(categoria).trim() : null,
        descripcion || '',
        latVal,
        lngVal,
        String(municipio).trim(),
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
