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
        Emergencias visibles: <strong>{{ incidentesFiltrados.length }}</strong>
        <small v-if="hayFiltros">de {{ incidentes.length }}</small>
        <span v-if="reportesEdanFiltrados.length" class="edan-count">
          · EDAN: <strong>{{ reportesEdanFiltrados.length }}</strong>
        </span>
      </span>
      <span v-if="actualizando" class="polling">Actualizando…</span>
      <span v-else class="polling muted">Última actualización: {{ ultimaActualizacionTexto }}</span>
    </div>
    <p v-if="errorCarga" class="mapa-error" role="alert">{{ errorCarga }}</p>

    <div class="filtros-mapa card" aria-label="Filtros del mapa en vivo">
      <div class="filtro-busqueda">
        <label>Buscar por categoría</label>
        <div class="filtro-input-wrap">
          <span class="filtro-lupa" aria-hidden="true"></span>
          <input
            v-model="filtroCategoria"
            type="search"
            class="input filtro-input"
            list="categorias-mapa"
            autocomplete="off"
          />
        </div>
        <datalist id="categorias-mapa">
          <option v-for="cat in categoriasBusqueda" :key="cat.id" :value="cat.nombre" />
        </datalist>
      </div>
      <div class="filtro-busqueda">
        <label>Buscar por región</label>
        <div class="filtro-input-wrap">
          <span class="filtro-lupa" aria-hidden="true"></span>
          <input
            v-model="filtroRegion"
            type="search"
            class="input filtro-input"
            list="regiones-mapa"
            autocomplete="off"
          />
        </div>
        <datalist id="regiones-mapa">
          <option v-for="region in regionesBusqueda" :key="region" :value="region" />
        </datalist>
      </div>
      <button
        v-if="hayFiltros"
        type="button"
        class="btn-limpiar-filtros"
        @click="limpiarFiltros"
      >
        Limpiar filtros
      </button>
    </div>

    <div class="mapa-box card">
      <MapaCarabobo
        :incidentes="incidentesFiltrados"
        :reportes-edan="reportesEdanFiltrados"
        mostrar-buscador
        encuadrar-estado-carabobo
      />
    </div>
    <div class="leyenda card">
      <h3>Leyenda del mapa</h3>
      <div class="leyenda-items">
        <span class="leyenda-item leyenda-item--edan">
          <i class="leyenda-edan" />
          Reporte EDAN (7 días)
        </span>
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
import { listarEdanMapaVivo } from '../api/edan.js'
import { useCatalogoIncidentes } from '../composables/useCatalogoIncidentes.js'
import { useAuth } from '../composables/useAuth'
import { MUNICIPIOS_CARABOBO } from '../config/incidentes.js'
import { grupoExcelDeIncidente, nombreGrupoExcel } from '../utils/clasificacionExcelIncidentes.js'

