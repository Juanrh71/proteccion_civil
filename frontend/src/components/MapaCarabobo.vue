<template>
  <div class="mapa-wrapper">
    <div ref="mapContainer" class="mapa-container"></div>
    <div v-if="loading" class="mapa-loading">Cargando mapa...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { MAPA_CENTRO_CARABOBO, MAPA_ZOOM_DEFAULT } from '../config/incidentes'

const props = defineProps({
  incidentes: {
    type: Array,
    default: () => [],
  },
  centro: {
    type: Object,
    default: () => MAPA_CENTRO_CARABOBO,
  },
  zoom: {
    type: Number,
    default: MAPA_ZOOM_DEFAULT,
  },
  permitirClick: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['ubicacion-seleccionada'])

const mapContainer = ref(null)
const loading = ref(true)
let map = null
let layerGroup = null

/** Colores por categoría (clasificación documento Protección Civil) */
function getIconColor(categoria) {
  const colores = {
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
  return colores[categoria] || '#64748b'
}

function crearIcono(incidente) {
  const color = getIconColor(incidente.categoria || 'otro')
  return L.divIcon({
    className: 'marker-incidente',
    html: `<span style="background:${color};width:24px;height:24px;border-radius:50%;display:block;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function actualizarMarcadores() {
  if (!map || !layerGroup) return
  layerGroup.clearLayers()
  props.incidentes.forEach((inc) => {
    if (inc.lat && inc.lng) {
      const marker = L.marker([inc.lat, inc.lng], { icon: crearIcono(inc) })
      const fecha = inc.fecha ? new Date(inc.fecha).toLocaleDateString('es-VE') : '—'
      marker.bindPopup(`
        <strong>${inc.tipo_nombre || inc.tipo || 'Incidente'}</strong><br>
        ${inc.descripcion ? inc.descripcion + '<br>' : ''}
        Fecha: ${fecha}<br>
        ${inc.municipio ? 'Municipio: ' + inc.municipio : ''}
      `)
      layerGroup.addLayer(marker)
    }
  })
}

onMounted(() => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView(
    [props.centro.lat, props.centro.lng],
    props.zoom
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)
  layerGroup = L.layerGroup().addTo(map)

  if (props.permitirClick) {
    map.on('click', (e) => {
      emit('ubicacion-seleccionada', { lat: e.latlng.lat, lng: e.latlng.lng })
    })
  }

  actualizarMarcadores()
  loading.value = false
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.incidentes, actualizarMarcadores, { deep: true })
</script>

<style scoped>
.mapa-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
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
}
:deep(.marker-incidente) {
  background: transparent !important;
  border: none !important;
}
</style>
