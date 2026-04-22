<template>
  <div class="incidentes-view">
    <div class="titulo-acciones">
      <h1 class="page-title">Listado de Incidentes</h1>
      <button type="button" class="btn btn-secondary" :disabled="descargandoPdf" @click="descargarPdf">
        {{ descargandoPdf ? 'Generando PDF…' : 'Descargar PDF' }}
      </button>
    </div>

    <div class="vista-por-estado card" role="tablist" aria-label="Filtrar listado por estado del incidente">
      <div class="vista-por-estado-inner">
        <button
          type="button"
          class="vista-tab"
          :class="{ activa: vistaLista === 'abiertos' }"
          role="tab"
          :aria-selected="vistaLista === 'abiertos'"
          @click="vistaLista = 'abiertos'"
        >
          <span class="vista-tab-titulo">Abiertos</span>
          <span class="vista-tab-sub">Recibidos, pendientes de despacho</span>
          <span class="vista-tab-num">{{ conteoAbiertos }}</span>
        </button>
        <button
          type="button"
          class="vista-tab"
          :class="{ activa: vistaLista === 'en_proceso' }"
          role="tab"
          :aria-selected="vistaLista === 'en_proceso'"
          @click="vistaLista = 'en_proceso'"
        >
          <span class="vista-tab-titulo">En proceso</span>
          <span class="vista-tab-sub">Atención o seguimiento activo</span>
          <span class="vista-tab-num">{{ conteoEnProceso }}</span>
        </button>
        <button
          type="button"
          class="vista-tab"
          :class="{ activa: vistaLista === 'cerrados' }"
          role="tab"
          :aria-selected="vistaLista === 'cerrados'"
          @click="vistaLista = 'cerrados'"
        >
          <span class="vista-tab-titulo">Cerrados</span>
          <span class="vista-tab-sub">Incidente finalizado</span>
          <span class="vista-tab-num">{{ conteoCerrados }}</span>
        </button>
      </div>
    </div>

    <div class="filtros card">
      <div class="filtros-row">
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="filtroTipo" class="input">
            <option value="">Todos</option>
            <option v-for="t in TIPOS_INCIDENTE" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Municipios</label>
          <div class="combo" :class="{ 'combo-abierto': abrirMunicipios }">
            <div v-if="filtroMunicipios.length > 0" class="chips-wrap">
              <span v-for="m in filtroMunicipios" :key="m" class="chip-item">
                {{ m }}
                <button type="button" class="chip-x" @click.stop="quitarMunicipio(m)">×</button>
              </span>
            </div>
            <input
              v-model="municipioQuery"
              type="text"
              class="combo-input"
              placeholder="Escriba y seleccione municipios…"
              @focus="abrirMunicipios = true"
              @blur="onMunicipiosBlur"
              @keydown.enter.prevent="agregarPrimerMunicipio"
            />
            <ul v-show="abrirMunicipios" class="combo-lista" role="listbox">
              <li
                v-for="m in municipiosFiltradosLista"
                :key="m"
                class="combo-item"
                role="option"
                @mousedown.prevent="toggleMunicipio(m)"
              >
                <span>{{ m }}</span>
                <span v-if="filtroMunicipios.includes(m)">✓</span>
              </li>
              <li v-if="municipiosFiltradosLista.length === 0" class="combo-vacio">Sin coincidencias</li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label>Parroquias</label>
          <div class="combo" :class="{ 'combo-abierto': abrirParroquias }">
            <div v-if="filtroParroquias.length > 0" class="chips-wrap">
              <span v-for="p in filtroParroquias" :key="p" class="chip-item">
                {{ p }}
                <button type="button" class="chip-x" @click.stop="quitarParroquia(p)">×</button>
              </span>
            </div>
            <input
              v-model="parroquiaQuery"
              type="text"
              class="combo-input"
              placeholder="Escriba y seleccione parroquias…"
              :disabled="parroquiasOpcionesFiltro.length === 0"
              @focus="abrirParroquias = true"
              @blur="onParroquiasBlur"
              @keydown.enter.prevent="agregarPrimeraParroquia"
            />
            <ul v-show="abrirParroquias" class="combo-lista" role="listbox">
              <li
                v-for="p in parroquiasFiltradasLista"
                :key="p"
                class="combo-item"
                role="option"
                @mousedown.prevent="toggleParroquia(p)"
              >
                <span>{{ p }}</span>
                <span v-if="filtroParroquias.includes(p)">✓</span>
              </li>
              <li v-if="parroquiasFiltradasLista.length === 0" class="combo-vacio">Sin coincidencias</li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label>Buscar</label>
          <input v-model="filtroTexto" type="text" class="input" placeholder="Descripción, tipo, municipio, parroquia o calle…" />
        </div>
      </div>
    </div>

    <div class="card incidentes-card">
      <div class="tabla-wrap">
        <table class="tabla">
          <thead>
            <tr>
              <th>N°</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Municipio</th>
              <th>Parroquia</th>
              <th>Calle / Avenida</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in incidentesFiltrados" :key="inc.id">
              <td>{{ numeroOrdenPorIncidente[inc.id] }}</td>
              <td>{{ formatearFecha(inc.fecha) }}</td>
              <td>{{ inc.tipo_nombre || inc.tipo }}</td>
              <td>{{ inc.municipio || '—' }}</td>
              <td>{{ inc.parroquia || '—' }}</td>
              <td>{{ inc.via || '—' }}</td>
              <td>
                <span v-if="textoEstadoListado(inc) === 'Cerrado'" class="badge-estado badge-cerrado">Cerrado</span>
                <span v-else-if="textoEstadoListado(inc) === 'En proceso'" class="badge-estado badge-proceso">En proceso</span>
                <span v-else class="badge-estado badge-abierto">Abierto</span>
              </td>
              <td>{{ inc.descripcion || '—' }}</td>
              <td>
                <span v-if="inc.lat != null && inc.lng != null">{{ Number(inc.lat).toFixed(4) }}, {{ Number(inc.lng).toFixed(4) }}</span>
                <span v-else>—</span>
              </td>
              <td class="acciones-cell">
                <div class="acciones-btns">
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    :disabled="!esEditable(inc)"
                    :title="!esEditable(inc) ? motivoBloqueoEdicion(inc) : 'Editar incidente'"
                    @click="abrirEditar(inc)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="inc.estado === 'abierto' && inc.cerrado !== true"
                    type="button"
                    class="btn btn-proceso btn-sm"
                    :disabled="cambiandoEstadoId === inc.id || cerrandoId === inc.id"
                    @click="marcarEstadoOperativo(inc, 'en_proceso')"
                  >
                    {{ cambiandoEstadoId === inc.id ? '…' : 'En proceso' }}
                  </button>
                  <button
                    v-if="inc.estado === 'en_proceso' && inc.cerrado !== true"
                    type="button"
                    class="btn btn-secondary btn-sm"
                    :disabled="cambiandoEstadoId === inc.id || cerrandoId === inc.id"
                    @click="marcarEstadoOperativo(inc, 'abierto')"
                  >
                    {{ cambiandoEstadoId === inc.id ? '…' : 'Pasar a abierto' }}
                  </button>
                  <button
                    v-if="inc.cerrado !== true"
                    type="button"
                    class="btn btn-cerrar btn-sm"
                    :disabled="cerrandoId === inc.id || cambiandoEstadoId === inc.id"
                    @click="confirmarCerrarDesdeFila(inc)"
                  >
                    {{ cerrandoId === inc.id ? 'Cerrando…' : 'Cerrar incidente' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="incidentesFiltrados.length === 0" class="sin-datos">No hay incidentes que coincidan con los filtros.</p>
      <p class="total">Total: {{ incidentesFiltrados.length }} incidente(s)</p>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal modal-editar card">
        <h3 class="modal-title">Editar reporte N° {{ editingNumeroReporte }}</h3>
        <form @submit.prevent="guardarEdicion" class="form-editar">
          <div class="form-group">
            <label>Tipo de incidente</label>
            <input :value="tipoEdicionNombre" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Fecha y hora</label>
            <input :value="fechaEdicionFija" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Parroquia</label>
            <input :value="parroquiaEdicionFija" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Municipio</label>
            <input v-model="formEditar.municipio" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formEditar.descripcion" class="input" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Calle, avenida o referencia</label>
            <input v-model="formEditar.via" type="text" class="input" maxlength="500" />
          </div>
          <div class="form-group">
            <label>Ubicación en mapa (opcional)</label>
            <div class="coords-row">
              <input v-model.number="formEditar.lat" type="number" step="any" class="input" placeholder="Latitud" />
              <input v-model.number="formEditar.lng" type="number" step="any" class="input" placeholder="Longitud" />
            </div>
            <div class="mapa-mini card">
              <MapaCarabobo
                :incidentes="puntoEdicionMapa"
                :centro="centroEdicionMapa"
                :zoom="14"
                permitir-click
                mostrar-buscador
                @ubicacion-seleccionada="asignarCoordenadasEdicion"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="guardando || cerrandoId != null">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
            <button
              v-if="editingAbierto"
              type="button"
              class="btn btn-cerrar"
              :disabled="cerrandoId != null"
              @click="confirmarCerrarDesdeModal"
            >
              {{ cerrandoId != null ? 'Cerrando…' : 'Cerrar incidente' }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="cerrandoId != null" @click="cerrarModal">Cancelar</button>
          </div>
          <p v-if="mensajeEditar" :class="mensajeEditarOk ? 'msg ok' : 'msg error'">{{ mensajeEditar }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import {
  obtenerIncidentes,
  actualizarIncidente,
  cerrarIncidente,
  actualizarEstadoIncidente,
} from '../api/incidentes'
import { obtenerUbicacionInversa } from '../api/geocoding.js'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO, MAPA_CENTRO_CARABOBO } from '../config/incidentes'
import { descargarPdfTablaIncidentes } from '../utils/pdfTablaIncidentes.js'

const incidentes = ref([])
const vistaLista = ref('abiertos')
const filtroTipo = ref('')
const filtroMunicipios = ref([])
const filtroParroquias = ref([])
const filtroTexto = ref('')
const municipioQuery = ref('')
const parroquiaQuery = ref('')
const abrirMunicipios = ref(false)
const abrirParroquias = ref(false)
const mostrarModal = ref(false)
const editingId = ref(null)
const editingNumeroReporte = ref(0)
const tipoEdicionFijo = ref('')
const tipoEdicionNombre = ref('')
const fechaEdicionFija = ref('')
const parroquiaEdicionFija = ref('')
const editingAbierto = ref(true)
const cerrandoId = ref(null)
const cambiandoEstadoId = ref(null)
const guardando = ref(false)
const mensajeEditar = ref('')
const mensajeEditarOk = ref(false)
const descargandoPdf = ref(false)
const logoPdfDataUrl = ref(null)
const ahoraMs = ref(Date.now())
const listaFetchMs = ref(Date.now())
let relojEdicion = null
let secuenciaReverseMunicipio = 0

const formEditar = ref({
  municipio: '',
  descripcion: '',
  via: '',
  lat: null,
  lng: null,
})

const numeroOrdenPorIncidente = computed(() => {
  const lista = []
  for (let i = 0; i < incidentes.value.length; i++) {
    lista.push(incidentes.value[i])
  }
  lista.sort(function (a, b) {
    const ta = a.fecha ? new Date(a.fecha).getTime() : Number.MAX_SAFE_INTEGER
    const tb = b.fecha ? new Date(b.fecha).getTime() : Number.MAX_SAFE_INTEGER
    if (ta !== tb) return ta - tb
    return (a.id || 0) - (b.id || 0)
  })
  const map = {}
  for (let j = 0; j < lista.length; j++) {
    map[lista[j].id] = j + 1
  }
  return map
})

function incPerteneceAVista(inc, vista) {
  const cerr = inc.cerrado === true
  let est = 'abierto'
  if (cerr || inc.estado === 'cerrado') est = 'cerrado'
  else if (inc.estado === 'en_proceso') est = 'en_proceso'
  if (vista === 'cerrados') return est === 'cerrado'
  if (vista === 'en_proceso') return est === 'en_proceso'
  return est === 'abierto'
}

const conteoAbiertos = computed(() => incidentes.value.filter((i) => incPerteneceAVista(i, 'abiertos')).length)
const conteoEnProceso = computed(() => incidentes.value.filter((i) => incPerteneceAVista(i, 'en_proceso')).length)
const conteoCerrados = computed(() => incidentes.value.filter((i) => incPerteneceAVista(i, 'cerrados')).length)

function normalizarBusqueda(s) {
  if (s == null || s === '') return ''
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

const incidentesFiltrados = computed(() => {
  const todos = incidentes.value
  const salida = []
  for (let i = 0; i < todos.length; i++) {
    const inc = todos[i]
    if (!incPerteneceAVista(inc, vistaLista.value)) continue
    if (filtroTipo.value && inc.tipo !== filtroTipo.value) continue
    if (filtroMunicipios.value.length > 0 && !filtroMunicipios.value.includes(inc.municipio || '')) continue
    if (filtroParroquias.value.length > 0 && !filtroParroquias.value.includes(inc.parroquia || '')) continue
    const textoBuscar = filtroTexto.value.trim()
    if (textoBuscar) {
      const buscar = normalizarBusqueda(textoBuscar)
      let ok = false
      if (inc.descripcion && normalizarBusqueda(inc.descripcion).includes(buscar)) ok = true
      if (!ok && inc.tipo_nombre && normalizarBusqueda(inc.tipo_nombre).includes(buscar)) ok = true
      if (!ok && inc.tipo && normalizarBusqueda(String(inc.tipo)).includes(buscar)) ok = true
      if (!ok && inc.municipio && normalizarBusqueda(inc.municipio).includes(buscar)) ok = true
      if (!ok && inc.parroquia && normalizarBusqueda(String(inc.parroquia)).includes(buscar)) ok = true
      if (!ok && inc.via && normalizarBusqueda(String(inc.via)).includes(buscar)) ok = true
      if (!ok) continue
    }
    salida.push(inc)
  }
  salida.sort(function (a, b) {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  })
  return salida
})

const parroquiasOpcionesFiltro = computed(() => {
  const set = new Set()
  const municipiosSeleccionados = filtroMunicipios.value
  for (const inc of incidentes.value) {
    const mun = inc.municipio || ''
    const parroquia = inc.parroquia || ''
    if (!parroquia) continue
    if (municipiosSeleccionados.length > 0 && !municipiosSeleccionados.includes(mun)) continue
    set.add(parroquia)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
})

const municipiosFiltradosLista = computed(() => {
  const q = normalizarBusqueda(municipioQuery.value.trim())
  if (!q) return MUNICIPIOS_CARABOBO
  return MUNICIPIOS_CARABOBO.filter((m) => normalizarBusqueda(m).includes(q))
})

const parroquiasFiltradasLista = computed(() => {
  const q = normalizarBusqueda(parroquiaQuery.value.trim())
  if (!q) return parroquiasOpcionesFiltro.value
  return parroquiasOpcionesFiltro.value.filter((p) => normalizarBusqueda(p).includes(q))
})

watch(parroquiasOpcionesFiltro, (opciones) => {
  const permitidas = new Set(opciones)
  filtroParroquias.value = filtroParroquias.value.filter((p) => permitidas.has(p))
})

function toggleMunicipio(m) {
  const i = filtroMunicipios.value.indexOf(m)
  if (i >= 0) filtroMunicipios.value.splice(i, 1)
  else filtroMunicipios.value.push(m)
}

function toggleParroquia(p) {
  const i = filtroParroquias.value.indexOf(p)
  if (i >= 0) filtroParroquias.value.splice(i, 1)
  else filtroParroquias.value.push(p)
}

function quitarMunicipio(m) {
  filtroMunicipios.value = filtroMunicipios.value.filter((x) => x !== m)
}

function quitarParroquia(p) {
  filtroParroquias.value = filtroParroquias.value.filter((x) => x !== p)
}

function agregarPrimerMunicipio() {
  if (municipiosFiltradosLista.value.length === 0) return
  toggleMunicipio(municipiosFiltradosLista.value[0])
}

function agregarPrimeraParroquia() {
  if (parroquiasFiltradasLista.value.length === 0) return
  toggleParroquia(parroquiasFiltradasLista.value[0])
}

function onMunicipiosBlur() {
  setTimeout(() => { abrirMunicipios.value = false }, 160)
}

function onParroquiasBlur() {
  setTimeout(() => { abrirParroquias.value = false }, 160)
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleString('es-VE')
}

function textoEstadoListado(inc) {
  if (!inc) return '—'
  if (inc.cerrado === true || inc.estado === 'cerrado') return 'Cerrado'
  if (inc.estado === 'en_proceso') return 'En proceso'
  return 'Abierto'
}

function segundosDesdeRegistroEstimados(inc) {
  if (!inc) return Infinity
  const s = inc.segundos_desde_registro
  if (s != null && Number.isFinite(Number(s))) {
    const base = Number(s)
    const extra = (ahoraMs.value - listaFetchMs.value) / 1000
    return base + extra
  }
  if (!inc.fecha) return Infinity
  const t = new Date(inc.fecha).getTime()
  if (Number.isNaN(t)) return Infinity
  return (ahoraMs.value - t) / 1000
}

function esEditable(inc) {
  if (!inc || inc.cerrado === true || inc.estado === 'cerrado') return false
  return segundosDesdeRegistroEstimados(inc) < 120
}

function motivoBloqueoEdicion(inc) {
  if (!inc) return 'No se puede editar.'
  if (inc.cerrado === true) return 'No se puede editar: incidente cerrado.'
  return 'No se puede editar: pasaron más de 2 minutos desde el registro.'
}

function cargarLogoBase64() {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = '/imagenes/logo.png'
  })
}

function descargarPdf() {
  descargandoPdf.value = true
  try {
    const filas = incidentesFiltrados.value.map((inc) => [
      String(numeroOrdenPorIncidente.value[inc.id] ?? ''),
      formatearFecha(inc.fecha),
      inc.tipo_nombre || inc.tipo || '—',
      inc.municipio || '—',
      inc.parroquia || '—',
      inc.via || '—',
      textoEstadoListado(inc),
      inc.descripcion || '—',
      inc.lat != null && inc.lng != null
        ? `${Number(inc.lat).toFixed(4)}, ${Number(inc.lng).toFixed(4)}`
        : '—',
    ])
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
    descargarPdfTablaIncidentes({
      logoDataUrl: logoPdfDataUrl.value,
      tituloPrincipal: 'Tabla de incidentes',
      lineasInfo: [`Generado: ${new Date().toLocaleString('es-VE')}`],
      tablaStartY: 30,
      filas,
      nombreArchivo: `tabla_incidentes_${stamp}.pdf`,
    })
  } catch (err) {
    console.error(err)
    alert('No se pudo generar el PDF. Si el problema continúa, recargue la página e intente de nuevo.')
  } finally {
    descargandoPdf.value = false
  }
}

function abrirEditar(inc) {
  if (!esEditable(inc)) {
    alert(motivoBloqueoEdicion(inc))
    return
  }
  editingId.value = inc.id
  editingNumeroReporte.value = numeroOrdenPorIncidente.value[inc.id] ?? 0
  tipoEdicionFijo.value = inc.tipo ? inc.tipo : ''
  tipoEdicionNombre.value = inc.tipo_nombre || inc.tipo || '—'
  fechaEdicionFija.value = formatearFecha(inc.fecha)
  parroquiaEdicionFija.value = inc.parroquia || '—'
  editingAbierto.value = inc.cerrado !== true
  let lat = null
  let lng = null
  if (inc.lat !== undefined && inc.lat !== null) lat = inc.lat
  if (inc.lng !== undefined && inc.lng !== null) lng = inc.lng

  formEditar.value = {
    municipio: inc.municipio ? inc.municipio : '',
    descripcion: inc.descripcion ? inc.descripcion : '',
    via: inc.via != null && inc.via !== '' ? String(inc.via) : '',
    lat: lat,
    lng: lng,
  }
  mensajeEditar.value = ''
  mostrarModal.value = true
}

const centroEdicionMapa = computed(() => {
  const f = formEditar.value
  if (f.lat != null && f.lng != null) {
    return { lat: f.lat, lng: f.lng }
  }
  return MAPA_CENTRO_CARABOBO
})

const puntoEdicionMapa = computed(() => {
  const f = formEditar.value
  if (f.lat != null && f.lng != null) {
    return [
      {
        lat: f.lat,
        lng: f.lng,
        tipo_nombre: 'Ubicación del reporte',
        categoria: 'otro',
      },
    ]
  }
  return []
})

function viaDesdeLabelBusquedaEdicion(label) {
  if (!label || typeof label !== 'string') return ''
  const primera = label.split(',')[0].trim()
  if (!primera || primera.length > 500) return ''
  const pNorm = normalizarBusqueda(primera)
  for (const m of MUNICIPIOS_CARABOBO) {
    if (normalizarBusqueda(m) === pNorm) return ''
  }
  return primera
}

async function asignarCoordenadasEdicion(coords) {
  formEditar.value.lat = coords.lat
  formEditar.value.lng = coords.lng
  const labelBusqueda = coords.label != null ? String(coords.label) : ''
  const seq = ++secuenciaReverseMunicipio
  const u = await obtenerUbicacionInversa(coords.lat, coords.lng)
  if (seq !== secuenciaReverseMunicipio) return
  if (u.municipio && MUNICIPIOS_CARABOBO.includes(u.municipio)) {
    formEditar.value.municipio = u.municipio
  }
  if (u.via && String(u.via).trim()) {
    formEditar.value.via = String(u.via).trim()
  } else if (labelBusqueda) {
    const desdeLabel = viaDesdeLabelBusquedaEdicion(labelBusqueda)
    if (desdeLabel) formEditar.value.via = desdeLabel
  }
}

function cerrarModal() {
  mostrarModal.value = false
  editingId.value = null
  editingNumeroReporte.value = 0
  tipoEdicionFijo.value = ''
  tipoEdicionNombre.value = ''
  fechaEdicionFija.value = ''
  parroquiaEdicionFija.value = ''
  editingAbierto.value = true
}

async function marcarEstadoOperativo(inc, estado) {
  if (!inc || cambiandoEstadoId.value != null) return
  cambiandoEstadoId.value = inc.id
  try {
    await actualizarEstadoIncidente(inc.id, estado)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
  } catch (e) {
    let msg = 'No se pudo actualizar el estado.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    alert(msg)
  } finally {
    cambiandoEstadoId.value = null
  }
}

async function confirmarCerrarDesdeFila(inc) {
  if (
    !confirm(
      '¿Cerrar este incidente? Dejará de mostrarse en el mapa en vivo hasta un nuevo registro.'
    )
  ) {
    return
  }
  cerrandoId.value = inc.id
  try {
    await cerrarIncidente(inc.id)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
  } catch (e) {
    let msg = 'No se pudo cerrar el incidente.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    alert(msg)
  } finally {
    cerrandoId.value = null
  }
}

async function confirmarCerrarDesdeModal() {
  const id = editingId.value
  if (id == null) return
  if (
    !confirm(
      '¿Cerrar este incidente? Dejará de mostrarse en el mapa en vivo hasta un nuevo registro.'
    )
  ) {
    return
  }
  cerrandoId.value = id
  try {
    await cerrarIncidente(id)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
    cerrarModal()
  } catch (e) {
    let msg = 'No se pudo cerrar el incidente.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    mensajeEditar.value = msg
    mensajeEditarOk.value = false
  } finally {
    cerrandoId.value = null
  }
}

async function guardarEdicion() {
  if (!tipoEdicionFijo.value) {
    mensajeEditar.value = 'No se pudo determinar el tipo del incidente.'
    mensajeEditarOk.value = false
    return
  }
  guardando.value = true
  mensajeEditar.value = ''
  try {
    const payload = {
      tipo: tipoEdicionFijo.value,
      municipio: formEditar.value.municipio,
      descripcion: formEditar.value.descripcion,
      via: formEditar.value.via,
      lat: formEditar.value.lat,
      lng: formEditar.value.lng,
    }
    await actualizarIncidente(editingId.value, payload)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
    cerrarModal()
  } catch (e) {
    let msg = 'Error al guardar. Intente de nuevo.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    mensajeEditar.value = msg
    mensajeEditarOk.value = false
  }
  guardando.value = false
}

function aplicarListaIncidentesDesdeApi(data) {
  incidentes.value = Array.isArray(data) ? data : []
  listaFetchMs.value = Date.now()
}

onMounted(async () => {
  aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
  logoPdfDataUrl.value = await cargarLogoBase64()
  relojEdicion = setInterval(() => {
    ahoraMs.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (relojEdicion != null) {
    clearInterval(relojEdicion)
    relojEdicion = null
  }
})
</script>

<style scoped>
.incidentes-view {
  max-width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.titulo-acciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.titulo-acciones .page-title {
  margin-bottom: 0;
}
.filtros-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}
.combo {
  position: relative;
  border: 1px solid #c8d3e1;
  border-radius: var(--radius, 6px);
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}
.combo:focus-within,
.combo-abierto {
  border-color: rgba(0, 51, 204, 0.45);
  box-shadow: 0 0 0 3px rgba(0, 51, 204, 0.12);
}
.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.42rem 0.52rem 0.05rem;
}
.chip-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #e6efff;
  color: #163274;
  border: 1px solid #c8dcff;
  border-radius: 999px;
  padding: 0.18rem 0.42rem;
  font-size: 0.75rem;
  font-weight: 500;
}
.chip-x {
  border: none;
  background: transparent;
  color: #163274;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0;
}
.combo-input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  padding: 0.5rem 0.7rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--color-text, #1e293b);
  background: transparent;
  outline: none;
  border-radius: var(--radius, 6px);
}
.combo-lista {
  position: absolute;
  left: -1px;
  right: -1px;
  top: calc(100% + 2px);
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  max-height: min(240px, 42vh);
  overflow-y: auto;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius, 6px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  z-index: 30;
}
.combo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.48rem 0.72rem;
  font-size: 0.86rem;
  line-height: 1.35;
  cursor: pointer;
  color: var(--color-text, #1e293b);
}
.combo-item:hover {
  background: #eef4ff;
}
.combo-vacio {
  padding: 0.65rem 0.75rem;
  font-size: 0.8125rem;
  color: #94a3b8;
  cursor: default;
}
.incidentes-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tabla-wrap {
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
}
.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}
.tabla th,
.tabla td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.tabla th {
  font-weight: 600;
  color: var(--color-secondary);
  background: #f8fafc;
}
.tabla td {
  color: var(--color-text);
}
.sin-datos {
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
}
.total {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  border-top: 1px solid #e2e8f0;
}
.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
}
.acciones-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}
.btn-cerrar {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background: #fff;
}
.btn-cerrar:hover:not(:disabled) {
  background: #fff5f5;
}
.badge-estado {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}
.badge-abierto {
  background: #ecfdf5;
  color: #047857;
}
.badge-proceso {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.badge-cerrado {
  background: #f1f5f9;
  color: #64748b;
}
.vista-por-estado {
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.85rem;
}
.vista-por-estado-inner {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.vista-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #c8d3e1;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  font: inherit;
}
.vista-tab:hover {
  border-color: #94a3b8;
  background: #fff;
}
.vista-tab.activa {
  border-color: #0033cc;
  box-shadow: 0 0 0 2px rgba(0, 51, 204, 0.12);
  background: linear-gradient(180deg, #f0f4ff 0%, #e8efff 100%);
}
.vista-tab-titulo {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-secondary);
}
.vista-tab-sub {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.25;
}
.vista-tab-num {
  margin-top: 0.15rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0033cc;
}
.btn-proceso {
  border: 1px solid #d97706;
  color: #b45309;
  background: #fffbeb;
}
.btn-proceso:hover:not(:disabled) {
  background: #fef3c7;
}
@media (max-width: 720px) {
  .vista-por-estado-inner {
    grid-template-columns: 1fr;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal {
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-editar {
  max-width: 640px;
}
.coords-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.coords-row .input {
  flex: 1;
  min-width: 120px;
}
.mapa-mini {
  padding: 0;
  overflow: hidden;
  height: 260px;
}
.modal-title {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: var(--color-secondary);
}
.form-editar .form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.form-editar .msg {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}
.form-editar .msg.ok { color: var(--color-success); }
.form-editar .msg.error { color: var(--color-primary); }
.hint-opcional {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--color-text-muted, #64748b);
}
@media (max-width: 768px) {
  .tabla th:nth-child(6),
  .tabla td:nth-child(6) { display: none; }
  .tabla th:nth-child(7),
  .tabla td:nth-child(7) { display: none; }
  .tabla th:nth-child(8),
  .tabla td:nth-child(8) { display: none; }
  .tabla th:nth-child(9),
  .tabla td:nth-child(9) { display: none; }
}
</style>
