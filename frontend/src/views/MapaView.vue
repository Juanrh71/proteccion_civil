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
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { obtenerIncidentes } from '../api/incidentes'

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
  gap: 0.75rem;
  overflow: hidden;
}
.estado-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.25rem;
  padding: 0.875rem 1rem;
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
  padding: 0.5rem;
  overflow: hidden;
  flex: 1;
  min-height: 320px;
  max-height: 520px;
  border-radius: 14px;
}
.mapa-box :deep(.mapa-wrapper),
.mapa-box :deep(.mapa-container) {
  height: 100%;
  border-radius: 10px;
}
.leyenda {
  padding: 0.875rem 1rem;
}
.leyenda h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-secondary);
}
.leyenda-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.875rem;
}
.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
.leyenda-item i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
}

@media (max-width: 900px) {
  .mapa-view {
    max-width: 100%;
  }
  .mapa-box {
    padding: 0.35rem;
    max-height: none;
  }
}
</style>
