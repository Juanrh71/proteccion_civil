import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/connection.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_cambiar_en_produccion'
const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 6
const cedulaRegex = /^[VJE]\d{6,9}$/
const telefonoRegex = /^04\d{8}$/

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    if (!telefonoRegex.test(t)) errores.push('El teléfono debe ser un código 04xx más 6 dígitos (10 en total).')
  }
  if (!password || !password.toString()) errores.push('La contraseña es requerida.')
  else if (password.length < MIN_PASSWORD_LENGTH) errores.push(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  if (!confirmacion || confirmacion !== password) errores.push('La confirmación de contraseña no coincide.')

  return errores
}

router.post('/registro', async (req, res) => {
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
      'INSERT INTO usuarios (nombre, apellido, correo, cedula, telefono, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, correo, cedula, telefono, password_hash]
    )
    res.status(201).json({ message: 'Usuario registrado correctamente.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar el usuario.' })
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
      'SELECT id, nombre, apellido, correo, cedula, telefono, password_hash FROM usuarios WHERE correo = ?',
      [correoNorm]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' })
    }
    const user = rows[0]
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
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar sesión.' })
  }
})

export default router
