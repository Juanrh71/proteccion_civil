import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/connection.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_cambiar_en_produccion'
const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 6
const cedulaRegex = /^[VJE]\d{6,9}$/
// Móvil Venezuela: 04 + operadora (2) + 7 = 11 dígitos (ej. 04124413318)
const telefonoRegex = /^04\d{9}$/

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function estatusEsActivo(estatusRaw) {
  const est = String(estatusRaw || '')
    .trim()
    .toLowerCase()
  return est === 'activo' || est === 'aprobado' || est === 'pendiente'
}

function estatusUiDesdeDb(estatusRaw) {
  return estatusEsActivo(estatusRaw) ? 'activo' : 'inactivo'
}

function authTokenDesdeHeader(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  return auth.slice(7)
}

async function requireAdmin(req, res, next) {
  try {
    const token = authTokenDesdeHeader(req)
    if (!token) return res.status(401).json({ error: 'No autorizado.' })
    const payload = jwt.verify(token, JWT_SECRET)
    const [rows] = await pool.query('SELECT id, rol, estatus FROM usuarios WHERE id = ?', [payload.id])
    if (!rows.length) return res.status(401).json({ error: 'No autorizado.' })
    const u = rows[0]
    if (!estatusEsActivo(u.estatus)) return res.status(403).json({ error: 'Usuario inactivo.' })
    if (u.rol !== 'admin') return res.status(403).json({ error: 'Acceso solo para administrador.' })
    req.authUser = { id: u.id, rol: u.rol }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}

function validarRegistro(body) {
  const errores = []
  const { nombre, apellido, correo, cedula, telefono, password, confirmacion } = body

  if (!nombre || !nombre.toString().trim()) errores.push('El nombre es requerido.')
  if (!apellido || !apellido.toString().trim()) errores.push('El apellido es requerido.')
  if (!correo || !correo.toString().trim()) errores.push('El correo es requerido.')
  else if (!emailRegex.test(correo)) errores.push('El correo no tiene un formato válido.')
  if (!cedula || !cedula.toString().trim()) errores.push('La cédula es requerida.')
  else {
    const c = cedula.toString().replace(/\s/g, '').toUpperCase()
    if (!cedulaRegex.test(c)) errores.push('La cédula debe ser tipo V, J o E seguido de 6 a 9 dígitos.')
  }
  if (!telefono || !telefono.toString().trim()) errores.push('El teléfono es requerido.')
  else {
    const t = telefono.toString().replace(/\s/g, '')
    if (!telefonoRegex.test(t)) {
      errores.push('El teléfono debe ser móvil Venezuela: 04xx más 7 dígitos (11 en total, ej. 04124413318).')
    }
  }
  if (!password || !password.toString()) errores.push('La contraseña es requerida.')
  else if (password.length < MIN_PASSWORD_LENGTH) errores.push(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  if (!confirmacion || confirmacion !== password) errores.push('La confirmación de contraseña no coincide.')

  return errores
}

router.post('/registro', requireAdmin, async (req, res) => {
  try {
    const errores = validarRegistro(req.body)
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(' ') })
    }

    const nombre = req.body.nombre.toString().trim()
    const apellido = req.body.apellido.toString().trim()
    const correo = req.body.correo.toString().trim().toLowerCase()
    const cedula = req.body.cedula.toString().replace(/\s/g, '').toUpperCase()
    const telefono = req.body.telefono.toString().replace(/\s/g, '')
    const password = req.body.password
    // Registro web (solo admin): siempre oficial. Civil/oficial vía app móvil, más adelante.
    const rol = 'oficial'

    const [existingEmail] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo])
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese correo electrónico.' })
    }
    const [existingCedula] = await pool.query('SELECT id FROM usuarios WHERE cedula = ?', [cedula])
    if (existingCedula.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese número de cédula.' })
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    await pool.query(
      `INSERT INTO usuarios
       (nombre, apellido, correo, cedula, telefono, rol, estatus, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'aprobado', ?)`,
      [nombre, apellido, correo, cedula, telefono, rol, password_hash]
    )
    res.status(201).json({ message: 'Usuario registrado correctamente.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar el usuario.' })
  }
})

router.get('/usuarios', requireAdmin, async (req, res) => {
  try {
    const estatus = String(req.query.estatus || 'activo').toLowerCase()
    let sql =
      'SELECT id, nombre, apellido, correo, cedula, telefono, rol, estatus, created_at FROM usuarios'
    const params = []
    if (estatus === 'activo') {
      sql += " WHERE estatus IN ('activo', 'aprobado')"
    } else if (estatus === 'inactivo') {
      sql += " WHERE estatus IN ('inactivo', 'bloqueado', 'pendiente')"
    }
    sql += ' ORDER BY created_at DESC'
    const [rows] = await pool.query(sql, params)
    res.json(
      rows.map((u) => ({
        ...u,
        estatus: estatusUiDesdeDb(u.estatus),
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al consultar usuarios.' })
  }
})

router.patch('/usuarios/:id/estatus', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Id inválido.' })
    const estatus = String(req.body.estatus || '').toLowerCase()
    if (estatus !== 'activo' && estatus !== 'inactivo') {
      return res.status(400).json({ error: 'Estatus inválido. Debe ser activo o inactivo.' })
    }
    if (id === req.authUser.id) {
      return res.status(400).json({ error: 'No puede cambiar su propio estatus.' })
    }
    const estatusDb = estatus === 'activo' ? 'aprobado' : 'bloqueado'
    const [result] = await pool.query('UPDATE usuarios SET estatus = ? WHERE id = ?', [estatusDb, id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar estatus del usuario.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos.' })
    }
    const correoNorm = correo.toString().trim().toLowerCase()
    if (!emailRegex.test(correoNorm)) {
      return res.status(400).json({ error: 'El correo no tiene un formato válido.' })
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, correo, cedula, telefono, rol, estatus, password_hash
       FROM usuarios WHERE correo = ?`,
      [correoNorm]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' })
    }
    const user = rows[0]
    if (!estatusEsActivo(user.estatus)) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' })
    }
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' })
    }

    const token = jwt.sign(
      { id: user.id, correo: user.correo },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        cedula: user.cedula,
        telefono: user.telefono,
        rol: user.rol,
        estatus: estatusUiDesdeDb(user.estatus),
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar sesión.' })
  }
})

export default router
