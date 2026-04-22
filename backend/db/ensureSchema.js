import pool from './connection.js'

export async function ensureIncidentesSchema() {
  const dbName = process.env.DB_NAME || 'proteccion_civil_carabobo'
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'incidentes' AND COLUMN_NAME = 'cerrado'`,
      [dbName]
    )
    const cnt = rows[0]?.cnt ?? 0
    if (cnt === 0) {
      await pool.query(
        `ALTER TABLE incidentes
         ADD COLUMN cerrado TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = cerrado'`
      )
      console.log('[db] Columna incidentes.cerrado creada (valor por defecto: abierto).')
    }

    const [viaRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'incidentes' AND COLUMN_NAME = 'via'`,
      [dbName]
    )
    if ((viaRows[0]?.cnt ?? 0) === 0) {
      await pool.query(
        'ALTER TABLE incidentes ADD COLUMN via VARCHAR(500) NULL COMMENT \'calle o referencia\''
      )
      console.log('[db] Columna incidentes.via creada.')
    }

    const [parroquiaRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'incidentes' AND COLUMN_NAME = 'parroquia'`,
      [dbName]
    )
    if ((parroquiaRows[0]?.cnt ?? 0) === 0) {
      await pool.query(
        'ALTER TABLE incidentes ADD COLUMN parroquia VARCHAR(80) NULL'
      )
      console.log('[db] Columna incidentes.parroquia creada.')
    }

    const [latRows] = await pool.query(
      `SELECT IS_NULLABLE AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'incidentes' AND COLUMN_NAME = 'lat'`,
      [dbName]
    )
    if (latRows[0]?.n === 'NO') {
      await pool.query(
        'ALTER TABLE incidentes MODIFY lat DECIMAL(10,6) NULL, MODIFY lng DECIMAL(10,6) NULL'
      )
      console.log('[db] lat/lng pueden ser NULL (registro sin mapa).')
    }

    const [estadoRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'incidentes' AND COLUMN_NAME = 'estado'`,
      [dbName]
    )
    if ((estadoRows[0]?.cnt ?? 0) === 0) {
      await pool.query(
        `ALTER TABLE incidentes
         ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'abierto'
         COMMENT 'abierto | en_proceso | cerrado' AFTER cerrado`
      )
      await pool.query(`UPDATE incidentes SET estado = 'cerrado' WHERE cerrado = 1`)
      await pool.query(
        `UPDATE incidentes SET estado = 'abierto' WHERE (cerrado = 0 OR cerrado IS NULL) AND estado NOT IN ('cerrado', 'en_proceso')`
      )
      console.log('[db] Columna incidentes.estado creada y datos migrados desde cerrado.')
    }
  } catch (err) {
    console.error('[db] No se pudo comprobar el esquema de incidentes:', err.message)
    throw err
  }
}
