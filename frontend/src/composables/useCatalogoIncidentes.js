import { ref, computed } from 'vue'
import { getToken } from '../api/auth.js'
import { getCatalogoRegistro } from '../api/catalogo.js'
import {
  setColoresCategoriasDinamicos,
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
        id: t.slug,
        nombre: t.nombre,
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

export function useCatalogoIncidentes() {
  return {
    categorias,
    listo,
    errorCarga,
    tiposPlano,
    leyendaCategorias,
    cargarCatalogoIncidentes,
  }
}

export async function cargarCatalogoIncidentes() {
  if (!getToken()) {
    setColoresCategoriasDinamicos(null)
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
    for (const c of cats) {
      if (c.slug) {
        if (c.color) col[c.slug] = c.color
        if (c.nombre) nom[c.slug] = c.nombre
      }
    }
    setColoresCategoriasDinamicos(Object.keys(col).length ? col : null)
    setNombresCategoriasDinamicos(Object.keys(nom).length ? nom : null)
  } catch (e) {
    errorCarga.value = e?.message || 'Catálogo no disponible'
    categorias.value = []
    setColoresCategoriasDinamicos(null)
    setNombresCategoriasDinamicos(null)
  } finally {
    listo.value = true
  }
}

/** Compat: tipos estáticos del config (fallback sin API). */
export function tiposIncidentsFallback() {
  return TIPOS_INCIDENTE
}
