import { Router } from 'express'
import pool from '../db/connection.js'

const router = Router()

/** Compat: body de la app puede usar `lact_Fem` o `lact.Fem` */
function pick(d, a, b) {
  if (d[a] != null && d[a] !== '') return d[a]
  if (b != null && d[b] != null && d[b] !== '') return d[b]
  return d[a] ?? d[b] ?? null
}

router.get('/health', (req, res) => {
  res.json({ ok: true, servicio: 'edan' })
})

router.post('/registrar', async (req, res) => {
  const connection = await pool.getConnection()
  const d = req.body || {}
  try {
    if (!d || Object.keys(d).length === 0) {
      return res
        .status(400)
        .json({ error: 'No se recibieron datos en el cuerpo de la petición' })
    }
    if (d.id_oficial == null || String(d.id_oficial).trim() === '') {
      return res.status(400).json({ error: 'Falta id_oficial' })
    }

    await connection.beginTransaction()

    const queryEdan = `
      INSERT INTO reportes_edan (
        id_oficial, numero_planilla, propetario, p_cedula, P_edad, P_telefono,
        municipio, parroquia, sector, nro_casa, urbanizacion, direccion,
        lat, lng, nro_informe, fecha_solicitud, fecha_afectacion,
        descripcion_afectacion, tipo_afectacion, afectacion_otros,
        condicion_vivienda, tipo_vivienda, descripcion_vivienda,
        \`lact.Fem\`, \`lact.Masc\`, \`niños.Fem\`, \`niños.Masc\`, \`adultos.Fem\`, \`adultos.Masc\`,
        \`3era_edad.Fem\`, \`3era_edad.Masc\`, discapacitados, total_personas,
        nro_familias, requerimientos_afectacion, P_enseres_total,
        P_enseres_parcial, p_enseres_no, necesidades_agua,
        necesidades_alimentos, necesidades_luz
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

    const [result] = await connection.query(queryEdan, [
      d.id_oficial,
      d.numero_planilla,
      d.propetario,
      d.p_cedula,
      d.P_edad,
      d.P_telefono,
      d.municipio,
      d.parroquia,
      d.sector,
      d.nro_casa,
      d.urbanizacion,
      d.direccion,
      d.lat,
      d.lng,
      d.nro_informe,
      d.fecha_solicitud || null,
      d.fecha_afectacion || null,
      d.descripcion_afectacion,
      d.tipo_afectacion,
      d.afectacion_otros,
      d.condicion_vivienda,
      d.tipo_vivienda,
      d.descripcion_vivienda,
      pick(d, 'lact.Fem', 'lact_Fem'),
      pick(d, 'lact.Masc', 'lact_Masc'),
      pick(d, 'niños.Fem', 'ninos_Fem'),
      pick(d, 'niños.Masc', 'ninos_Masc'),
      pick(d, 'adultos.Fem', 'adultos_Fem'),
      pick(d, 'adultos.Masc', 'adultos_Masc'),
      pick(d, '3era_edad.Fem', '3era_edad_Fem'),
      pick(d, '3era_edad.Masc', '3era_edad_Masc'),
      d.discapacitados,
      d.total_personas,
      d.nro_familias,
      d.requerimientos_afectacion,
      d.P_enseres_total,
      d.P_enseres_parcial,
      d.p_enseres_no,
      d.necesidades_agua,
      d.necesidades_alimentos,
      d.necesidades_luz,
    ])

    const reporteId = result.insertId

    if (
      d.detalles_familiares &&
      Array.isArray(d.detalles_familiares) &&
      d.detalles_familiares.length > 0
    ) {
      const valoresFamiliares = d.detalles_familiares.map((f) => {
        const g = String(f.genero || '').trim()
        const genero = g === 'Femenino' ? 'Femenino' : 'Masculino'
        return [
          reporteId,
          f.nombre_completo,
          f.cedula,
          f.edad != null ? Number(f.edad) : 0,
          genero,
        ]
      })
      await connection.query(
        'INSERT INTO afectados_detalle (id_reporte, nombre_completo, cedula, edad, genero) VALUES ?',
        [valoresFamiliares]
      )
    }

    await connection.commit()
    res.status(201).json({ ok: true, id: reporteId })
  } catch (err) {
    await connection.rollback()
    console.error('Error en EDAN /registrar:', err)
    res.status(500).json({ error: err.message || 'Error al registrar reporte EDAN' })
  } finally {
    connection.release()
  }
})

export default router
