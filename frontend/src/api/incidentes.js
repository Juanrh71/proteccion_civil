/**
 * Cliente API de incidentes (backend Node.js).
 * Sustituye el uso de localStorage.
 */
import axios from 'axios'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO } from '../config/incidentes'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Obtiene todos los incidentes (para mapa, listado y reportes).
 * Si el servidor no responde, devuelve array vacío.
 */
export async function obtenerIncidentes() {
  try {
    const { data } = await api.get('/api/incidentes')
    return data
  } catch (err) {
    console.error('Error al obtener incidentes:', err.message)
    return []
  }
}

/**
 * Guarda un nuevo incidente en el servidor.
 */
export async function guardarIncidente(datos) {
  const tipoInfo = TIPOS_INCIDENTE.find((t) => t.id === datos.tipo) || { nombre: datos.tipo, categoria: 'otro' }
  const payload = {
    tipo: datos.tipo,
    tipo_nombre: tipoInfo.nombre,
    categoria: tipoInfo.categoria,
    descripcion: datos.descripcion || '',
    lat: datos.lat,
    lng: datos.lng,
    municipio: datos.municipio || '',
    fecha: datos.fecha || new Date().toISOString(),
  }
  const { data } = await api.post('/api/incidentes', payload)
  return data
}

/**
 * Actualiza un incidente existente.
 */
export async function actualizarIncidente(id, datos) {
  const tipoInfo = TIPOS_INCIDENTE.find((t) => t.id === datos.tipo) || { nombre: datos.tipo, categoria: 'otro' }
  const payload = {
    tipo: datos.tipo,
    tipo_nombre: tipoInfo.nombre,
    categoria: tipoInfo.categoria,
    descripcion: datos.descripcion || '',
    lat: datos.lat,
    lng: datos.lng,
    municipio: datos.municipio || '',
    fecha: datos.fecha || new Date().toISOString(),
  }
  const { data } = await api.put(`/api/incidentes/${id}`, payload)
  return data
}

export { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO }
