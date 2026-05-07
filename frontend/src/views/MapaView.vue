<template>
  <div class="mapa-view">
    <div class="mapa-head">
      <h1 class="page-title">Mapa en vivo</h1>
      <button
        v-if="esAdmin"
        type="button"
        class="btn-menu-admin"
        @click="irMenuAdmin"
      >
        Menú principal
      </button>
    </div>
    <div class="estado-bar card">
      <span class="activas">
        Emergencias activas: <strong>{{ incidentes.length }}</strong>
      </span>
      <span v-if="actualizando" class="polling">Actualizando…</span>
      <span v-else class="polling muted">Última actualización: {{ ultimaActualizacionTexto }}</span>
    </div>
    <p v-if="errorCarga" class="mapa-error" role="alert">{{ errorCarga }}</p>

    <div class="mapa-box card">
      <MapaCarabobo :incidentes="incidentes" mostrar-buscador encuadrar-estado-carabobo />
    </div>
    <div class="leyenda card">
      <h3>Leyenda del mapa</h3>
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
import { useRouter } from 'vue-router'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { obtenerIncidentes } from '../api/incidentes'
import { useCatalogoIncidentes } from '../composables/useCatalogoIncidentes.js'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuario } = useAuth()
const esAdmin = computed(() => usuario.value?.rol === 'admin')
const { leyendaMapa } = useCatalogoIncidentes()
const incidentes = ref([])
const actualizando = ref(false)
const ultimaActualizacion = ref(null)
const errorCarga = ref('')

const INTERVALO_MS = 8000
let intervalId = null

const ultimaActualizacionTexto = computed(() => {
  const u = ultimaActualizacion.value
  if (!u) return '—'
  return u.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const categoriasLeyenda = leyendaMapa

function irMenuAdmin() {
  router.push('/usuarios')
}

async function refrescar() {
  actualizando.value = true
  try {
    incidentes.value = await obtenerIncidentes({ soloAbiertos: true })
    errorCarga.value = ''
    ultimaActualizacion.value = new Date()
  } catch (e) {
    errorCarga.value = e?.message || 'No se pudo cargar el mapa.'
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
.mapa-error {
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #7f1d1d;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius, 6px);
}
.mapa-view {
  height: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  overflow: hidden;
}

.mapa-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.btn-menu-admin {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: var(--color-secondary);
  border-radius: var(--radius, 8px);
  padding: 0.45rem 0.8rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-menu-admin:hover {
  background: #eef2ff;
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
  border: 1px solid rgba(15, 23, 42, 0.28);
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
