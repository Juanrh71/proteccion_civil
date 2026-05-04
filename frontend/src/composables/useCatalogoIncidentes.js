import { ref, computed } from 'vue'
import { getToken } from '../api/auth.js'
import { getCatalogoRegistro } from '../api/catalogo.js'
import {
  setColoresCategoriasDinamicos,
  setColoresTiposDinamicos,
  setNombresCategoriasDinamicos,
  LEYENDA_GRUPOS_EXCEL,
} from '../utils/clasificacionExcelIncidentes.js'
import { TIPOS_INCIDENTE } from '../config/incidentes.js'

const categorias = ref([])
const listo = ref(false)
const errorCarga = ref('')

const tiposPlano = computed(() => {
  const out = []
  for (const c of categorias.value) {
    for (const t of c.tipos || []) {
      out.push({
        id: t.slug || String(t.id),
        nombre: t.nombre,
        color: t.color || null,
        categoria: c.slug,
        categoria_nombre: c.nombre,
        color: c.color,
      })
    }
  }
  return out
})

const leyendaCategorias = computed(() => {
  if (categorias.value.length > 0) {
    return categorias.value.map((c) => ({
      id: c.slug,
      nombre: c.nombre,
      color: c.color || '#64748b',
    }))
  }
  return LEYENDA_GRUPOS_EXCEL
})

const leyendaMapa = computed(() => {
  if (categorias.value.length === 0) return LEYENDA_GRUPOS_EXCEL
  const out = []
  for (const c of categorias.value) {
    const tipos = Array.isArray(c.tipos) ? c.tipos : []
    if (c.slug === 'clima' && tipos.length > 0) {
      for (const t of tipos) {
        out.push({
          id: `clima:${t.slug || t.id}`,
          nombre: `Clima - ${t.nombre}`,
          color: t.color || c.color || '#64748b',
        })
      }
      continue
    }
    out.push({
      id: c.slug,
      nombre: c.nombre,
      color: c.color || '#64748b',
    })
  }
  return out
})

export function useCatalogoIncidentes() {
  return {
    categorias,
    listo,
    errorCarga,
    tiposPlano,
    leyendaCategorias,
    leyendaMapa,
    cargarCatalogoIncidentes,
  }
}

export async function cargarCatalogoIncidentes() {
  if (!getToken()) {
    setColoresCategoriasDinamicos(null)
    setColoresTiposDinamicos(null)
    setNombresCategoriasDinamicos(null)
    categorias.value = []
    listo.value = true
    errorCarga.value = ''
    return
  }
  listo.value = false
  errorCarga.value = ''
  try {
    const data = await getCatalogoRegistro()
    const cats = data.categorias || []
    categorias.value = cats
    const col = {}
    const nom = {}
    const tipCol = {}
    for (const c of cats) {
      if (c.slug) {
        if (c.color) col[c.slug] = c.color
        if (c.nombre) nom[c.slug] = c.nombre
      }
      for (const t of c.tipos || []) {
        const sid = t?.slug ? String(t.slug).trim() : ''
        const scol = t?.color ? String(t.color).trim() : ''
        if (sid && scol) tipCol[sid] = scol
      }
    }
    setColoresCategoriasDinamicos(Object.keys(col).length ? col : null)
    setColoresTiposDinamicos(Object.keys(tipCol).length ? tipCol : null)
    setNombresCategoriasDinamicos(Object.keys(nom).length ? nom : null)
  } catch (e) {
    errorCarga.value = e?.message || 'Catálogo no disponible'
    categorias.value = []
    setColoresCategoriasDinamicos(null)
    setColoresTiposDinamicos(null)
    setNombresCategoriasDinamicos(null)
  } finally {
    listo.value = true
  }
}

/** Compat: tipos estáticos del config (fallback sin API). */
export function tiposIncidentsFallback() {
  return TIPOS_INCIDENTE
}
