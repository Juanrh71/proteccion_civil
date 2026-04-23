import { TIPOS_INCIDENTE } from '../config/incidentes'

export const COLOR_POR_CATEGORIA = {
  medico: '#dc2626',
  vial: '#ea580c',
  incendio: '#b91c1c',
  riesgo_quimico: '#7c3aed',
  rescate: '#0284c7',
  socio_natural: '#0d9488',
  prevencion: '#059669',
  educacion: '#ca8a04',
  administrativo: '#6b7280',
  otro: '#64748b',
}

export const ETIQUETA_CATEGORIA = {
  medico: 'Médico / Salud',
  vial: 'Vial',
  incendio: 'Incendio',
  riesgo_quimico: 'Riesgo químico / GLP',
  rescate: 'Rescate',
  socio_natural: 'Desastre natural',
  prevencion: 'Prevención',
  educacion: 'Educación',
  administrativo: 'Administrativo',
  otro: 'Otro',
}

export function colorCategoria(categoria) {
  return COLOR_POR_CATEGORIA[categoria] || COLOR_POR_CATEGORIA.otro
}

export function etiquetaCategoria(categoria) {
  return ETIQUETA_CATEGORIA[categoria] || ETIQUETA_CATEGORIA.otro
}

export const CATEGORIAS_CATALOGO = (function () {
  const set = new Set()
  for (const t of TIPOS_INCIDENTE) {
    if (t.categoria) set.add(t.categoria)
  }
  return [...set].map((id) => ({
    id,
    nombre: etiquetaCategoria(id),
    color: colorCategoria(id),
  }))
})()
