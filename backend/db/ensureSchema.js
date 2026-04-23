import pool from './connection.js'

async function hasTable(dbName, tableName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, tableName]
  )
  return (rows[0]?.cnt ?? 0) > 0
}

async function hasColumn(dbName, tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, tableName, columnName]
  )
  return (rows[0]?.cnt ?? 0) > 0
}

async function hasConstraint(dbName, tableName, constraintName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
    [dbName, tableName, constraintName]
  )
  return (rows[0]?.cnt ?? 0) > 0
}

export async function ensureIncidentesSchema() {
  const dbName = process.env.DB_NAME || 'proteccion_civil_carabobo'
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS categorias_incidentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        emergencia ENUM('Si', 'No') DEFAULT 'Si'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )

    await pool.query(
      `CREATE TABLE IF NOT EXISTS tipos_de_incidentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        id_categoria INT NOT NULL,
        INDEX idx_tipos_categoria (id_categoria)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )

    if (!(await hasConstraint(dbName, 'tipos_de_incidentes', 'fk_categoria_catalogo'))) {
      await pool.query(
        `ALTER TABLE tipos_de_incidentes
         ADD CONSTRAINT fk_categoria_catalogo
         FOREIGN KEY (id_categoria) REFERENCES categorias_incidentes(id)`
      )
    }

    await pool.query(
      `CREATE TABLE IF NOT EXISTS reportes_edan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_oficial INT NULL,
        municipio VARCHAR(100),
        parroquia VARCHAR(100),
        sector VARCHAR(100),
        condicion_vivienda ENUM('afectada', 'alto_riesgo', 'destruida'),
        tipo_vivienda VARCHAR(100),
        total_personas INT,
        necesidades_insumos TEXT,
        lat DECIMAL(10,8),
        lng DECIMAL(10,8),
        fecha_afectacion DATETIME,
        INDEX idx_edan_id_oficial (id_oficial)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )

    if (!(await hasConstraint(dbName, 'reportes_edan', 'fk_reportes_edan_usuario'))) {
      await pool.query(
        `ALTER TABLE reportes_edan
         ADD CONSTRAINT fk_reportes_edan_usuario
         FOREIGN KEY (id_oficial) REFERENCES usuarios(id)`
      )
    }

    if (!(await hasColumn(dbName, 'usuarios', 'rol'))) {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN rol ENUM('civil', 'oficial', 'admin') NOT NULL DEFAULT 'civil' AFTER telefono"
      )
      console.log('[db] Columna usuarios.rol creada.')
    }
    await pool.query(
      "ALTER TABLE usuarios MODIFY COLUMN rol ENUM('civil', 'oficial', 'admin') NOT NULL DEFAULT 'civil'"
    )

    if (!(await hasColumn(dbName, 'usuarios', 'estatus'))) {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN estatus ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo' AFTER rol"
      )
      console.log('[db] Columna usuarios.estatus creada.')
    }

    const incidentesExiste = await hasTable(dbName, 'incidentes')
    const incidentesEsNuevoModelo =
      incidentesExiste &&
      (await hasColumn(dbName, 'incidentes', 'id_tipo')) &&
      (await hasColumn(dbName, 'incidentes', 'id_de_reportante')) &&
      (await hasColumn(dbName, 'incidentes', 'estatus_incidente'))

    if (incidentesExiste && !incidentesEsNuevoModelo) {
      const [existsBackupRows] = await pool.query(
        `SELECT COUNT(*) AS cnt
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE 'incidentes_legacy_backup_%'`,
        [dbName]
      )
      const suffix = Number(existsBackupRows?.[0]?.cnt ?? 0) + 1
      const backupName = `incidentes_legacy_backup_${suffix}`
      await pool.query(`RENAME TABLE incidentes TO ${backupName}`)
      console.log(`[db] Tabla incidentes anterior respaldada como ${backupName}.`)
    }

    if (!(await hasTable(dbName, 'incidentes'))) {
      await pool.query(
        `CREATE TABLE incidentes (
          id INT NOT NULL AUTO_INCREMENT,
          id_tipo INT NOT NULL,
          nombre_incidente VARCHAR(100) NOT NULL,
          categoria VARCHAR(100) NOT NULL,
          descripcion TEXT DEFAULT NULL,
          afectados ENUM('No', 'Heridos', 'Muertos') DEFAULT 'No',
          lat DECIMAL(10,8) DEFAULT NULL,
          lng DECIMAL(10,8) DEFAULT NULL,
          municipio VARCHAR(100) DEFAULT NULL,
          parroquia VARCHAR(100) DEFAULT NULL,
          via VARCHAR(100) DEFAULT NULL,
          estatus_incidente ENUM('nuevo', 'en_proceso', 'culminado') DEFAULT 'nuevo',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fecha_cierre DATETIME DEFAULT NULL,
          id_de_reportante INT NOT NULL,
          tipo_de_reportante ENUM('ciudadano', 'oficial') NOT NULL,
          evidencia_visual VARCHAR(255) DEFAULT NULL,
          procedencia ENUM('movil', '') DEFAULT '',
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      )
    }

    if (!(await hasConstraint(dbName, 'incidentes', 'fk_tipo_catalogo'))) {
      await pool.query(
        `ALTER TABLE incidentes
         ADD CONSTRAINT fk_tipo_catalogo
         FOREIGN KEY (id_tipo) REFERENCES tipos_de_incidentes(id)`
      )
    }

    if (!(await hasConstraint(dbName, 'incidentes', 'fk_reportante_inc'))) {
      await pool.query(
        `ALTER TABLE incidentes
         ADD CONSTRAINT fk_reportante_inc
         FOREIGN KEY (id_de_reportante) REFERENCES usuarios(id)`
      )
    }

    if (await hasTable(dbName, 'incidentes')) {
      if (!(await hasColumn(dbName, 'incidentes', 'resultado_cierre'))) {
        await pool.query('ALTER TABLE incidentes ADD COLUMN resultado_cierre TEXT NULL')
        console.log('[db] Columna incidentes.resultado_cierre creada.')
      }
      if (!(await hasColumn(dbName, 'incidentes', 'observacion_cierre_abierto'))) {
        await pool.query(
          'ALTER TABLE incidentes ADD COLUMN observacion_cierre_abierto TEXT NULL'
        )
        console.log('[db] Columna incidentes.observacion_cierre_abierto creada.')
      }
    }
  } catch (err) {
    console.error('[db] No se pudo comprobar el esquema de incidentes:', err.message)
    throw err
  }
}
