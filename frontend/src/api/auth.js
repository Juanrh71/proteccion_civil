import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

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
