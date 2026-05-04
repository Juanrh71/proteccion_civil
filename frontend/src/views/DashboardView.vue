<template>
  <div class="dashboard">
    <header class="dashboard-head">
      <h1 class="dashboard-title">Dashboard</h1>
      <p v-if="errorIncidentes" class="dash-error" role="alert">{{ errorIncidentes }}</p>
    </header>

    <section class="filters-bar dash-card">
      <div class="filter-field">
        <label class="filter-label">Período</label>
        <select v-model="vistaPeriodo" class="input filter-input">
          <option value="dia">Por día</option>
          <option value="mes">Por mes</option>
          <option value="año">Por año</option>
        </select>
      </div>
      <div v-if="vistaPeriodo === 'dia'" class="filter-field">
        <label class="filter-label">Día</label>
        <select v-model.number="periodoDia" class="input filter-input">
          <option v-for="n in diasDelPeriodo" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
      <div v-if="vistaPeriodo !== 'año'" class="filter-field">
        <label class="filter-label">Mes</label>
        <select v-model.number="periodoMes" class="input filter-input">
          <option v-for="(nombre, idx) in MESES" :key="idx" :value="idx + 1">{{ nombre }}</option>
        </select>
      </div>
      <div class="filter-field">
        <label class="filter-label">Año</label>
        <select v-model.number="periodoAnio" class="input filter-input">
          <option v-for="y in anos" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div class="filter-field">
        <label class="filter-label">Municipio</label>
        <select v-model="filtroMuniDash" class="input filter-input">
          <option value="">Todos</option>
          <option v-for="m in MUNICIPIOS_CARABOBO" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div class="filter-field">
        <label class="filter-label">Categoría</label>
        <select v-model="filtroCatDash" class="input filter-input">
          <option value="">Todas</option>
          <option v-for="c in categoriasOpciones" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>
    </section>

    <section class="grid-main">
      <div class="dash-card chart-panel chart-wide">
        <h2 class="chart-title">Incidentes en el tiempo</h2>
        <div
          class="chart-box chart-box-tall"
          :class="{ 'chart-box-dia-natural': vistaPeriodo === 'dia' }"
        >
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>
      <div class="dash-card dashboard-kpis">
        <div class="kpi-item">
          <span class="kpi-label">Heridos (periodo)</span>
          <strong class="kpi-value">{{ totalHeridosPeriodo }}</strong>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">Fallecidos (periodo)</span>
          <strong class="kpi-value">{{ totalFallecidosPeriodo }}</strong>
        </div>
      </div>
    </section>

    <section class="grid-charts">
      <div class="chart-toolbar dash-card">
        <div class="chart-toolbar-actions">
          <button
            type="button"
            class="btn btn-primary btn-refrescar"
            :disabled="refrescando"
            @click="refrescarDatos"
          >
            {{ refrescando ? 'Actualizando…' : 'Refrescar' }}
          </button>
          <p v-if="ultimaActualizacionTexto" class="ultima-actualizacion">
            Última actualización: {{ ultimaActualizacionTexto }}
          </p>
        </div>
      </div>
      <div class="dash-card chart-panel">
        <h2 class="chart-title">Por municipio</h2>
        <div class="chart-box">
          <Bar v-if="tieneBarrasMuni" :data="muniBarData" :options="barHorizontalOptions" />
          <p v-else class="chart-empty">Sin datos para el periodo y filtros seleccionados.</p>
        </div>
      </div>
      <div class="dash-card chart-panel">
        <h2 class="chart-title">Por tipo de incidente (en proceso)</h2>
        <div class="chart-box">
          <Doughnut v-if="tieneTortaTipo" :data="tipoPieData" :options="tipoPieOptions" />
          <p v-else class="chart-empty">No hay incidentes en proceso en el periodo y filtros actuales.</p>
        </div>
      </div>
    </section>

    <section class="dash-card map-section">
      <h2 class="chart-title">Mapa</h2>
      <div class="map-toolbar">
        <label class="filter-label">Día</label>
        <div class="fecha-selects">
          <select v-model.number="filtroDia" class="input">
            <option v-for="n in diasDelMes" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="fecha-sep">/</span>
          <select v-model.number="filtroMes" class="input">
            <option v-for="(nombre, idx) in MESES" :key="idx" :value="idx + 1">{{ nombre }}</option>
          </select>
          <span class="fecha-sep">/</span>
          <select v-model.number="filtroAno" class="input">
            <option v-for="y in anos" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
      <div class="map-box">
        <MapaCarabobo :incidentes="incidentesFiltradosMapa" mostrar-buscador encuadrar-estado-carabobo />
      </div>
      <div class="leyenda-mapa">
        <span v-for="cat in categoriasLeyendaMapa" :key="cat.id" class="leyenda-item">
          <i :style="{ background: cat.color }"></i>
          {{ cat.nombre }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { obtenerIncidentes } from '../api/incidentes'
import {
  RANGO_ANO_INICIO,
  RANGO_ANO_FIN,
  añoSugeridoParaIncidentes,
  MUNICIPIOS_CARABOBO,
} from '../config/incidentes'
import {
  grupoExcelDeIncidente,
  colorGrupoExcel,
  LEYENDA_GRUPOS_EXCEL,
} from '../utils/clasificacionExcelIncidentes.js'
import { useCatalogoIncidentes } from '../composables/useCatalogoIncidentes.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const COLOR_FILL = 'rgba(128, 0, 0, 0.2)'
const COLOR_LINE = '#800000'
const COLOR_BAR_MAIN = 'rgba(0, 51, 204, 0.85)'

const { leyendaCategorias: leyendaCatDash, leyendaMapa: leyendaMapaDash } = useCatalogoIncidentes()
const categoriasOpciones = computed(() => {
  const L = leyendaCatDash.value
  if (L && L.length) return L.map((c) => ({ id: c.id, nombre: c.nombre }))
  return LEYENDA_GRUPOS_EXCEL.map((c) => ({ id: c.id, nombre: c.nombre }))
})

const incidentes = ref([])
const errorIncidentes = ref('')
const refrescando = ref(false)
const ultimaActualizacion = ref(null)
const vistaPeriodo = ref('mes')
const periodoDia = ref(new Date().getDate())
const periodoMes = ref(new Date().getMonth() + 1)
const periodoAnio = ref(añoSugeridoParaIncidentes())
const filtroMuniDash = ref('')
const filtroCatDash = ref('')

const filtroDia = ref(new Date().getDate())
const filtroMes = ref(new Date().getMonth() + 1)
const filtroAno = ref(añoSugeridoParaIncidentes())
let pollingIncidentes = null

const anos = computed(() => {
  const list = []
  for (let y = RANGO_ANO_INICIO; y <= RANGO_ANO_FIN; y++) list.push(y)
  return list
})

const diasDelMes = computed(() => {
  const mes = filtroMes.value || 1
  const ano = filtroAno.value || RANGO_ANO_INICIO
  const ultimo = new Date(ano, mes, 0).getDate()
  const list = []
  for (let d = 1; d <= ultimo; d++) list.push(d)
  return list
})

watch(
  () => [filtroMes.value, filtroAno.value],
  () => {
    const maxDia = diasDelMes.value.length
    if (filtroDia.value > maxDia) filtroDia.value = maxDia
  }
)

const diasDelPeriodo = computed(() => {
  const mes = periodoMes.value || 1
  const ano = periodoAnio.value || RANGO_ANO_INICIO
  const ultimo = new Date(ano, mes, 0).getDate()
  const list = []
  for (let d = 1; d <= ultimo; d++) list.push(d)
  return list
})

watch(
  () => [periodoMes.value, periodoAnio.value],
  () => {
    const maxDia = diasDelPeriodo.value.length
    if (periodoDia.value > maxDia) periodoDia.value = maxDia
  }
)

watch(
  () => [vistaPeriodo.value, periodoDia.value, periodoMes.value, periodoAnio.value],
  () => {
    if (vistaPeriodo.value === 'dia') {
      filtroDia.value = periodoDia.value
      filtroMes.value = periodoMes.value
      filtroAno.value = periodoAnio.value
    }
  },
  { immediate: true }
)

function parseFechaInc(inc) {
  if (!inc?.fecha) return null
  const d = new Date(inc.fecha)
  return Number.isNaN(d.getTime()) ? null : d
}

function incEnMes(inc, y, m) {
  const d = parseFechaInc(inc)
  return d != null && d.getFullYear() === y && d.getMonth() + 1 === m
}

function incEnDia(inc, y, m, day) {
  const d = parseFechaInc(inc)
  return (
    d != null &&
    d.getFullYear() === y &&
    d.getMonth() + 1 === m &&
    d.getDate() === day
  )
}

function incEnAno(inc, y) {
  const d = parseFechaInc(inc)
  return d != null && d.getFullYear() === y
}

function etiquetaHoraDiaNatural(h) {
  const d = new Date(2000, 0, 1, h, 0, 0)
  return d.toLocaleTimeString('es-VE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const incidentesFiltradosCapa = computed(() => {
  let list = incidentes.value
  if (filtroMuniDash.value) {
    list = list.filter((inc) => inc.municipio === filtroMuniDash.value)
  }
  if (filtroCatDash.value) {
    list = list.filter((inc) => grupoExcelDeIncidente(inc) === filtroCatDash.value)
  }
  return list
})

const incidentesEnPeriodo = computed(() => {
  const list = incidentesFiltradosCapa.value
  const y = periodoAnio.value
  const m = periodoMes.value
  if (vistaPeriodo.value === 'mes') {
    return list.filter((inc) => incEnMes(inc, y, m))
  }
  if (vistaPeriodo.value === 'dia') {
    return list.filter((inc) => incEnDia(inc, y, m, periodoDia.value))
  }
  return list.filter((inc) => incEnAno(inc, periodoAnio.value))
})

/** Solo "en proceso" (mismos periodo y filtros que el resto del tablero). */
const incidentesEnProcesoEnPeriodo = computed(() =>
  incidentesEnPeriodo.value.filter((inc) => inc && inc.estado === 'en_proceso')
)

function valorConteoAfectados(inc, campoBase, campoCierre) {
  const cierre = Number(inc?.[campoCierre])
  if (Number.isFinite(cierre) && cierre >= 0) return cierre
  const base = Number(inc?.[campoBase])
  if (Number.isFinite(base) && base >= 0) return base
  return 0
}

const totalHeridosPeriodo = computed(() => {
  let n = 0
  for (const inc of incidentesEnPeriodo.value) {
    n += valorConteoAfectados(inc, 'heridos', 'heridos_cierre')
  }
  return n
})

const totalFallecidosPeriodo = computed(() => {
  let n = 0
  for (const inc of incidentesEnPeriodo.value) {
    n += valorConteoAfectados(inc, 'fallecidos', 'fallecidos_cierre')
  }
  return n
})

const lineChartData = computed(() => {
  if (vistaPeriodo.value === 'dia') {
    const labels = []
    const data = Array(24).fill(0)
    for (let h = 0; h < 24; h++) {
      labels.push(etiquetaHoraDiaNatural(h))
    }
    for (const inc of incidentesEnPeriodo.value) {
      const dt = parseFechaInc(inc)
      if (dt) data[dt.getHours()] += 1
    }
    return {
      labels,
      datasets: [
        {
          label: 'Incidentes',
          data,
          borderColor: COLOR_LINE,
          backgroundColor: COLOR_FILL,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          clip: false,
        },
      ],
    }
  }

  if (vistaPeriodo.value === 'mes') {
    const y = periodoAnio.value
    const m = periodoMes.value
    const ultimo = new Date(y, m, 0).getDate()
    const labels = []
    const data = []
    for (let d = 1; d <= ultimo; d++) {
      labels.push(String(d))
      data.push(0)
    }
    for (const inc of incidentesEnPeriodo.value) {
      const dt = parseFechaInc(inc)
      if (dt && dt.getMonth() + 1 === m && dt.getFullYear() === y) {
        const day = dt.getDate()
        if (day >= 1 && day <= ultimo) data[day - 1] += 1
      }
    }
    return {
      labels,
      datasets: [
        {
          label: 'Incidentes',
          data,
          borderColor: COLOR_LINE,
          backgroundColor: COLOR_FILL,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    }
  }

  const labels = MESES.map((mes) => mes.slice(0, 3))
  const data = Array(12).fill(0)
  const y = periodoAnio.value
  for (const inc of incidentesEnPeriodo.value) {
    const dt = parseFechaInc(inc)
    if (dt && dt.getFullYear() === y) {
      data[dt.getMonth()] += 1
    }
  }
  return {
    labels,
    datasets: [
      {
        label: 'Incidentes',
        data,
        borderColor: COLOR_LINE,
        backgroundColor: COLOR_FILL,
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  }
})

const lineChartOptions = computed(() => {
  const esDiaNatural = vistaPeriodo.value === 'dia'
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: esDiaNatural
        ? { left: 10, right: 14, top: 10, bottom: 28 }
        : {},
    },
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        offset: esDiaNatural,
        grid: {
          color: 'rgba(226, 232, 240, 0.9)',
          tickLength: esDiaNatural ? 6 : undefined,
        },
        ticks: esDiaNatural
          ? {
              autoSkip: false,
              autoSkipPadding: 0,
              maxRotation: 52,
              minRotation: 52,
              font: { size: 9 },
              padding: 6,
            }
          : {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: vistaPeriodo.value === 'mes' ? 16 : 12,
            },
      },
      y: {
        beginAtZero: true,
        grace: esDiaNatural ? '10%' : undefined,
        ticks: { precision: 0 },
        grid: { color: 'rgba(226, 232, 240, 0.9)' },
      },
    },
  }
})

function contarPorClave(list, getKey) {
  const map = {}
  for (const inc of list) {
    const k = getKey(inc)
    map[k] = (map[k] || 0) + 1
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

const muniBarData = computed(() => {
  const top = contarPorClave(incidentesEnPeriodo.value, (inc) => inc.municipio || 'Sin municipio').slice(
    0,
    10
  )
  return {
    labels: top.map((e) => e[0]),
    datasets: [
      {
        label: 'Incidentes',
        data: top.map((e) => e[1]),
        backgroundColor: COLOR_BAR_MAIN,
        borderRadius: 6,
      },
    ],
  }
})

const tipoPieData = computed(() => {
  const base = incidentesEnProcesoEnPeriodo.value
  const top = contarPorClave(base, (inc) => inc.tipo_nombre || inc.tipo || 'Otro').slice(0, 12)
  const colores = []
  for (const [label] of top) {
    const incMatch = base.find((inc) => (inc.tipo_nombre || inc.tipo || 'Otro') === label)
    colores.push(colorGrupoExcel(incMatch))
  }
  return {
    labels: top.map((e) => (e[0].length > 38 ? e[0].slice(0, 36) + '…' : e[0])),
    datasets: [
      {
        label: 'Tipos',
        data: top.map((e) => e[1]),
        backgroundColor: colores,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }
})

const barHorizontalOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
    y: { grid: { display: false } },
  },
}

const tipoPieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '40%',
  plugins: {
    legend: {
      position: 'right',
      labels: { boxWidth: 12, font: { size: 11 } },
    },
  },
}

const tieneBarrasMuni = computed(() => muniBarData.value.datasets[0].data.some((n) => n > 0))
const tieneTortaTipo = computed(() => tipoPieData.value.datasets[0].data.some((n) => n > 0))

const incidentesFiltradosMapa = computed(() => {
  const list = incidentes.value
  const dia = filtroDia.value
  const mes = filtroMes.value
  const ano = filtroAno.value
  return list.filter((inc) => {
    if (!inc.fecha) return false
    const d = new Date(inc.fecha)
    return d.getDate() === dia && d.getMonth() + 1 === mes && d.getFullYear() === ano
  })
})

const categoriasLeyendaMapa = leyendaMapaDash

const ultimaActualizacionTexto = computed(() => {
  const u = ultimaActualizacion.value
  if (!u) return ''
  return u.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

async function refrescarDatos() {
  if (refrescando.value) return
  refrescando.value = true
  try {
    incidentes.value = await obtenerIncidentes()
    ultimaActualizacion.value = new Date()
    errorIncidentes.value = ''
  } catch (e) {
    errorIncidentes.value = e?.message || 'Error al actualizar incidentes.'
  } finally {
    refrescando.value = false
  }
}

onMounted(async () => {
  try {
    incidentes.value = await obtenerIncidentes()
    errorIncidentes.value = ''
    ultimaActualizacion.value = new Date()
  } catch (e) {
    errorIncidentes.value = e?.message || 'No se pudieron cargar los incidentes para el tablero.'
  }
  pollingIncidentes = setInterval(async () => {
    try {
      incidentes.value = await obtenerIncidentes()
      errorIncidentes.value = ''
      ultimaActualizacion.value = new Date()
    } catch (e) {
      errorIncidentes.value = e?.message || 'Error al actualizar incidentes.'
    }
  }, 60000)
})

onUnmounted(() => {
  if (pollingIncidentes != null) {
    clearInterval(pollingIncidentes)
    pollingIncidentes = null
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.dashboard-head {
  margin-bottom: 1.25rem;
}

.dashboard-sub {
  margin: 0.4rem 0 0;
  max-width: 42rem;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.chart-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
  padding: 0.9rem 1.2rem 1rem;
  margin: 0;
  grid-column: 1 / -1;
}

.chart-toolbar-hint {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--color-text-muted);
  max-width: 26rem;
}

.chart-toolbar-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
}

.btn-refrescar {
  min-height: 2.75rem;
  min-width: 8.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.ultima-actualizacion {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.dash-error {
  margin: 0.5rem 0 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #7f1d1d;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  max-width: 42rem;
}
.dashboard-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--color-secondary);
  letter-spacing: -0.02em;
  margin: 0;
}

.dash-card {
  background: var(--color-surface-card, #fff);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(0, 51, 204, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.85);
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.25rem;
  align-items: flex-end;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.filter-input {
  min-width: 10rem;
}

.grid-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: stretch;
}

.chart-wide {
  min-height: 0;
}

.chart-panel {
  padding: 1.15rem 1.25rem 1.35rem;
}

.dashboard-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.kpi-item {
  border: 1px solid #dbe6f2;
  border-radius: 10px;
  background: #f8fbff;
  padding: 0.7rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.kpi-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.kpi-value {
  font-size: 1.35rem;
  color: var(--color-secondary);
  line-height: 1.1;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 0.85rem;
}

.chart-box {
  position: relative;
  height: 280px;
}

.chart-box-tall {
  height: 360px;
}

.chart-box-dia-natural {
  height: 460px;
  min-height: 420px;
  overflow: visible;
  padding-bottom: 0.25rem;
}

.chart-empty {
  margin: 0;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.grid-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.map-section {
  padding: 1.15rem 1.25rem 1.25rem;
}

.map-toolbar {
  margin-bottom: 0.85rem;
}

.map-toolbar .filter-label {
  margin-bottom: 0.35rem;
  display: block;
}

.map-box {
  padding: 0;
  overflow: hidden;
  height: 420px;
  border-radius: var(--radius);
  border: 1px solid #e2e8f0;
}

.fecha-selects {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.fecha-selects .input {
  width: auto;
  min-width: 4.5rem;
  padding: 0.5rem 0.4rem;
}

.fecha-sep {
  color: var(--color-text-muted);
  font-weight: 600;
}

.leyenda-mapa {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.35rem 0.9rem;
  margin-top: 0.75rem;
  font-size: 0.79rem;
  color: var(--color-text-muted);
  max-height: 170px;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.leyenda-mapa .leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  line-height: 1.25;
  white-space: normal;
}

.leyenda-mapa .leyenda-item i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.28);
  display: inline-block;
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .leyenda-mapa {
    grid-template-columns: 1fr 1fr;
    max-height: none;
  }
}

@media (max-width: 560px) {
  .leyenda-mapa {
    grid-template-columns: 1fr;
  }
}
</style>
