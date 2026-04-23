<template>
  <div class="mapa-view">
    <h1 class="page-title">Mapa en vivo</h1>
    <div class="estado-bar card">
      <span class="activas">
        Emergencias activas: <strong>{{ incidentes.length }}</strong>
      </span>
      <span v-if="actualizando" class="polling">Actualizando…</span>
      <span v-else class="polling muted">Última actualización: {{ ultimaActualizacionTexto }}</span>
    </div>

    <div class="mapa-box card">
      <MapaCarabobo :incidentes="incidentes" mostrar-buscador />
    </div>
    <div class="leyenda card">
      <h3>Leyenda por categoría</h3>
      <div class="leyenda-items">
        <span v-for="cat in categoriasLeyenda" :key="cat.id" class="leyenda-item">
          <i :style="{ background: cat.color }" />
          {{ cat.nombre }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { obtenerIncidentes } from '../api/incidentes'
import { LEYENDA_GRUPOS_EXCEL } from '../utils/clasificacionExcelIncidentes.js'

const incidentes = ref([])
const actualizando = ref(false)
const ultimaActualizacion = ref(null)

const INTERVALO_MS = 8000
let intervalId = null

const ultimaActualizacionTexto = computed(() => {
  const u = ultimaActualizacion.value
  if (!u) return '—'
  return u.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const categoriasLeyenda = computed(() => LEYENDA_GRUPOS_EXCEL)

async function refrescar() {
  actualizando.value = true
  try {
    incidentes.value = await obtenerIncidentes({ soloAbiertos: true })
    ultimaActualizacion.value = new Date()
  } finally {
    actualizando.value = false
  }
}

onMounted(async () => {
  await refrescar()
  intervalId = setInterval(refrescar, INTERVALO_MS)
})

onUnmounted(() => {
  if (intervalId != null) {
    clearInterval(intervalId)
    intervalId = null
  }
})
</script>

<style scoped>
.mapa-view {
  height: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  overflow: hidden;
}
.estado-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.25rem;
  padding: 0.7rem 0.9rem;
}
.activas {
  font-size: 0.9375rem;
  color: var(--color-text);
}
.polling {
  font-size: 0.8125rem;
  color: var(--color-secondary);
}
.polling.muted {
  color: var(--color-text-muted);
}
.mapa-box {
  padding: 0.4rem;
  overflow: hidden;
  flex: 1;
  min-height: 260px;
  max-height: 430px;
  border-radius: 14px;
}
.mapa-box :deep(.mapa-wrapper),
.mapa-box :deep(.mapa-container) {
  height: 100%;
  border-radius: 10px;
}
.leyenda {
  padding: 0.65rem 0.85rem;
}
.leyenda h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.45rem;
  color: var(--color-secondary);
}
.leyenda-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.35rem 0.85rem;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 0.2rem;
}
.leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.79rem;
  color: var(--color-text-muted);
  line-height: 1.28;
  white-space: normal;
}
.leyenda-item i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .mapa-view {
    max-width: 100%;
  }
  .mapa-box {
    padding: 0.35rem;
    max-height: 360px;
  }
  .leyenda-items {
    grid-template-columns: 1fr 1fr;
    max-height: none;
  }
}

@media (max-width: 620px) {
  .leyenda-items {
    grid-template-columns: 1fr;
  }
}
</style>
