import axios from 'axios'
import { getToken } from './auth.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Catálogo activo: categorías con tipos (formulario, colores, leyenda). */
export async function getCatalogoRegistro() {
  const { data } = await api.get('/api/catalogo/registro')
  return data
}

export async function getCatalogoAdmin() {
  const { data } = await api.get('/api/catalogo/completo')
  return data
}

export async function postCategoriaCatalogo(body) {
  const { data } = await api.post('/api/catalogo/categorias', body)
  return data
}

export async function patchCategoriaCatalogo(id, body) {
  const { data } = await api.patch(`/api/catalogo/categorias/${id}`, body)
  return data
}

export async function postTipoCatalogo(body) {
  const { data } = await api.post('/api/catalogo/tipos', body)
  return data
}

export async function patchTipoCatalogo(id, body) {
  const { data } = await api.patch(`/api/catalogo/tipos/${id}`, body)
  return data
}