const router = useRouter()
const { usuario } = useAuth()
const esAdmin = computed(() => usuario.value?.rol === 'admin')
const { leyendaMapa } = useCatalogoIncidentes()
const incidentes = ref([])
const reportesEdan = ref([])
const filtroCategoria = ref('')
const filtroRegion = ref('')
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
const categoriasBusqueda = computed(() => categoriasLeyenda.value || [])
const regionesBusqueda = computed(() => {
  const set = new Set(MUNICIPIOS_CARABOBO)
  for (const inc of incidentes.value) {
    if (inc?.municipio) set.add(inc.municipio)
    if (inc?.parroquia) set.add(inc.parroquia)
  }
  for (const rep of reportesEdan.value) {
    if (rep?.municipio) set.add(rep.municipio)
    if (rep?.parroquia) set.add(rep.parroquia)
    if (rep?.sector) set.add(rep.sector)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
})
const hayFiltros = computed(() => !!filtroCategoria.value.trim() || !!filtroRegion.value.trim())

function normalizarBusqueda(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function coincideCategoria(inc, texto) {
  const q = normalizarBusqueda(texto)
  if (!q) return true
  const grupo = grupoExcelDeIncidente(inc)
  const nombreGrupo = nombreGrupoExcel(inc)
  const campos = [
    grupo,
    nombreGrupo,
    inc?.categoria,
    inc?.tipo,
    inc?.tipo_nombre,
  ]
  return campos.some((campo) => normalizarBusqueda(campo).includes(q))
}

function coincideRegion(inc, texto) {
  const q = normalizarBusqueda(texto)
  if (!q) return true
  const campos = [inc?.municipio, inc?.parroquia, inc?.via]
  return campos.some((campo) => normalizarBusqueda(campo).includes(q))
}

function coincideRegionEdan(rep, texto) {
  const q = normalizarBusqueda(texto)
  if (!q) return true
  const campos = [rep?.municipio, rep?.parroquia, rep?.sector, rep?.direccion]
  return campos.some((campo) => normalizarBusqueda(campo).includes(q))
}

const incidentesFiltrados = computed(() =>
  incidentes.value.filter(
    (inc) => coincideCategoria(inc, filtroCategoria.value) && coincideRegion(inc, filtroRegion.value)
  )
)

const reportesEdanFiltrados = computed(() =>
  reportesEdan.value.filter((rep) => coincideRegionEdan(rep, filtroRegion.value))
)

function limpiarFiltros() {
  filtroCategoria.value = ''
  filtroRegion.value = ''
}

function irMenuAdmin() {
  router.push('/usuarios')
}

async function refrescar() {
  actualizando.value = true
  try {
    const [incData, edanData] = await Promise.all([
      obtenerIncidentes({ soloAbiertos: true }),
      listarEdanMapaVivo(),
    ])
    incidentes.value = incData
    reportesEdan.value = edanData
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
  gap: 0.38rem;
  overflow: hidden;
}

.mapa-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.mapa-head .page-title {
  margin-bottom: 0;
  font-size: 1.55rem;
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
  padding: 0.42rem 0.7rem;
}
.activas {
  font-size: 0.9375rem;
  color: var(--color-text);
}
.activas small {
  margin-left: 0.25rem;
  color: var(--color-text-muted);
  font-weight: 500;
}
.edan-count {
  margin-left: 0.35rem;
  color: #be185d;
  font-weight: 600;
}
.edan-count strong {
  color: #be185d;
}
.polling {
  font-size: 0.8125rem;
  color: var(--color-secondary);
}
.polling.muted {
  color: var(--color-text-muted);
}
.filtros-mapa {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.55rem;
  padding: 0.48rem 0.65rem;
}
.filtro-busqueda {
  min-width: 0;
}
.filtro-busqueda label {
  display: block;
  margin-bottom: 0.16rem;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-secondary);
}
.filtro-input-wrap {
  position: relative;
}
.filtro-lupa {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  width: 0.78rem;
  height: 0.78rem;
  border: 2px solid #64748b;
  border-radius: 999px;
  transform: translateY(-55%);
  pointer-events: none;
}
.filtro-lupa::after {
  content: '';
  position: absolute;
  width: 0.45rem;
  height: 2px;
  right: -0.35rem;
  bottom: -0.18rem;
  background: #64748b;
  transform: rotate(45deg);
  border-radius: 999px;
}
.filtro-input {
  width: 100%;
  padding: 0.42rem 0.65rem 0.42rem 1.85rem;
  min-height: 2.05rem;
  font-size: 0.88rem;
}
.btn-limpiar-filtros {
  min-height: 2.05rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: var(--color-secondary);
  border-radius: var(--radius, 8px);
  padding: 0.36rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.btn-limpiar-filtros:hover {
  background: #eef2ff;
}
.mapa-box {
  padding: 0.32rem;
  overflow: hidden;
  flex: 1;
  min-height: 250px;
  max-height: none;
  border-radius: 14px;
}
.mapa-box :deep(.mapa-wrapper),
.mapa-box :deep(.mapa-container) {
  height: 100%;
  border-radius: 10px;
}
.leyenda {
  padding: 0.48rem 0.65rem;
  flex: 0 0 auto;
}
.leyenda h3 {
  font-size: 0.86rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--color-secondary);
}
.leyenda-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.24rem 0.65rem;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 0.2rem;
}
.leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.74rem;
  color: var(--color-text-muted);
  line-height: 1.18;
  white-space: normal;
}
.leyenda-item i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.28);
  display: inline-block;
  flex-shrink: 0;
}
.leyenda-edan {
  background: #ff69b4;
  border-color: #fff !important;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.2);
}
.leyenda-item--edan {
  font-weight: 600;
  color: #be185d;
}

@media (max-width: 900px) {
  .mapa-view {
    max-width: 100%;
  }
  .filtros-mapa {
    grid-template-columns: 1fr;
    gap: 0.55rem;
  }
  .btn-limpiar-filtros {
    width: 100%;
  }
  .mapa-box {
    padding: 0.28rem;
  }
  .leyenda-items {
    grid-template-columns: 1fr 1fr;
    max-height: 110px;
  }
}

@media (max-width: 620px) {
  .leyenda-items {
    grid-template-columns: 1fr;
  }
}
</style>
