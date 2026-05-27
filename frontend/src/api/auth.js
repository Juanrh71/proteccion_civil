import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_usuario'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsuario() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function setAuth(token, usuario) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (usuario) localStorage.setItem(USER_KEY, JSON.stringify(usuario))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function registro(datos) {
  const { data } = await api.post('/api/auth/registro', datos)
  return data
}

export async function listarUsuarios(estatus = 'activo') {
  const { data } = await api.get('/api/auth/usuarios', { params: { estatus } })
  return data
}

export async function cambiarEstatusUsuario(id, estatus) {
  const { data } = await api.patch(`/api/auth/usuarios/${id}/estatus`, { estatus })
  return data
}

export async function login(correo, password) {
  const { data } = await api.post('/api/auth/login', { correo, password })
  if (data.token) {
    setAuth(data.token, data.usuario)
  }
  return data
}

export function logout() {
  clearAuth()
}

export async function solicitarCodigoRecuperacion(correo) {
  const { data } = await api.post('/api/auth/solicitar-codigo', { correo })
  return data
}

export async function cambiarPasswordConCodigo(correo, codigo, password) {
  const { data } = await api.post('/api/auth/cambiar-password', { correo, codigo, password })
  return data
}

