import axios from 'axios'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO } from '../config/incidentes'
import { GRUPOS_EXCEL, grupoExcelDeTipoId } from '../utils/clasificacionExcelIncidentes.js'
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

function coordONull(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function obtenerIncidentes(options = {}) {
  const params = {}
  if (options.soloAbiertos === true) {
    params.solo_abiertos = '1'
  }
  try {
    const { data } = await api.get('/api/incidentes', { params })
    return data
  } catch (e) {
    console.error('Error al obtener incidentes:', e?.response?.data || e?.message)
    const msg =
      (e && e.response && e.response.data && e.response.data.error) ||
      (e && e.message) ||
      'No se pudo cargar el listado de incidentes. Compruebe que el servidor esté en marcha.'
    const err = new Error(msg)
    err.response = e && e.response
    throw err
  }
}

function categoriaLeyendaParaApi(datos) {
  const gid = datos.grupo_excel_id != null ? String(datos.grupo_excel_id).trim() : ''
  if (gid) {
    if (GRUPOS_EXCEL[gid]) return gid
    return gid
  }
  return grupoExcelDeTipoId(datos.tipo)
}

export async function guardarIncidente(datos) {
  const nombreBase =
    (datos.tipo_nombre_base && String(datos.tipo_nombre_base).trim()) ||
    TIPOS_INCIDENTE.find((t) => t.id === datos.tipo)?.nombre ||
    String(datos.tipo || '')
  const categoriaLeyenda = categoriaLeyendaParaApi(datos)
  const partesTipoNombre = [String(nombreBase).trim()].filter(Boolean)
  const gid = datos.grupo_excel_id != null ? String(datos.grupo_excel_id).trim() : ''
  if (gid && GRUPOS_EXCEL[gid]) {
    partesTipoNombre.push(`Categoría: ${GRUPOS_EXCEL[gid].nombre}`)
  } else if (gid && datos.categoria_nombre) {
    partesTipoNombre.push(`Categoría: ${String(datos.categoria_nombre).trim()}`)
  } else if (datos.categoria_detalle) {
    partesTipoNombre.push(`Categoría: ${String(datos.categoria_detalle).trim()}`)
  }
  if (datos.subcategoria_detalle) {
    partesTipoNombre.push(`Subcategoría: ${String(datos.subcategoria_detalle).trim()}`)
  }
  const payload = {
    tipo: datos.tipo,
    tipo_nombre: partesTipoNombre.join(' | '),
    categoria: categoriaLeyenda,
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
  const nombreTipo =
    (datos.tipo_nombre_sugerido && String(datos.tipo_nombre_sugerido).trim()) ||
    TIPOS_INCIDENTE.find((t) => t.id === datos.tipo)?.nombre ||
    String(datos.tipo || '')
  const payload = {
    tipo: datos.tipo,
    tipo_nombre: nombreTipo,
    categoria: categoriaLeyendaParaApi(datos),
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
