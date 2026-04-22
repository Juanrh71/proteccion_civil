<template>
  <div class="registrar-view">
    <h1 class="page-title">Registrar Incidente</h1>

    <form @submit.prevent="enviar" class="form-registro card">
      <div class="form-col">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de incidente</label>
            <div class="combo" :class="{ 'combo-abierto': abrirTipo }">
              <input
                v-model="tipoQuery"
                type="text"
                class="combo-input"
                placeholder="Escriba para buscar y elija…"
                autocomplete="off"
                aria-autocomplete="list"
                :aria-expanded="abrirTipo"
                @focus="onTipoFocus"
                @blur="onTipoBlur"
                @keydown="onTipoKeydown"
              />
              <span class="combo-chevron" aria-hidden="true" />
              <ul v-show="abrirTipo" class="combo-lista" role="listbox">
                <li
                  v-for="t in tiposFiltrados"
                  :key="t.id"
                  class="combo-item"
                  role="option"
                  @mousedown.prevent="elegirTipo(t)"
                >
                  {{ t.nombre }}
                </li>
                <li v-if="tiposFiltrados.length === 0" class="combo-vacio">Sin coincidencias</li>
              </ul>
            </div>
          </div>
          <div class="form-group">
            <label>Municipio</label>
            <div class="combo" :class="{ 'combo-abierto': abrirMunicipio }">
              <input
                v-model="municipioQuery"
                type="text"
                class="combo-input"
                placeholder="Escriba para buscar (opcional)…"
                autocomplete="off"
                aria-autocomplete="list"
                :aria-expanded="abrirMunicipio"
                @focus="onMunicipioFocus"
                @blur="onMunicipioBlur"
                @keydown="onMunicipioKeydown"
              />
              <span class="combo-chevron" aria-hidden="true" />
              <ul v-show="abrirMunicipio" class="combo-lista" role="listbox">
                <li
                  v-for="m in municipiosFiltrados"
                  :key="m"
                  class="combo-item"
                  role="option"
                  @mousedown.prevent="elegirMunicipio(m)"
                >
                  {{ m }}
                </li>
                <li v-if="municipiosFiltrados.length === 0" class="combo-vacio">Sin coincidencias</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Parroquia</label>
            <select v-model="form.parroquia" class="input" :disabled="parroquiasDisponibles.length === 0">
              <option value="">
                {{ parroquiasDisponibles.length === 0 ? 'Seleccione primero un municipio' : 'Seleccione parroquia (opcional)' }}
              </option>
              <option v-for="p in parroquiasDisponibles" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fecha y hora</label>
            <input
              type="text"
              class="input fecha-deshabilitada"
              :value="fechaHoraVista"
              disabled
              tabindex="-1"
              aria-readonly="true"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="form.descripcion" class="input descripcion-input" rows="2" placeholder="Detalles del incidente..."></textarea>
        </div>

        <div class="form-group">
          <label>Calle, avenida o referencia</label>
          <input v-model="form.via" type="text" class="input" maxlength="500" />
        </div>

        <div class="form-group">
          <label>Ubicación en mapa <span class="hint-opcional">(opcional)</span></label>
          <div class="coords-row">
            <input v-model.number="form.lat" type="number" step="any" class="input" placeholder="Latitud" />
            <input v-model.number="form.lng" type="number" step="any" class="input" placeholder="Longitud" />
            <button type="button" class="btn btn-secondary" @click="obtenerMiUbicacion" :disabled="ubicando">
              {{ ubicando ? 'Obteniendo...' : 'Usar mi ubicación' }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="enviando">
            {{ enviando ? 'Guardando...' : 'Registrar incidente' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="limpiar">Limpiar</button>
        </div>

        <p v-if="mensaje" :class="mensajeOk ? 'msg ok' : 'msg error'">{{ mensaje }}</p>
      </div>

      <div class="map-col">
        <div class="mapa-mini">
          <MapaCarabobo
            :incidentes="puntoUnico"
            :centro="centroMapa"
            :zoom="12"
            permitir-click
            mostrar-buscador
            @ubicacion-seleccionada="asignarCoordenadas"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO, MAPA_CENTRO_CARABOBO, PARROQUIAS_POR_MUNICIPIO } from '../config/incidentes'
import { guardarIncidente } from '../api/incidentes'
import { obtenerUbicacionInversa } from '../api/geocoding.js'

const fechaHoraVista = ref('')
let relojIntervalId = null

function actualizarRelojVista() {
  fechaHoraVista.value = new Date().toLocaleString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function normalizarBusqueda(s) {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

const tipoQuery = ref('')
const municipioQuery = ref('')
const abrirTipo = ref(false)
const abrirMunicipio = ref(false)

const tiposFiltrados = computed(() => {
  const q = normalizarBusqueda(tipoQuery.value.trim())
  if (!q) return TIPOS_INCIDENTE
  return TIPOS_INCIDENTE.filter((t) => {
    const nombre = normalizarBusqueda(t.nombre)
    const id = normalizarBusqueda(String(t.id))
    return nombre.includes(q) || id.includes(q)
  })
})

const municipiosFiltrados = computed(() => {
  const q = normalizarBusqueda(municipioQuery.value.trim())
  if (!q) return MUNICIPIOS_CARABOBO
  return MUNICIPIOS_CARABOBO.filter((m) => normalizarBusqueda(m).includes(q))
})

function onTipoFocus(e) {
  abrirTipo.value = true
  abrirMunicipio.value = false
  nextTick(() => {
    const el = e.target
    if (el && typeof el.select === 'function') el.select()
  })
}

function onTipoBlur() {
  setTimeout(() => {
    abrirTipo.value = false
    if (form.value.tipo) {
      const sel = TIPOS_INCIDENTE.find((t) => t.id === form.value.tipo)
      if (sel) tipoQuery.value = sel.nombre
      return
    }
    const lista = tiposFiltrados.value
    if (lista.length === 1) {
      elegirTipo(lista[0])
      return
    }
    const exact = TIPOS_INCIDENTE.find(
      (t) => normalizarBusqueda(t.nombre) === normalizarBusqueda(tipoQuery.value.trim())
    )
    if (exact) elegirTipo(exact)
  }, 180)
}

function elegirTipo(t) {
  form.value.tipo = t.id
  tipoQuery.value = t.nombre
  abrirTipo.value = false
}

function onTipoKeydown(e) {
  if (e.key === 'Escape') {
    abrirTipo.value = false
    return
  }
  if (e.key !== 'Enter') return
  const list = tiposFiltrados.value
  if (list.length === 1) {
    e.preventDefault()
    elegirTipo(list[0])
  } else if (list.length > 1) {
    const q = normalizarBusqueda(tipoQuery.value.trim())
    const exact = list.find((t) => normalizarBusqueda(t.nombre) === q)
    if (exact) {
      e.preventDefault()
      elegirTipo(exact)
    }
  }
}

function onMunicipioFocus(e) {
  abrirMunicipio.value = true
  abrirTipo.value = false
  nextTick(() => {
    const el = e.target
    if (el && typeof el.select === 'function') el.select()
  })
}

function onMunicipioBlur() {
  setTimeout(() => {
    abrirMunicipio.value = false
    if (form.value.municipio) {
      municipioQuery.value = form.value.municipio
      return
    }
    const lista = municipiosFiltrados.value
    if (lista.length === 1) {
      elegirMunicipio(lista[0])
      return
    }
    const exact = MUNICIPIOS_CARABOBO.find(
      (m) => normalizarBusqueda(m) === normalizarBusqueda(municipioQuery.value.trim())
    )
    if (exact) elegirMunicipio(exact)
  }, 180)
}

function elegirMunicipio(m) {
  form.value.municipio = m
  municipioQuery.value = m
  abrirMunicipio.value = false
}

function onMunicipioKeydown(e) {
  if (e.key === 'Escape') {
    abrirMunicipio.value = false
    return
  }
  if (e.key !== 'Enter') return
  const list = municipiosFiltrados.value
  if (list.length === 1) {
    e.preventDefault()
    elegirMunicipio(list[0])
  } else if (list.length > 1) {
    const q = normalizarBusqueda(municipioQuery.value.trim())
    const exact = list.find((m) => normalizarBusqueda(m) === q)
    if (exact) {
      e.preventDefault()
      elegirMunicipio(exact)
    }
  }
}

let secuenciaReverseRegistrar = 0

const form = ref({
  tipo: '',
  municipio: '',
  parroquia: '',
  descripcion: '',
  via: '',
  lat: null,
  lng: null,
})

const parroquiasDisponibles = computed(() => {
  const m = form.value.municipio
  if (!m) return []
  return PARROQUIAS_POR_MUNICIPIO[m] || []
})

onMounted(() => {
  actualizarRelojVista()
  relojIntervalId = setInterval(actualizarRelojVista, 1000)
})

onUnmounted(() => {
  if (relojIntervalId != null) {
    clearInterval(relojIntervalId)
    relojIntervalId = null
  }
})

watch(tipoQuery, (q) => {
  if (!form.value.tipo) return
  const sel = TIPOS_INCIDENTE.find((t) => t.id === form.value.tipo)
  if (!sel) return
  if (normalizarBusqueda((q || '').trim()) !== normalizarBusqueda(sel.nombre)) {
    form.value.tipo = ''
  }
})

watch(municipioQuery, (q) => {
  if (!form.value.municipio) return
  if (normalizarBusqueda((q || '').trim()) !== normalizarBusqueda(form.value.municipio)) {
    form.value.municipio = ''
  }
})

watch(
  () => form.value.municipio,
  () => {
    if (!parroquiasDisponibles.value.includes(form.value.parroquia)) {
      form.value.parroquia = ''
    }
  }
)

const enviando = ref(false)
const ubicando = ref(false)
const mensaje = ref('')
const mensajeOk = ref(false)

const centroMapa = computed(() => {
  if (form.value.lat != null && form.value.lng != null) {
    return { lat: form.value.lat, lng: form.value.lng }
  }
  return MAPA_CENTRO_CARABOBO
})

const puntoUnico = computed(() => {
  if (form.value.lat != null && form.value.lng != null) {
    return [{
      lat: form.value.lat,
      lng: form.value.lng,
      tipo_nombre: 'Ubicación seleccionada',
      categoria: 'otro',
    }]
  }
  return []
})

function viaDesdeLabelBusqueda(label) {
  if (!label || typeof label !== 'string') return ''
  const primera = label.split(',')[0].trim()
  if (!primera || primera.length > 500) return ''
  const pNorm = normalizarBusqueda(primera)
  for (const m of MUNICIPIOS_CARABOBO) {
    if (normalizarBusqueda(m) === pNorm) return ''
  }
  return primera
}

async function aplicarReverseDesdeCoordenadasRegistrar(lat, lng, labelBusqueda) {
  const seq = ++secuenciaReverseRegistrar
  const u = await obtenerUbicacionInversa(lat, lng)
  if (seq !== secuenciaReverseRegistrar) return
  if (u.municipio && MUNICIPIOS_CARABOBO.includes(u.municipio)) {
    form.value.municipio = u.municipio
    municipioQuery.value = u.municipio
  }
  if (u.via && String(u.via).trim()) {
    form.value.via = String(u.via).trim()
  } else if (labelBusqueda) {
    const desdeLabel = viaDesdeLabelBusqueda(labelBusqueda)
    if (desdeLabel) form.value.via = desdeLabel
  }
}

async function asignarCoordenadas(coords) {
  form.value.lat = coords.lat
  form.value.lng = coords.lng
  const label = coords.label != null ? String(coords.label) : ''
  await aplicarReverseDesdeCoordenadasRegistrar(coords.lat, coords.lng, label)
}

function obtenerMiUbicacion() {
  if (!navigator.geolocation) {
    mensaje.value = 'Su navegador no soporta geolocalización.'
    mensajeOk.value = false
    return
  }
  ubicando.value = true
  mensaje.value = ''
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      form.value.lat = pos.coords.latitude
      form.value.lng = pos.coords.longitude
      await aplicarReverseDesdeCoordenadasRegistrar(form.value.lat, form.value.lng, '')
      ubicando.value = false
      mensaje.value = 'Ubicación obtenida correctamente.'
      mensajeOk.value = true
    },
    () => {
      ubicando.value = false
      mensaje.value = 'No se pudo obtener la ubicación. Puede registrar sin coordenadas o intentar de nuevo.'
      mensajeOk.value = false
    }
  )
}

function limpiar() {
  form.value = {
    tipo: '',
    municipio: '',
    parroquia: '',
    descripcion: '',
    via: '',
    lat: null,
    lng: null,
  }
  tipoQuery.value = ''
  municipioQuery.value = ''
  abrirTipo.value = false
  abrirMunicipio.value = false
  mensaje.value = ''
}

async function enviar() {
  if (!form.value.tipo) {
    mensaje.value = 'Seleccione el tipo de incidente.'
    mensajeOk.value = false
    return
  }
  enviando.value = true
  mensaje.value = ''
  try {
    await guardarIncidente({
      tipo: form.value.tipo,
      municipio: form.value.municipio,
      parroquia: form.value.parroquia,
      descripcion: form.value.descripcion,
      via: form.value.via,
      lat: form.value.lat,
      lng: form.value.lng,
      fecha: new Date().toISOString(),
    })
    mensaje.value = 'Incidente registrado correctamente.'
    mensajeOk.value = true
    limpiar()
  } catch (e) {
    let msg = 'Error al guardar. Intente de nuevo.'
    if (e.response?.data?.error) {
      msg = e.response.data.error
    } else if (e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
      msg = 'No hay conexión con el servidor. ¿Está corriendo el backend (puerto 3000)?'
    } else if (e.message) {
      msg = e.message
    }
    mensaje.value = msg
    mensajeOk.value = false
  }
  enviando.value = false
}
</script>

<style scoped>
.registrar-view {
  max-width: 1220px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.page-title {
  margin-bottom: 0.5rem;
  font-size: 1.35rem;
}
.form-registro {
  flex: 1;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 42%);
  column-gap: 1rem;
  padding: 0.75rem;
}
.form-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.map-col {
  min-width: 0;
  height: 100%;
}
.form-group { margin-bottom: 0.55rem; }
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.combo {
  position: relative;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius, 6px);
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.combo:focus-within,
.combo-abierto {
  border-color: var(--color-secondary, #334155);
  box-shadow: 0 0 0 2px rgba(51, 65, 85, 0.12);
}
.combo-input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  padding: 0.55rem 2rem 0.55rem 0.75rem;
  font-size: 0.9375rem;
  font-family: inherit;
  color: var(--color-text, #1e293b);
  background: transparent;
  outline: none;
  border-radius: var(--radius, 6px);
}
.combo-input::placeholder {
  color: #94a3b8;
}
.combo-chevron {
  pointer-events: none;
  position: absolute;
  right: 0.65rem;
  top: 50%;
  width: 0.5rem;
  height: 0.5rem;
  margin-top: -0.35rem;
  border-right: 2px solid #64748b;
  border-bottom: 2px solid #64748b;
  transform: rotate(45deg);
  opacity: 0.7;
}
.combo-lista {
  position: absolute;
  left: -1px;
  right: -1px;
  top: calc(100% + 2px);
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  max-height: min(240px, 45vh);
  overflow-y: auto;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius, 6px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  z-index: 30;
}
.combo-item {
  padding: 0.5rem 0.85rem;
  font-size: 0.875rem;
  line-height: 1.35;
  cursor: pointer;
  color: var(--color-text, #1e293b);
}
.combo-item:hover {
  background: #f1f5f9;
}
.combo-vacio {
  padding: 0.65rem 0.85rem;
  font-size: 0.8125rem;
  color: #94a3b8;
  cursor: default;
}
.coords-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.coords-row .input {
  flex: 1;
  min-width: 120px;
}
.fecha-deshabilitada {
  background: #f1f5f9;
  color: var(--color-text);
  cursor: not-allowed;
  opacity: 1;
}
.mapa-mini {
  padding: 0;
  overflow: hidden;
  height: 100%;
  min-height: 320px;
  margin: 0;
  border-radius: var(--radius, 6px);
  border: 1px solid #e2e8f0;
}
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.35rem;
}
.msg {
  margin-top: 0.25rem;
  font-size: 0.9375rem;
}
.descripcion-input {
  min-height: 62px;
  resize: vertical;
}
.msg.ok { color: var(--color-success); }
.msg.error { color: var(--color-primary); }
.hint-opcional {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--color-text-muted, #64748b);
}
@media (max-width: 980px) {
  .form-registro {
    display: flex;
    flex-direction: column;
    row-gap: 0;
    overflow-y: auto;
    padding-right: 0.5rem;
  }
  .mapa-mini {
    height: 220px;
    min-height: 220px;
    margin: 0.35rem 0 0.55rem;
  }
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
