import axios from 'axios'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO } from '../config/incidentes'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

function coordONull(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function obtenerIncidentes(options = {}) {
  try {
    const params = {}
    if (options.soloAbiertos === true) {
      params.solo_abiertos = '1'
    }
    const { data } = await api.get('/api/incidentes', { params })
    return data
  } catch (e) {
    console.error('Error al obtener incidentes:', e.message)
    return []
  }
}

export async function guardarIncidente(datos) {
  const tipoInfo = TIPOS_INCIDENTE.find((t) => t.id === datos.tipo) || { nombre: datos.tipo, categoria: 'otro' }
  const partesTipoNombre = [String(tipoInfo.nombre || datos.tipo || '').trim()].filter(Boolean)
  if (datos.categoria_detalle) {
    partesTipoNombre.push(`Categoría: ${String(datos.categoria_detalle).trim()}`)
  }
  if (datos.subcategoria_detalle) {
    partesTipoNombre.push(`Subcategoría: ${String(datos.subcategoria_detalle).trim()}`)
  }
  const payload = {
    tipo: datos.tipo,
    tipo_nombre: partesTipoNombre.join(' | '),
    categoria: tipoInfo.categoria,
    descripcion: '',
    lat: coordONull(datos.lat),
    lng: coordONull(datos.lng),
    municipio: datos.municipio || '',
    parroquia: datos.parroquia || '',
    via: datos.via != null ? String(datos.via) : '',
    fecha: datos.fecha || new Date().toISOString(),
  }
  const { data } = await api.post('/api/incidentes', payload)
  return data
}

export async function actualizarIncidente(id, datos) {
  const tipoInfo = TIPOS_INCIDENTE.find((t) => t.id === datos.tipo) || { nombre: datos.tipo, categoria: 'otro' }
  const payload = {
    tipo: datos.tipo,
    tipo_nombre: tipoInfo.nombre,
    categoria: tipoInfo.categoria,
    descripcion: datos.descripcion || '',
    lat: coordONull(datos.lat),
    lng: coordONull(datos.lng),
    municipio: datos.municipio || '',
    parroquia: datos.parroquia || '',
    via: datos.via != null ? String(datos.via) : '',
  }
  const { data } = await api.put(`/api/incidentes/${id}`, payload)
  return data
}

export async function cerrarIncidente(id, payload = {}) {
  const { data } = await api.patch(`/api/incidentes/${id}/cerrar`, payload)
  return data
}

export async function actualizarEstadoIncidente(id, estado) {
  const { data } = await api.patch(`/api/incidentes/${id}/estado`, { estado })
  return data
}

export { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO }
