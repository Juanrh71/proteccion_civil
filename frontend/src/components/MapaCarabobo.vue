<template>
  <div class="mapa-wrapper">
    <div v-if="mostrarBuscador" class="mapa-buscar">
      <form class="buscar-form" @submit.prevent="ejecutarBusqueda">
        <span class="buscar-icono" aria-hidden="true" />
        <input
          v-model="textoBusqueda"
          type="search"
          class="buscar-input"
          placeholder="Buscar municipio, sector o lugar…"
          autocomplete="off"
          aria-label="Buscar en el mapa"
          :disabled="buscando"
        />
        <button type="submit" class="buscar-btn" :disabled="buscando || !textoBusqueda.trim()">
          {{ buscando ? '…' : 'Ir' }}
        </button>
      </form>
      <p v-if="mensajeBusqueda" class="buscar-msg" :class="{ error: busquedaError }">{{ mensajeBusqueda }}</p>
    </div>
    <div ref="mapContainer" class="mapa-container"></div>
    <div v-if="loading" class="mapa-loading">Cargando mapa...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import { MAPA_CENTRO_CARABOBO, MAPA_ZOOM_DEFAULT, MAPA_BOUNDS_CARABOBO } from '../config/incidentes'
import { buscarLugarPhoton } from '../utils/geocodingPhoton.js'
import { colorGrupoExcel } from '../utils/clasificacionExcelIncidentes.js'

