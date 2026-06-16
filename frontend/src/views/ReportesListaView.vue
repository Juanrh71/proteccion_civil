<template>
  <div class="reportes-lista-view">
    <div class="titulo-acciones">
      <h1 class="page-title">Reportes</h1>
      <button
        v-if="esAdmin"
        type="button"
        class="btn btn-secondary"
        @click="irMenuAdmin"
      >
        Menú principal
      </button>
    </div>
    <p v-if="errorCarga" class="reportes-error" role="alert">{{ errorCarga }}</p>

    <section class="menu-reportes card">
      <button
        type="button"
        class="menu-btn"
        :class="{ activo: vistaReportes === 'diarios' }"
        @click="vistaReportes = 'diarios'"
      >
        Reportes diarios
      </button>
      <button
        type="button"
        class="menu-btn"
        :class="{ activo: vistaReportes === 'historico' }"
        @click="vistaReportes = 'historico'"
      >
        Comparativa histórica
      </button>
      <button
        type="button"
        class="menu-btn"
        :class="{ activo: vistaReportes === 'indicadores' }"
        @click="vistaReportes = 'indicadores'"
      >
        Indicadores de gestión
      </button>
      <button
        type="button"
        class="menu-btn"
        :class="{ activo: vistaReportes === 'semanal' }"
        @click="vistaReportes = 'semanal'"
      >
        Reporte semanal
      </button>
    </section>

    <template v-if="vistaReportes === 'diarios'">
      <div class="titulo-acciones secundarios">
        <button type="button" class="btn btn-secondary" :disabled="descargandoPdf || lista.length === 0" @click="descargarPdf">
          {{ descargandoPdf ? 'Generando PDF…' : 'Descargar PDF' }}
        </button>
      </div>

      <section class="filtros-fecha card">
        <div class="filtros-row">
          <div class="form-group">
            <label>Día</label>
            <select v-model.number="filtroDia" class="input">
              <option v-for="n in diasDelMes" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mes</label>
            <select v-model.number="filtroMes" class="input">
              <option v-for="(nombre, idx) in MESES" :key="idx" :value="idx + 1">{{ nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Año</label>
            <select v-model.number="filtroAno" class="input">
              <option v-for="y in anos" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
        <p class="filtro-resumen">{{ etiquetaFechaSeleccionada }} · {{ lista.length }} incidente(s)</p>
      </section>

      <div class="card tabla-card">
        <div v-if="lista.length === 0" class="lista-vacio">
          <p class="lista-vacio-texto">No hay incidentes registrados para esta fecha.</p>
          <button
            v-if="fechaUltimoIncidente"
            type="button"
            class="btn btn-secondary lista-vacio-btn"
            @click="irAFechaUltimoIncidente"
          >
            Ver reportes más recientes ({{ etiquetaFechaUltimoIncidente }})
          </button>
        </div>
        <div v-else class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th title="Número de reporte (ID del sistema)">N°</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Municipio</th>
                <th>Parroquia</th>
                <th>Calle / Avenida</th>
                <th>Estado</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inc in lista" :key="inc.id">
                <td>{{ inc.id != null ? inc.id : '—' }}</td>
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
                <td>
                  <button
                    v-if="textoEstadoListado(inc) === 'Cerrado'"
                    type="button"
                    class="btn-resultado-tabla"
                    @click="abrirModalVerResultado(inc)"
                  >
                    Resultado
                  </button>
                  <span v-else class="celda-sin-resultado">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-else-if="vistaReportes === 'historico'">
      <section class="filtros-fecha card">
        <div class="filtros-row">
          <div class="form-group">
            <label>Modo de comparación</label>
            <select v-model="modoComparativa" class="input">
              <option value="meses">Comparar meses</option>
              <option value="anios">Comparar años</option>
            </select>
          </div>

          <div v-if="modoComparativa === 'meses'" class="form-group">
            <label>Año base</label>
            <select v-model.number="anioComparativa" class="input">
              <option v-for="y in aniosDisponiblesComparativa" :key="`m-${y}`" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
        <div v-if="modoComparativa === 'meses'" class="selector-grid">
          <label v-for="(mes, idx) in MESES" :key="mes" class="selector-item">
            <input type="checkbox" :checked="mesesSeleccionados.includes(idx + 1)" @change="toggleMesComparativa(idx + 1)" />
            <span>{{ mes }}</span>
          </label>
        </div>
        <div v-else class="selector-grid">
          <label v-for="y in aniosDisponiblesComparativa" :key="`a-${y}`" class="selector-item">
            <input type="checkbox" :checked="aniosSeleccionados.includes(y)" @change="toggleAnioComparativa(y)" />
            <span>{{ y }}</span>
          </label>
        </div>

        <div class="acciones-historico">
          <button type="button" class="btn btn-secondary" :disabled="descargandoPdfHistorico" @click="descargarPdfHistorico">
            {{ descargandoPdfHistorico ? 'Generando PDF…' : 'Descargar PDF comparativa' }}
          </button>
        </div>
      </section>

      <section class="card comparativa-viz-card">
        <h2 class="comparativa-viz-titulo">{{ tituloGraficoComparativa }}</h2>
        <p v-if="!comparativaChartData" class="comparativa-viz-hint">
          Seleccione al menos 2
          {{ modoComparativa === 'meses' ? 'meses' : 'años' }} para ver el gráfico (mismos datos que el PDF).
        </p>
        <div v-else class="comparativa-chart-box">
          <Bar :data="comparativaChartData" :options="comparativaChartOptions" />
        </div>
        <p v-if="comparativaChartData && modoComparativa === 'meses'" class="comparativa-viz-sub">
          Año base: <strong>{{ anioComparativa }}</strong> · total incidentes en los meses seleccionados: {{ totalComparativaSeleccion }}
        </p>
        <p v-else-if="comparativaChartData && modoComparativa === 'anios'" class="comparativa-viz-sub">
          Total en años seleccionados: {{ totalComparativaSeleccion }}
        </p>
        <div v-if="comparativaChartData && comparativaCategoriasResumen.length" class="comparativa-leyenda-cat">
          <p class="comparativa-leyenda-titulo">Incidentes por categoría</p>
          <div class="comparativa-leyenda-items">
            <span
              v-for="item in comparativaCategoriasResumen"
              :key="item.id"
              class="comparativa-leyenda-item"
              :title="`${item.nombre}: ${item.total} incidente(s)`"
            >
              <i :style="{ background: item.color }" />
              {{ item.nombre }} ({{ item.total }})
            </span>
          </div>
        </div>
      </section>
    </template>

    <ReporteSemanalPanel
      v-else-if="vistaReportes === 'semanal'"
      :incidentes="incidentes"
      :logo-pdf-data-url="logoPdfDataUrl"
    />

    <template v-else-if="vistaReportes === 'indicadores'">
      <section class="card filtros-indicadores">
        <h2 class="ind-seccion-titulo">Filtros operativos</h2>
        <div class="filtros-row">
          <div class="form-group form-group--wide">
            <label>Tipo de incidente</label>
            <select v-model="indFiltroTipo" class="input">
              <option v-for="t in tiposFiltroOpcionesInd" :key="t.id || 'todos'" :value="t.id">{{ t.nombre }}</option>
            </select>
          </div>
          <div class="form-group form-group--wide">
            <label>Calle / avenida</label>
            <input v-model="indFiltroVia" type="text" class="input" placeholder="Buscar en vía…" />
          </div>
        </div>
        <div class="filtros-row filtros-row--ubicacion">
          <div class="form-group form-group--ubicacion">
            <label>Municipio</label>
            <div class="combo-multi">
              <input
                v-model="indMunicipioQuery"
                type="text"
                class="input"
                placeholder="Buscar municipio…"
                @focus="abrirMunicipiosInd = true"
                @keydown.enter.prevent="agregarPrimerMunicipioInd"
              />
              <div v-if="abrirMunicipiosInd" class="combo-lista">
                <button
                  v-for="m in municipiosFiltradosInd"
                  :key="m"
                  type="button"
                  class="combo-opcion"
                  @mousedown.prevent="toggleMunicipioInd(m)"
                >
                  <span>{{ m }}</span>
                  <span v-if="indFiltroMunicipios.includes(m)" class="combo-check">✓</span>
                </button>
              </div>
            </div>
            <div v-if="indFiltroMunicipios.length" class="chips-filtro">
              <span v-for="m in indFiltroMunicipios" :key="m" class="chip">
                {{ m }}
                <button type="button" aria-label="Quitar" @click="toggleMunicipioInd(m)">×</button>
              </span>
            </div>
          </div>
          <div class="form-group form-group--ubicacion">
            <label>Parroquia</label>
            <div class="combo-multi">
              <input
                v-model="indParroquiaQuery"
                type="text"
                class="input"
                placeholder="Seleccione municipio(s) primero…"
                :disabled="!indFiltroMunicipios.length"
                @focus="abrirParroquiasInd = true"
                @keydown.enter.prevent="agregarPrimeraParroquiaInd"
              />
              <div v-if="abrirParroquiasInd && indFiltroMunicipios.length" class="combo-lista">
                <button
                  v-for="p in parroquiasFiltradasInd"
                  :key="p"
                  type="button"
                  class="combo-opcion"
                  @mousedown.prevent="toggleParroquiaInd(p)"
                >
                  <span>{{ p }}</span>
                  <span v-if="indFiltroParroquias.includes(p)" class="combo-check">✓</span>
                </button>
              </div>
            </div>
            <div v-if="indFiltroParroquias.length" class="chips-filtro">
              <span v-for="p in indFiltroParroquias" :key="p" class="chip">
                {{ p }}
                <button type="button" aria-label="Quitar" @click="toggleParroquiaInd(p)">×</button>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="card calendario-indicadores">
        <h2 class="ind-seccion-titulo">Calendario y comparativa temporal</h2>
        <div class="filtros-row">
          <div class="form-group">
            <label>Modo</label>
            <select v-model="indModoComparacion" class="input">
              <option value="mismo_anio">Mismo año (diario · mensual · trimestral · semestral · anual)</option>
              <option value="entre_anios">Comparativa entre años</option>
            </select>
          </div>
          <template v-if="indModoComparacion === 'mismo_anio'">
            <div class="form-group">
              <label>Año</label>
              <select v-model.number="indAnioRef" class="input">
                <option v-for="y in aniosDisponiblesComparativa" :key="`ind-y-${y}`" :value="y">{{ y }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Granularidad</label>
              <select v-model="indGranularidad" class="input">
                <option v-for="p in PERIODOS_MISMO_ANIO" :key="p.id" :value="p.id">{{ p.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Desde (mes)</label>
              <select v-model.number="indMesDesde" class="input">
                <option
                  v-for="opt in mesesDesdeOpcionesInd"
                  :key="`md-${opt.num}`"
                  :value="opt.num"
                >
                  {{ opt.mes }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Hasta (mes)</label>
              <select v-model.number="indMesHasta" class="input">
                <option
                  v-for="opt in mesesHastaOpcionesInd"
                  :key="`mh-${opt.num}`"
                  :value="opt.num"
                >
                  {{ opt.mes }}
                </option>
              </select>
            </div>
            <p v-if="errorRangoMesesInd" class="reportes-error ind-rango-error" role="alert">
              {{ errorRangoMesesInd }}
            </p>
          </template>
          <template v-else>
            <div class="form-group">
              <label>Año desde</label>
              <select v-model.number="indAnioDesde" class="input">
                <option
                  v-for="y in aniosDesdeOpcionesInd"
                  :key="`yd-${y}`"
                  :value="y"
                >
                  {{ y }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Año hasta</label>
              <select v-model.number="indAnioHasta" class="input">
                <option
                  v-for="y in aniosHastaOpcionesInd"
                  :key="`yh-${y}`"
                  :value="y"
                >
                  {{ y }}
                </option>
              </select>
            </div>
            <p v-if="errorRangoAniosInd" class="reportes-error ind-rango-error" role="alert">
              {{ errorRangoAniosInd }}
            </p>
          </template>
        </div>
        <p class="filtro-resumen">{{ etiquetaResumenIndicadores }}</p>
      </section>

      <section class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total filtrado</span>
          <strong class="kpi-valor">{{ resumenIndicadores.total }}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Abiertos</span>
          <strong class="kpi-valor kpi--abierto">{{ resumenIndicadores.abiertos }}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">En proceso</span>
          <strong class="kpi-valor kpi--proceso">{{ resumenIndicadores.enProceso }}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Cerrados</span>
          <strong class="kpi-valor kpi--cerrado">{{ resumenIndicadores.cerrados }}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Municipios</span>
          <strong class="kpi-valor">{{ resumenIndicadores.municipios }}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Parroquias</span>
          <strong class="kpi-valor">{{ resumenIndicadores.parroquias }}</strong>
        </div>
      </section>

      <section class="card comparativa-viz-card">
        <h2 class="comparativa-viz-titulo">{{ tituloEvolucionInd }}</h2>
        <p v-if="!chartEvolucionInd" class="comparativa-viz-hint">
          No hay incidentes en el período seleccionado con los filtros actuales.
        </p>
        <div v-else class="comparativa-chart-box">
          <Bar :data="chartEvolucionInd" :options="chartEvolucionOptions" />
        </div>
      </section>

      <div class="ind-grid-dos">
        <section class="card comparativa-viz-card">
          <h2 class="comparativa-viz-titulo">Por categoría</h2>
          <p v-if="!chartCategoriasInd" class="comparativa-viz-hint">Sin datos en el rango.</p>
          <div v-else class="comparativa-chart-box comparativa-chart-box--med">
            <Bar :data="chartCategoriasInd" :options="comparativaChartOptions" />
          </div>
        </section>
        <section class="card comparativa-viz-card">
          <h2 class="comparativa-viz-titulo">Top tipos de incidente</h2>
          <p v-if="!chartTiposInd" class="comparativa-viz-hint">Sin datos en el rango.</p>
          <div v-else class="comparativa-chart-box comparativa-chart-box--med">
            <Bar :data="chartTiposInd" :options="comparativaChartOptions" />
          </div>
        </section>
      </div>

      <section class="card tabla-card">
        <h2 class="comparativa-viz-titulo">Tabla · categorías y tipos</h2>
        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Tipo de incidente</th>
                <th>Total</th>
                <th>% del período</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!tablaTiposInd.length">
                <td colspan="4" class="lista-vacio-texto">Sin registros con los filtros actuales.</td>
              </tr>
              <tr v-for="(fila, idx) in tablaTiposInd" :key="`${fila.categoria}-${fila.tipo}-${idx}`">
                <td>
                  <span class="ind-cat-dot" :style="{ background: fila.color }" />
                  {{ fila.categoria }}
                </td>
                <td>{{ fila.tipo }}</td>
                <td>{{ fila.total }}</td>
                <td>
                  {{
                    resumenIndicadores.total
                      ? ((fila.total / resumenIndicadores.total) * 100).toFixed(1)
                      : '0'
                  }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card tabla-card">
        <h2 class="comparativa-viz-titulo">Resumen por categoría</h2>
        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Incidentes</th>
                <th>Tipos distintos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!tablaCategoriasInd.length">
                <td colspan="3" class="lista-vacio-texto">Sin registros.</td>
              </tr>
              <tr v-for="c in tablaCategoriasInd" :key="c.id">
                <td>
                  <span class="ind-cat-dot" :style="{ background: c.color }" />
                  {{ c.nombre }}
                </td>
                <td>{{ c.total }}</td>
                <td>{{ c.tipos.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <div
      v-if="mostrarModalVerResultado"
      class="modal-overlay"
      @click.self="cerrarModalVerResultado"
    >
      <div class="modal-ver-resultado card" role="dialog" aria-labelledby="titulo-ver-resultado-reportes">
        <h3 id="titulo-ver-resultado-reportes" class="modal-title-reportes">Resultado del incidente</h3>
        <template v-if="incidenteVerResultado">
          <div v-if="tieneRegistroVictimasCierre(incidenteVerResultado)" class="bloque-resultado bloque-victimas-readonly">
            <p class="bloque-resultado-label">Heridos y fallecidos (cierre tras en proceso)</p>
            <table class="tabla-victimas-cierre tabla-victimas-cierre--lectura">
              <tbody>
                <tr>
                  <th scope="row">Heridos</th>
                  <td>{{ incidenteVerResultado.heridos_cierre }}</td>
                </tr>
                <tr>
                  <th scope="row">Fallecidos</th>
                  <td>{{ incidenteVerResultado.fallecidos_cierre }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="textoVictimasCierre(incidenteVerResultado)" class="victimas-resumen-texto">
              {{ textoVictimasCierre(incidenteVerResultado) }}
            </p>
          </div>
          <div v-if="textoResultadoModalLeer(incidenteVerResultado)" class="bloque-resultado">
            <p class="bloque-resultado-label">Resultado</p>
            <p class="bloque-resultado-texto">{{ textoResultadoModalLeer(incidenteVerResultado) }}</p>
          </div>
          <p
            v-if="!textoResultadoModalLeer(incidenteVerResultado) && !tieneRegistroVictimasCierre(incidenteVerResultado)"
            class="sin-resultado-msg"
          >
            No hay resultado registrado para este incidente.
          </p>
        </template>
        <div class="modal-acciones-reportes">
          <button type="button" class="btn btn-secondary" @click="cerrarModalVerResultado">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import ReporteSemanalPanel from '../components/ReporteSemanalPanel.vue'
import { obtenerIncidentes } from '../api/incidentes'
import { descargarPdfTablaIncidentes } from '../utils/pdfTablaIncidentes.js'
import {
  etiquetaResultadoPdf,
  textoResultadoModalLeer,
  textoVictimasCierre,
  tieneRegistroVictimasCierre,
} from '../utils/resultadoIncidente.js'
import { descargarPdfComparativaHistorica } from '../utils/pdfComparativaHistorica.js'
import { useAuth } from '../composables/useAuth'
import { useCatalogoIncidentes } from '../composables/useCatalogoIncidentes.js'

const PERIODOS_MISMO_ANIO = [
  { id: 'diario', label: 'Diario' },
  { id: 'mensual', label: 'Mensual' },
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'semestral', label: 'Semestral' },
  { id: 'anual', label: 'Anual' },
]
import {
  RANGO_ANO_INICIO,
  RANGO_ANO_FIN,
  añoSugeridoParaIncidentes,
  MUNICIPIOS_CARABOBO,
  PARROQUIAS_POR_MUNICIPIO,
} from '../config/incidentes'
import {
  colorGrupoExcel,
  grupoExcelDeIncidente,
  nombreGrupoExcel,
} from '../utils/clasificacionExcelIncidentes.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend)

const router = useRouter()
const { usuario } = useAuth()
const esAdmin = computed(() => usuario.value?.rol === 'admin')
const { tiposPlano, cargarCatalogoIncidentes } = useCatalogoIncidentes()

// Filtros indicadores (mismo criterio que Incidentes)
const indFiltroTipo = ref('')
const indFiltroMunicipios = ref([])
const indFiltroParroquias = ref([])
const indFiltroVia = ref('')
const indMunicipioQuery = ref('')
const indParroquiaQuery = ref('')
const abrirMunicipiosInd = ref(false)
const abrirParroquiasInd = ref(false)

// Modo comparación temporal
const indModoComparacion = ref('mismo_anio') // mismo_anio | entre_anios
const indGranularidad = ref('mensual')
const indAnioRef = ref(añoSugeridoParaIncidentes())
const indAnioDesde = ref(añoSugeridoParaIncidentes())
const indAnioHasta = ref(añoSugeridoParaIncidentes())
const indMesDesde = ref(1)
const indMesHasta = ref(12)

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

const incidentes = ref([])
const vistaReportes = ref('diarios')
const filtroDia = ref(new Date().getDate())
const filtroMes = ref(new Date().getMonth() + 1)
const filtroAno = ref(añoSugeridoParaIncidentes())
const descargandoPdf = ref(false)
const logoPdfDataUrl = ref(null)
const mostrarModalVerResultado = ref(false)
const incidenteVerResultado = ref(null)
const modoComparativa = ref('meses')
const anioComparativa = ref(añoSugeridoParaIncidentes())
const mesesSeleccionados = ref([new Date().getMonth() + 1])
const aniosSeleccionados = ref([añoSugeridoParaIncidentes()])
const descargandoPdfHistorico = ref(false)
const errorCarga = ref('')

const anos = computed(() => {
  const list = []
  for (let y = RANGO_ANO_INICIO; y <= RANGO_ANO_FIN; y++) list.push(y)
  return list
})

const aniosDisponiblesComparativa = computed(() => {
  const base = new Set(anos.value)
  for (const inc of incidentes.value) {
    const d = parseFechaInc(inc)
    if (!d) continue
    base.add(d.getFullYear())
  }
  return Array.from(base).sort((a, b) => a - b)
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

function parseFechaInc(inc) {
  if (!inc?.fecha) return null
  const d = new Date(inc.fecha)
  return Number.isNaN(d.getTime()) ? null : d
}

const lista = computed(() => {
  const dia = filtroDia.value
  const mes = filtroMes.value
  const ano = filtroAno.value
  const rows = incidentes.value.filter((inc) => {
    const d = parseFechaInc(inc)
    return d && d.getDate() === dia && d.getMonth() + 1 === mes && d.getFullYear() === ano
  })
  rows.sort((a, b) => {
    const ta = a.fecha ? new Date(a.fecha).getTime() : 0
    const tb = b.fecha ? new Date(b.fecha).getTime() : 0
    if (ta !== tb) return ta - tb
    return (a.id || 0) - (b.id || 0)
  })
  return rows
})

const etiquetaFechaSeleccionada = computed(() => {
  const nombreMes = MESES[filtroMes.value - 1] || ''
  return `${filtroDia.value} de ${nombreMes} de ${filtroAno.value}`
})

const fechaUltimoIncidente = computed(() => {
  let mejor = null
  for (const inc of incidentes.value) {
    const d = parseFechaInc(inc)
    if (!d) continue
    if (!mejor || d.getTime() > mejor.getTime()) mejor = d
  }
  return mejor
})

const etiquetaFechaUltimoIncidente = computed(() => {
  const d = fechaUltimoIncidente.value
  if (!d) return ''
  const nombreMes = MESES[d.getMonth()] || ''
  return `${d.getDate()} de ${nombreMes} de ${d.getFullYear()}`
})

function irAFechaUltimoIncidente() {
  const d = fechaUltimoIncidente.value
  if (!d) return
  filtroAno.value = d.getFullYear()
  filtroMes.value = d.getMonth() + 1
  filtroDia.value = d.getDate()
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleString('es-VE')
}

function irMenuAdmin() {
  router.push('/usuarios')
}

function normalizarBusqueda(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function incidentePasaFiltrosInd(inc) {
  if (indFiltroTipo.value) {
    const tipoSlug = String(inc?.tipo || '').trim()
    if (!tipoSlug || tipoSlug !== indFiltroTipo.value) return false
  }
  if (indFiltroMunicipios.value.length > 0) {
    const m = String(inc?.municipio || '').trim()
    if (!m || !indFiltroMunicipios.value.includes(m)) return false
  }
  if (indFiltroParroquias.value.length > 0) {
    const p = String(inc?.parroquia || '').trim()
    if (!p || !indFiltroParroquias.value.includes(p)) return false
  }
  if (indFiltroVia.value.trim()) {
    const via = String(inc?.via || '').toLowerCase()
    const q = normalizarBusqueda(indFiltroVia.value)
    if (!via.includes(q)) return false
  }
  return true
}

function getRangoIndicadores() {
  const hoy = new Date()
  if (indModoComparacion.value === 'entre_anios') {
    const y1 = Math.min(indAnioDesde.value, indAnioHasta.value)
    const y2 = Math.max(indAnioDesde.value, indAnioHasta.value)
    return { inicio: new Date(y1, 0, 1), fin: new Date(y2, 11, 30, 23, 59, 59) }
  }
  const y = indAnioRef.value
  const mDesde = Math.min(indMesDesde.value, indMesHasta.value)
  const mHasta = Math.max(indMesDesde.value, indMesHasta.value)
  return {
    inicio: new Date(y, mDesde - 1, 1),
    fin: new Date(y, mHasta, 0, 23, 59, 59, 999),
  }
}

function periodoKey(d, granularidad) {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (granularidad === 'diario') {
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${String(m).padStart(2, '0')}-${day}`
  }
  if (granularidad === 'mensual') return `${y}-${String(m).padStart(2, '0')}`
  if (granularidad === 'trimestral') {
    const q = Math.ceil(m / 3)
    return `${y}-Q${q}`
  }
  if (granularidad === 'semestral') {
    return `${y}-S${d.getMonth() < 6 ? 1 : 2}`
  }
  return String(y)
}

function etiquetaPeriodo(key, granularidad, modoEntreAnios) {
  if (modoEntreAnios) return key
  if (granularidad === 'diario') {
    const [y, m, d] = key.split('-')
    return `${d}/${m}/${y}`
  }
  if (granularidad === 'mensual') {
    const [y, m] = key.split('-')
    return `${MESES[Number(m) - 1] || m} ${y}`
  }
  if (granularidad === 'trimestral') {
    const [y, q] = key.split('-')
    return `${q} ${y}`
  }
  if (granularidad === 'semestral') {
    const [y, s] = key.split('-')
    return s === 'S1' ? `1.er semestre ${y}` : `2.º semestre ${y}`
  }
  return key
}

function ordenarClavesPeriodo(keys, granularidad, modoEntreAnios) {
  if (modoEntreAnios) return keys.sort((a, b) => Number(a) - Number(b))
  return keys.sort((a, b) => a.localeCompare(b))
}

function agruparPeriodos(listaInc, granularidad, rango, modoEntreAnios) {
  const map = new Map()
  for (const inc of listaInc) {
    const d = parseFechaInc(inc)
    if (!d) continue
    if (d < rango.inicio || d > rango.fin) continue
    const key = modoEntreAnios ? String(d.getFullYear()) : periodoKey(d, granularidad)
    map.set(key, (map.get(key) || 0) + 1)
  }
  const keys = ordenarClavesPeriodo(Array.from(map.keys()), granularidad, modoEntreAnios)
  return {
    labels: keys.map((k) => etiquetaPeriodo(k, granularidad, modoEntreAnios)),
    values: keys.map((k) => map.get(k) || 0),
    total: keys.reduce((s, k) => s + (map.get(k) || 0), 0),
  }
}

function agruparCategoriasTipos(listaInc) {
  const catMap = new Map()
  for (const inc of listaInc) {
    const d = parseFechaInc(inc)
    if (!d) continue
    const cat = grupoExcelDeIncidente(inc)
    const tipoSlug = String(inc?.tipo || '').trim() || 'sin_tipo'
    const tipoNombre = nombreTipoBase(inc)
    if (!catMap.has(cat)) {
      catMap.set(cat, {
        id: cat,
        nombre: nombreGrupoExcel(inc),
        color: colorGrupoExcel(inc),
        total: 0,
        tipos: new Map(),
      })
    }
    const catEntry = catMap.get(cat)
    catEntry.total += 1
    if (!catEntry.tipos.has(tipoSlug)) {
      catEntry.tipos.set(tipoSlug, { nombre: tipoNombre, total: 0 })
    }
    const t = catEntry.tipos.get(tipoSlug)
    t.total += 1
  }
  const categorias = Array.from(catMap.values())
    .map((c) => ({
      ...c,
      tipos: Array.from(c.tipos.entries())
        .map(([slug, t]) => ({
          slug,
          nombre: t.nombre,
          total: t.total,
        }))
        .sort((a, b) => b.total - a.total),
    }))
    .sort((a, b) => b.total - a.total)
  const filasTipo = []
  for (const c of categorias) {
    for (const t of c.tipos) {
      filasTipo.push({ categoria: c.nombre, tipo: t.nombre, total: t.total, color: c.color })
    }
  }
  filasTipo.sort((a, b) => b.total - a.total)
  return { categorias, filasTipo }
}

const incidentesIndicadoresBase = computed(() => {
  return incidentes.value.filter(incidentePasaFiltrosInd)
})

const incidentesIndicadoresEnRango = computed(() => {
  const rango = getRangoIndicadores()
  return incidentesIndicadoresBase.value.filter((inc) => {
    const d = parseFechaInc(inc)
    return d && d >= rango.inicio && d <= rango.fin
  })
})

const resumenIndicadores = computed(() => {
  const list = incidentesIndicadoresEnRango.value
  const abiertos = list.filter((i) => i.estado === 'abierto' || (i.cerrado !== true && i.estado !== 'cerrado')).length
  const enProceso = list.filter((i) => i.estado === 'en_proceso').length
  const cerrados = list.filter((i) => i.cerrado === true || i.estado === 'cerrado').length
  return {
    total: list.length,
    abiertos,
    enProceso,
    cerrados,
    municipios: new Set(list.map((i) => i.municipio).filter(Boolean)).size,
    parroquias: new Set(list.map((i) => i.parroquia).filter(Boolean)).size,
  }
})

const tiposFiltroOpcionesInd = computed(() => {
  const out = [{ id: '', nombre: 'Todos los tipos' }]
  for (const t of tiposPlano.value) {
    out.push({ id: t.id, nombre: t.nombre })
  }
  return out.sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const municipiosFiltradosInd = computed(() => {
  const q = normalizarBusqueda(indMunicipioQuery.value)
  if (!q) return [...MUNICIPIOS_CARABOBO]
  return MUNICIPIOS_CARABOBO.filter((m) => normalizarBusqueda(m).includes(q))
})

const parroquiasOpcionesInd = computed(() => {
  const set = new Set()
  for (const m of indFiltroMunicipios.value) {
    const list = PARROQUIAS_POR_MUNICIPIO[m] || []
    for (const p of list) set.add(p)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const parroquiasFiltradasInd = computed(() => {
  const q = normalizarBusqueda(indParroquiaQuery.value)
  if (!q) return parroquiasOpcionesInd.value
  return parroquiasOpcionesInd.value.filter((p) => normalizarBusqueda(p).includes(q))
})

function toggleMunicipioInd(m) {
  if (indFiltroMunicipios.value.includes(m)) {
    indFiltroMunicipios.value = indFiltroMunicipios.value.filter((x) => x !== m)
  } else {
    indFiltroMunicipios.value = [...indFiltroMunicipios.value, m].sort()
  }
  const validas = new Set()
  for (const mun of indFiltroMunicipios.value) {
    for (const p of PARROQUIAS_POR_MUNICIPIO[mun] || []) validas.add(p)
  }
  indFiltroParroquias.value = indFiltroParroquias.value.filter((p) => validas.has(p))
}

function toggleParroquiaInd(p) {
  if (indFiltroParroquias.value.includes(p)) {
    indFiltroParroquias.value = indFiltroParroquias.value.filter((x) => x !== p)
  } else {
    indFiltroParroquias.value = [...indFiltroParroquias.value, p]
  }
}

function agregarPrimerMunicipioInd() {
  const m = municipiosFiltradosInd.value[0]
  if (m && !indFiltroMunicipios.value.includes(m)) toggleMunicipioInd(m)
}

function agregarPrimeraParroquiaInd() {
  const p = parroquiasFiltradasInd.value[0]
  if (p && !indFiltroParroquias.value.includes(p)) toggleParroquiaInd(p)
}

const etiquetaResumenIndicadores = computed(() => {
  const parts = []
  if (indFiltroTipo.value) {
    const t = tiposFiltroOpcionesInd.value.find((x) => x.id === indFiltroTipo.value)
    if (t) parts.push(`Tipo: ${t.nombre}`)
  }
  if (indFiltroMunicipios.value.length) {
    parts.push(`Municipios: ${indFiltroMunicipios.value.join(', ')}`)
  }
  if (indFiltroParroquias.value.length) {
    parts.push(`Parroquias: ${indFiltroParroquias.value.join(', ')}`)
  }
  if (indFiltroVia.value.trim()) {
    parts.push(`Vía: "${indFiltroVia.value}"`)
  }
  if (indModoComparacion.value === 'entre_anios') {
    const yDesde = Math.min(indAnioDesde.value, indAnioHasta.value)
    const yHasta = Math.max(indAnioDesde.value, indAnioHasta.value)
    parts.push(`Comparativa entre años ${yDesde} – ${yHasta}`)
  } else {
    const g = PERIODOS_MISMO_ANIO.find((p) => p.id === indGranularidad.value)
    const mDesde = Math.min(indMesDesde.value, indMesHasta.value)
    const mHasta = Math.max(indMesDesde.value, indMesHasta.value)
    parts.push(
      `${g?.label || 'Período'} ${indAnioRef.value} · ${MESES[mDesde - 1]} – ${MESES[mHasta - 1]}`
    )
  }
  parts.push(`${incidentesIndicadoresEnRango.value.length} incidente(s) en el rango`)
  return parts.join(' · ')
})

const chartEvolucionInd = computed(() => {
  const rango = getRangoIndicadores()
  const entreAnios = indModoComparacion.value === 'entre_anios'
  const { labels, values } = agruparPeriodos(
    incidentesIndicadoresBase.value,
    indGranularidad.value,
    rango,
    entreAnios
  )
  if (!labels.length) return null
  return {
    labels,
    datasets: [
      {
        label: 'Incidentes',
        data: values,
        backgroundColor: 'rgba(0, 51, 204, 0.85)',
        borderRadius: 6,
      },
    ],
  }
})

const tituloEvolucionInd = computed(() => {
  if (indModoComparacion.value === 'entre_anios') {
    const yDesde = Math.min(indAnioDesde.value, indAnioHasta.value)
    const yHasta = Math.max(indAnioDesde.value, indAnioHasta.value)
    return `Comparativa entre años (${yDesde} – ${yHasta})`
  }
  const g = PERIODOS_MISMO_ANIO.find((p) => p.id === indGranularidad.value)
  return `Evolución ${g?.label?.toLowerCase() || ''} · año ${indAnioRef.value}`
})

const chartCategoriasInd = computed(() => {
  const { categorias } = agruparCategoriasTipos(incidentesIndicadoresEnRango.value)
  if (!categorias.length) return null
  return {
    labels: categorias.map((c) => c.nombre),
    datasets: [
      {
        label: 'Incidentes',
        data: categorias.map((c) => c.total),
        backgroundColor: categorias.map((c) => c.color),
        borderRadius: 6,
      },
    ],
  }
})

const chartTiposInd = computed(() => {
  const { filasTipo } = agruparCategoriasTipos(incidentesIndicadoresEnRango.value)
  const top = filasTipo.slice(0, 12)
  if (!top.length) return null
  return {
    labels: top.map((t) => t.tipo),
    datasets: [
      {
        label: 'Incidentes',
        data: top.map((t) => t.total),
        backgroundColor: 'rgba(100, 116, 139, 0.75)',
      },
    ],
  }
})

const tablaCategoriasInd = computed(() => {
  return agruparCategoriasTipos(incidentesIndicadoresEnRango.value).categorias
})

const tablaTiposInd = computed(() => {
  return agruparCategoriasTipos(incidentesIndicadoresEnRango.value).filasTipo
})

const mesesDesdeOpcionesInd = computed(() =>
  MESES.map((mes, idx) => ({ mes, num: idx + 1 })).filter((opt) => opt.num <= indMesHasta.value)
)

const mesesHastaOpcionesInd = computed(() =>
  MESES.map((mes, idx) => ({ mes, num: idx + 1 })).filter((opt) => opt.num >= indMesDesde.value)
)

const aniosDesdeOpcionesInd = computed(() =>
  aniosDisponiblesComparativa.value.filter((y) => y <= indAnioHasta.value)
)

const aniosHastaOpcionesInd = computed(() =>
  aniosDisponiblesComparativa.value.filter((y) => y >= indAnioDesde.value)
)

const errorRangoMesesInd = computed(() => {
  if (indModoComparacion.value !== 'mismo_anio') return ''
  if (indMesDesde.value > indMesHasta.value) {
    return 'El mes «Desde» no puede ser posterior al mes «Hasta» (por ejemplo, Diciembre → Enero).'
  }
  return ''
})

const errorRangoAniosInd = computed(() => {
  if (indModoComparacion.value !== 'entre_anios') return ''
  if (indAnioDesde.value > indAnioHasta.value) {
    return 'El año «Desde» no puede ser posterior al año «Hasta».'
  }
  return ''
})

watch(indModoComparacion, (modo) => {
  if (modo === 'entre_anios') {
    if (indAnioDesde.value > indAnioHasta.value) indAnioHasta.value = indAnioDesde.value
    return
  }
  if (indMesDesde.value > indMesHasta.value) indMesHasta.value = indMesDesde.value
})

watch(indMesDesde, (nuevo) => {
  if (indModoComparacion.value !== 'mismo_anio') return
  if (nuevo > indMesHasta.value) indMesHasta.value = nuevo
})

watch(indMesHasta, (nuevo) => {
  if (indModoComparacion.value !== 'mismo_anio') return
  if (nuevo < indMesDesde.value) indMesDesde.value = nuevo
})

watch(indAnioDesde, (nuevo) => {
  if (indModoComparacion.value !== 'entre_anios') return
  if (nuevo > indAnioHasta.value) indAnioHasta.value = nuevo
})

watch(indAnioHasta, (nuevo) => {
  if (indModoComparacion.value !== 'entre_anios') return
  if (nuevo < indAnioDesde.value) indAnioDesde.value = nuevo
})

const chartEvolucionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { grid: { color: 'rgba(226, 232, 240, 0.9)' } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

function textoEstadoListado(inc) {
  if (!inc) return '—'
  if (inc.cerrado === true || inc.estado === 'cerrado') return 'Cerrado'
  if (inc.estado === 'en_proceso') return 'En proceso'
  return 'Abierto'
}

function abrirModalVerResultado(inc) {
  incidenteVerResultado.value = inc
  mostrarModalVerResultado.value = true
}

function cerrarModalVerResultado() {
  mostrarModalVerResultado.value = false
  incidenteVerResultado.value = null
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
  const rows = lista.value
  if (rows.length === 0) return
  descargandoPdf.value = true
  try {
    const filas = rows.map((inc) => [
      String(inc.id != null ? inc.id : '—'),
      formatearFecha(inc.fecha),
      inc.tipo_nombre || inc.tipo || '—',
      inc.municipio || '—',
      inc.parroquia || '—',
      inc.via || '—',
      textoEstadoListado(inc),
      etiquetaResultadoPdf(inc),
    ])
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
    const fechaSlug = `${filtroAno.value}-${String(filtroMes.value).padStart(2, '0')}-${String(filtroDia.value).padStart(2, '0')}`
    descargarPdfTablaIncidentes({
      logoDataUrl: logoPdfDataUrl.value,
      tituloPrincipal: 'Incidentes por fecha',
      lineasInfo: [
        etiquetaFechaSeleccionada.value,
        `Generado: ${new Date().toLocaleString('es-VE')}`,
      ],
      tablaStartY: 34,
      filas,
      nombreArchivo: `reporte_incidentes_${fechaSlug}_${stamp}.pdf`,
    })
  } catch (err) {
    console.error(err)
    alert('No se pudo generar el PDF. Si el problema continúa, recargue la página e intente de nuevo.')
  } finally {
    descargandoPdf.value = false
  }
}

function toggleMesComparativa(m) {
  if (mesesSeleccionados.value.includes(m)) {
    mesesSeleccionados.value = mesesSeleccionados.value.filter((x) => x !== m)
  } else {
    mesesSeleccionados.value = [...mesesSeleccionados.value, m].sort((a, b) => a - b)
  }
}

function toggleAnioComparativa(y) {
  if (aniosSeleccionados.value.includes(y)) {
    aniosSeleccionados.value = aniosSeleccionados.value.filter((x) => x !== y)
  } else {
    aniosSeleccionados.value = [...aniosSeleccionados.value, y].sort((a, b) => a - b)
  }
}

function contarPorMes(anio, mes) {
  let total = 0
  for (const inc of incidentes.value) {
    const d = parseFechaInc(inc)
    if (!d) continue
    if (d.getFullYear() === anio && d.getMonth() + 1 === mes) total += 1
  }
  return total
}

function contarPorAnio(anio) {
  let total = 0
  for (const inc of incidentes.value) {
    const d = parseFechaInc(inc)
    if (!d) continue
    if (d.getFullYear() === anio) total += 1
  }
  return total
}

const comparativaChartData = computed(() => {
  if (modoComparativa.value === 'meses') {
    const meses = [...mesesSeleccionados.value].sort((a, b) => a - b)
    if (meses.length < 2) return null
    const anio = anioComparativa.value
    const vals = meses.map((m) => contarPorMes(anio, m))
    return {
      labels: meses.map((m) => MESES[m - 1]),
      datasets: [
        {
          label: 'Incidentes',
          data: vals,
          backgroundColor: 'rgba(0, 51, 204, 0.85)',
          borderRadius: 6,
        },
      ],
    }
  }
  const anios = [...aniosSeleccionados.value].sort((a, b) => a - b)
  if (anios.length < 2) return null
  const vals = anios.map((y) => contarPorAnio(y))
  return {
    labels: anios.map((y) => String(y)),
    datasets: [
      {
        label: 'Incidentes',
        data: vals,
        backgroundColor: 'rgba(0, 51, 204, 0.85)',
        borderRadius: 6,
      },
    ],
  }
})

const tituloGraficoComparativa = computed(() => {
  if (modoComparativa.value === 'meses') {
    return 'Comparativa por meses'
  }
  return 'Comparativa por años'
})

const totalComparativaSeleccion = computed(() => {
  const d = comparativaChartData.value
  if (!d || !d.datasets[0]?.data) return 0
  return d.datasets[0].data.reduce((a, b) => a + (Number(b) || 0), 0)
})

function nombreTipoBase(inc) {
  const t = String(inc?.tipo_nombre || inc?.tipo || '').trim()
  if (!t) return 'Clima'
  const idx = t.indexOf('|')
  return (idx >= 0 ? t.slice(0, idx) : t).trim() || 'Clima'
}

const incidentesComparativaSeleccion = computed(() => {
  if (modoComparativa.value === 'meses') {
    const meses = [...mesesSeleccionados.value]
    if (meses.length < 2) return []
    const anio = anioComparativa.value
    return incidentes.value.filter((inc) => {
      const d = parseFechaInc(inc)
      return d && d.getFullYear() === anio && meses.includes(d.getMonth() + 1)
    })
  }
  const anios = [...aniosSeleccionados.value]
  if (anios.length < 2) return []
  return incidentes.value.filter((inc) => {
    const d = parseFechaInc(inc)
    return d && anios.includes(d.getFullYear())
  })
})

const comparativaCategoriasResumen = computed(() => {
  const map = new Map()
  for (const inc of incidentesComparativaSeleccion.value) {
    const grupo = grupoExcelDeIncidente(inc)
    const esClima = grupo === 'clima'
    const id = esClima ? `clima:${String(inc?.tipo || '').trim() || 'sin_tipo'}` : grupo
    const nombre = esClima ? nombreTipoBase(inc) : nombreGrupoExcel(inc)
    const color = colorGrupoExcel(inc)
    const prev = map.get(id)
    if (prev) {
      prev.total += 1
    } else {
      map.set(id, { id, nombre, color, total: 1 })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
})

const comparativaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
      grid: { color: 'rgba(226, 232, 240, 0.9)' },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: 'rgba(226, 232, 240, 0.9)' },
    },
  },
}

function descargarPdfHistorico() {
  try {
    descargandoPdfHistorico.value = true
    if (modoComparativa.value === 'meses') {
      const meses = [...mesesSeleccionados.value].sort((a, b) => a - b)
      if (meses.length < 2) {
        alert('Seleccione al menos 2 meses para comparar.')
        return
      }
      const etiquetas = meses.map((m) => MESES[m - 1])
      const valores = meses.map((m) => contarPorMes(anioComparativa.value, m))
      const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
      descargarPdfComparativaHistorica({
        titulo: 'Comparativa histórica por meses',
        subtitulo: `Año ${anioComparativa.value}`,
        etiquetas,
        valores,
        categoriasResumen: comparativaCategoriasResumen.value,
        nombreArchivo: `comparativa_meses_${anioComparativa.value}_${stamp}.pdf`,
      })
      return
    }

    const anios = [...aniosSeleccionados.value].sort((a, b) => a - b)
    if (anios.length < 2) {
      alert('Seleccione al menos 2 años para comparar (por ejemplo 2026 y 2027).')
      return
    }
    const etiquetas = anios.map((y) => String(y))
    const valores = anios.map((y) => contarPorAnio(y))
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
    descargarPdfComparativaHistorica({
      titulo: 'Comparativa histórica por años',
      subtitulo: 'Incidentes registrados',
      etiquetas,
      valores,
      categoriasResumen: comparativaCategoriasResumen.value,
      nombreArchivo: `comparativa_anios_${stamp}.pdf`,
    })
  } catch (err) {
    console.error(err)
    alert('No se pudo generar el PDF histórico. Intente de nuevo.')
  } finally {
    descargandoPdfHistorico.value = false
  }
}

onMounted(async () => {
  try {
    await cargarCatalogoIncidentes()
    incidentes.value = await obtenerIncidentes()
    errorCarga.value = ''
  } catch (e) {
    errorCarga.value = e?.message || 'No se pudieron cargar los incidentes.'
  }
  if (lista.value.length === 0 && fechaUltimoIncidente.value) {
    irAFechaUltimoIncidente()
  }
  if (!aniosDisponiblesComparativa.value.includes(anioComparativa.value)) {
    anioComparativa.value = aniosDisponiblesComparativa.value[0] || añoSugeridoParaIncidentes()
  }
  if (aniosSeleccionados.value.length === 0) {
    const ultimos = aniosDisponiblesComparativa.value.slice(-2)
    aniosSeleccionados.value = ultimos.length > 0 ? ultimos : [añoSugeridoParaIncidentes()]
  }
  logoPdfDataUrl.value = await cargarLogoBase64()
})
</script>

<style scoped>
.reportes-lista-view {
  max-width: 1400px;
}
.reportes-error {
  margin: 0 0 0.75rem;
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  color: #7f1d1d;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius, 6px);
}

.titulo-acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.titulo-acciones.secundarios {
  justify-content: flex-end;
  margin-bottom: 0.6rem;
}

.menu-reportes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.menu-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: var(--color-secondary);
  border-radius: 10px;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.menu-btn.activo {
  border-color: #0033cc;
  background: #eef4ff;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: var(--color-surface-alt, #f1f5f9);
  color: var(--color-secondary);
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.card {
  background: var(--color-surface-card, #fff);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(0, 51, 204, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.85);
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.filtros-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.input {
  padding: 0.5rem 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius);
  font-size: 0.9375rem;
}

.filtro-resumen {
  margin: 0.85rem 0 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.ind-rango-error {
  flex: 1 1 100%;
  margin: 0.35rem 0 0;
}

.selector-grid {
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.45rem 0.85rem;
}

.selector-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.acciones-historico {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.comparativa-viz-titulo {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 0.65rem;
}

.comparativa-viz-hint {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.comparativa-viz-sub {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;
  color: var(--color-text-muted);
}

.comparativa-viz-sub strong {
  color: var(--color-secondary);
  font-weight: 600;
}

.comparativa-leyenda-cat {
  margin-top: 0.9rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.65rem;
}

.comparativa-leyenda-titulo {
  margin: 0 0 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.035em;
}

.comparativa-leyenda-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.35rem 0.8rem;
}

.comparativa-leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.comparativa-leyenda-item i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.28);
  display: inline-block;
  flex-shrink: 0;
}

.comparativa-chart-box {
  position: relative;
  height: min(360px, 70vh);
  min-height: 220px;
  margin-top: 0.5rem;
}

.tabla-card {
  padding: 0;
  overflow: hidden;
}

.tabla-wrap {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.tabla th,
.tabla td {
  padding: 0.65rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.tabla th {
  background: rgba(0, 51, 204, 0.08);
  font-weight: 600;
  color: var(--color-secondary);
  white-space: nowrap;
}

.tabla tbody tr:hover {
  background: rgba(248, 250, 252, 0.9);
}

.lista-vacio {
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}
.lista-vacio-texto {
  margin: 0;
}
.lista-vacio-btn {
  font-size: 0.85rem;
}

.badge-estado {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-cerrado {
  background: #f1f5f9;
  color: #475569;
}

.badge-proceso {
  background: rgba(234, 88, 12, 0.15);
  color: #c2410c;
}

.badge-abierto {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-ver-resultado {
  max-width: 520px;
  width: 100%;
  max-height: min(560px, 85vh);
  overflow-y: auto;
  padding: 1.25rem 1.35rem;
}

.modal-title-reportes {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-secondary);
}

.bloque-resultado {
  margin-bottom: 1rem;
}

.bloque-resultado-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.bloque-resultado-texto {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.tabla-victimas-cierre {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.tabla-victimas-cierre th,
.tabla-victimas-cierre td {
  padding: 0.5rem 0.65rem;
  border: 1px solid #e2e8f0;
  text-align: left;
}
.tabla-victimas-cierre--lectura th {
  width: 42%;
  background: #f8fafc;
  font-weight: 600;
}
.bloque-victimas-readonly {
  margin-bottom: 1rem;
}
.victimas-resumen-texto {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.sin-resultado-msg {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.modal-acciones-reportes {
  margin-top: 1rem;
}

.btn-resultado-tabla {
  padding: 0.35rem 0.55rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--color-secondary);
  background: #fff;
  color: var(--color-secondary);
  cursor: pointer;
}

.btn-resultado-tabla:hover {
  background: #eef4ff;
}

.celda-sin-resultado {
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.9rem;
}

.ind-seccion-titulo {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-secondary);
}

.form-group--wide {
  flex: 1 1 220px;
  min-width: 200px;
}

.form-group--ubicacion {
  flex: 1 1 280px;
  min-width: 240px;
}

.filtros-row--ubicacion {
  margin-top: 0.5rem;
}

.combo-multi {
  position: relative;
}

.combo-lista {
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.combo-opcion {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0.45rem 0.65rem;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
}

.combo-opcion:hover {
  background: #f1f5f9;
}

.combo-check {
  color: #0033cc;
  font-weight: 700;
}

.chips-filtro {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.45rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.45rem;
  background: #eef4ff;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  font-size: 0.8rem;
}

.chip button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: #64748b;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.kpi-card {
  background: var(--color-surface-card, #fff);
  border: 1px solid rgba(226, 232, 240, 0.85);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.kpi-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.kpi-valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-secondary);
}

.kpi--abierto { color: #b91c1c; }
.kpi--proceso { color: #c2410c; }
.kpi--cerrado { color: #475569; }

.ind-grid-dos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.comparativa-chart-box--med {
  height: min(280px, 55vh);
  min-height: 180px;
}

.ind-cat-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.35rem;
  vertical-align: middle;
  border: 1px solid rgba(15, 23, 42, 0.2);
}
</style>
