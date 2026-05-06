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

export async function listarEdan() {
  const { data } = await api.get('/api/edan')
  return Array.isArray(data) ? data : []
}

export async function obtenerEdanPorId(id) {
  const { data } = await api.get(`/api/edan/${id}`)
  return data
}

export async function registrarEdan(payload) {
  const { data } = await api.post('/api/edan/registrar', payload)
  return data
}

export async function actualizarEdan(id, payload) {
  const { data } = await api.put(`/api/edan/${id}`, payload)
  return data
}