const props = defineProps({
  incidentes: {
    type: Array,
    default: function () {
      return []
    },
  },
  centro: {
    type: Object,
    default: function () {
      return MAPA_CENTRO_CARABOBO
    },
  },
  zoom: {
    type: Number,
    default: MAPA_ZOOM_DEFAULT,
  },
  permitirClick: {
    type: Boolean,
    default: false,
  },
  mostrarBuscador: {
    type: Boolean,
    default: false,
  },
  /** Al abrir, encuadra todo el estado Carabobo (mapa en vivo) */
  encuadrarEstadoCarabobo: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['ubicacion-seleccionada'])

const mapContainer = ref(null)
const loading = ref(true)
const textoBusqueda = ref('')
const buscando = ref(false)
const mensajeBusqueda = ref('')
const busquedaError = ref(false)

let map = null
let layerGroup = null
let capaMarcadorBusqueda = null

function crearIcono(incidente) {
  const color = colorGrupoExcel(incidente)
  const html =
    '<span style="background:' +
    color +
    ';width:24px;height:24px;border-radius:50%;display:block;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></span>'
  return L.divIcon({
    className: 'marker-incidente',
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function iconoBusqueda() {
  const html =
    '<span style="background:#2563eb;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:block;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></span>'
  return L.divIcon({
    className: 'marker-busqueda',
    html: html,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  })
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function quitarMarcadorBusqueda() {
  if (capaMarcadorBusqueda && map) {
    map.removeLayer(capaMarcadorBusqueda)
    capaMarcadorBusqueda = null
  }
}

function mostrarMarcadorBusqueda(lat, lng, titulo) {
  if (!map) return
  quitarMarcadorBusqueda()
  const m = L.marker([lat, lng], { icon: iconoBusqueda() })
  if (titulo) m.bindPopup(titulo)
  m.addTo(map)
  capaMarcadorBusqueda = m
}

async function ejecutarBusqueda() {
  const q = textoBusqueda.value.trim()
  if (!q || !map) return
  buscando.value = true
  busquedaError.value = false
  mensajeBusqueda.value = ''
  try {
    const r = await buscarLugarPhoton(q)
    if (!r) {
      busquedaError.value = true
      mensajeBusqueda.value = 'No se encontró el lugar. Pruebe otro nombre o más detalle.'
      return
    }
    if (r.bounds) {
      const b = L.latLngBounds(r.bounds)
      map.fitBounds(b, { maxZoom: 17, padding: [40, 40], animate: true, duration: 0.6 })
    } else {
      map.flyTo([r.lat, r.lng], r.zoom, { duration: 0.75 })
    }
    mostrarMarcadorBusqueda(r.lat, r.lng, '<strong>' + escHtml(r.label) + '</strong>')
    mensajeBusqueda.value = ''
    emit('ubicacion-seleccionada', { lat: r.lat, lng: r.lng, label: r.label || '' })
  } catch (e) {
    busquedaError.value = true
    mensajeBusqueda.value =
      e instanceof Error && e.message
        ? e.message
        : 'No se pudo buscar. Revise que el servidor (backend) esté en marcha e intente de nuevo.'
  } finally {
    buscando.value = false
  }
}

function actualizarMarcadores() {
  if (!map || !layerGroup) return
  layerGroup.clearLayers()
  const lista = props.incidentes
  for (let i = 0; i < lista.length; i++) {
    const inc = lista[i]
    if (inc.lat != null && inc.lng != null && Number.isFinite(Number(inc.lat)) && Number.isFinite(Number(inc.lng))) {
      const marker = L.marker([inc.lat, inc.lng], { icon: crearIcono(inc) })
      let fechaStr = '—'
      let horaStr = '—'
      if (inc.fecha) {
        const d = new Date(inc.fecha)
        fechaStr = d.toLocaleDateString('es-VE')
        horaStr = d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
      }
      let titulo = 'Incidente'
      if (inc.tipo_nombre) titulo = inc.tipo_nombre
      else if (inc.tipo) titulo = inc.tipo
      let popupHtml = '<strong>' + escHtml(titulo) + '</strong><br>'
      if (inc.descripcion) {
        popupHtml += escHtml(inc.descripcion) + '<br>'
      }
      popupHtml += 'Fecha: ' + fechaStr + '<br>'
      popupHtml += 'Hora de registro: ' + horaStr + '<br>'
      if (inc.municipio) {
        popupHtml += 'Municipio: ' + escHtml(inc.municipio)
      }
      if (inc.via) {
        popupHtml += '<br>Vía: ' + escHtml(inc.via)
      }
      marker.bindPopup(popupHtml)
      layerGroup.addLayer(marker)
    }
  }
}

onMounted(function () {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)
  layerGroup = L.layerGroup().addTo(map)

  if (props.permitirClick) {
    map.on('click', function (e) {
      emit('ubicacion-seleccionada', { lat: e.latlng.lat, lng: e.latlng.lng })
    })
  }

  nextTick(function () {
    if (!map) return
    if (props.encuadrarEstadoCarabobo) {
      const b = L.latLngBounds(MAPA_BOUNDS_CARABOBO)
      map.fitBounds(b, { padding: [28, 28], maxZoom: 10, animate: false })
    } else {
      map.setView([props.centro.lat, props.centro.lng], props.zoom)
    }
    map.invalidateSize()
    actualizarMarcadores()
    loading.value = false
  })
})

onUnmounted(function () {
  quitarMarcadorBusqueda()
  if (map) {
    map.remove()
    map = null
  }
})

watch(
  function () {
    return props.incidentes
  },
  actualizarMarcadores,
  { deep: true }
)
</script>

<style scoped>
.mapa-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}
.mapa-buscar {
  position: absolute;
  z-index: 1000;
  left: 50%;
  transform: translateX(-50%);
  top: 12px;
  width: min(420px, calc(100% - 24px));
  pointer-events: none;
}
.mapa-buscar * {
  pointer-events: auto;
}
.buscar-form {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}
.buscar-icono {
  flex-shrink: 0;
  width: 2.75rem;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3E%3C/svg%3E")
    center / 1.15rem no-repeat;
}
.buscar-input {
  flex: 1;
  border: none;
  padding: 0.55rem 0.35rem 0.55rem 0;
  font-size: 0.9rem;
  font-family: inherit;
  min-width: 0;
  outline: none;
}
.buscar-input::placeholder {
  color: #94a3b8;
}
.buscar-btn {
  flex-shrink: 0;
  border: none;
  padding: 0 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: #1d4ed8;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.buscar-btn:hover:not(:disabled) {
  background: #1e40af;
}
.buscar-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.buscar-msg {
  margin: 6px 16px 0;
  font-size: 0.78rem;
  text-align: center;
  color: #475569;
  text-shadow: 0 1px 2px #fff, 0 0 8px #fff;
}
.buscar-msg.error {
  color: #b91c1c;
}
.mapa-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.mapa-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  font-size: 0.9375rem;
  z-index: 500;
}
:deep(.marker-incidente),
:deep(.marker-busqueda) {
  background: transparent !important;
  border: none !important;
}
</style>
