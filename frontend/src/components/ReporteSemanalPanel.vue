<template>
  <div class="reporte-semanal">
    <section class="card filtros-semana">
      <h2 class="rs-titulo">Reporte semanal</h2>
      <div class="filtros-row">
        <div class="form-group">
          <label>Año</label>
          <select v-model.number="anioSemanal" class="input">
            <option v-for="y in aniosOpciones" :key="`rs-y-${y}`" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Semana de portada (título)</label>
          <select v-model.number="semanaPortada" class="input">
            <option v-for="w in semanasSeleccionadasOrdenadas" :key="`sp-${w}`" :value="w">
              Semana {{ w }}
            </option>
          </select>
        </div>
      </div>

      <p class="rs-label-semanas">Seleccione semanas a comparar (mínimo 2)</p>
      <p class="rs-ayuda-cerrados">La comparativa semanal usa únicamente incidentes cerrados. Puede seleccionar todas las semanas que necesite comparar.</p>
      <div class="selector-semanas">
        <label v-for="w in semanasDelAnio" :key="`w-${w}`" class="selector-semana" :class="{ con_datos: semanasConIncidentes.includes(w) }">
          <input type="checkbox" :checked="semanasSeleccionadas.includes(w)" @change="toggleSemana(w)" />
          <span>S{{ w }}</span>
        </label>
      </div>

      <div class="acciones-semana">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="descargandoPdf || !puedeGenerarPdf"
          @click="descargarPdf"
        >
          {{ descargandoPdf ? 'Generando PDF…' : 'Descargar PDF reporte semanal' }}
        </button>
      </div>
    </section>

    <section v-if="datosReporte.portada" class="card portada-preview">
      <p class="portada-inst">{{ datosReporte.portada.institucion }}</p>
      <h2 class="portada-titulo">{{ datosReporte.portada.titulo }}</h2>
      <p class="portada-sub">{{ etiquetaPortadaSemana(anioSemanal, semanaPortada) }}</p>
    </section>

    <section
      v-for="sec in datosReporte.secciones"
      :key="sec.id"
      class="card tabla-semana-card"
    >
      <div class="tabla-semana-header">{{ sec.titulo }}</div>
      <div class="tabla-wrap">
        <table class="tabla tabla-semana" :style="estiloTablaSemanal">
          <colgroup>
            <col class="col-incidencia" />
            <col v-for="s in datosReporte.semanas" :key="`col-${sec.id}-${s.semana}`" class="col-semana" />
            <col v-if="datosReporte.semanas.length >= 2" class="col-pct" />
            <col v-if="datosReporte.semanas.length >= 2" class="col-tend" />
          </colgroup>
          <thead>
            <tr>
              <th class="th-incidencia">Incidencia</th>
              <th v-for="s in datosReporte.semanas" :key="`th-${sec.id}-${s.semana}`" class="th-semana">{{ s.etiqueta }}</th>
              <th v-if="datosReporte.semanas.length >= 2" class="th-pct">%</th>
              <th v-if="datosReporte.semanas.length >= 2" class="th-tend">Tend.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, idx) in sec.filas" :key="`${sec.id}-f-${idx}`">
              <td class="td-incidencia">{{ fila.nombre }}</td>
              <td v-for="(v, vi) in fila.valores" :key="`v-${vi}`" class="td-num">{{ String(v).padStart(2, '0') }}</td>
              <td v-if="datosReporte.semanas.length >= 2" class="td-pct" :class="clasePct(fila.pct)">
                {{ formatoPorcentaje(fila.pct) }}
              </td>
              <td v-if="datosReporte.semanas.length >= 2" class="td-tend">
                <span v-if="fila.tendencia === 'sube'" class="tend tend--sube" title="Incremento">▲</span>
                <span v-else-if="fila.tendencia === 'baja'" class="tend tend--baja" title="Disminuyó">▼</span>
                <span v-else class="tend tend--igual" title="Se mantuvo">■</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="leyenda-semana">
        <span class="tend tend--sube">▲</span> Incremento
        <span class="tend tend--baja">▼</span> Disminuyó
        <span class="tend tend--igual">■</span> Se mantuvo
      </p>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  construirDatosReporteSemanal,
  etiquetaPortadaSemana,
  formatoPorcentaje,
  semanasConDatos,
} from '../utils/reporteSemanal.js'
import { descargarPdfReporteSemanal } from '../utils/pdfReporteSemanal.js'
import { RANGO_ANO_INICIO, RANGO_ANO_FIN, añoSugeridoParaIncidentes } from '../config/incidentes'

const props = defineProps({
  incidentes: { type: Array, default: () => [] },
  logoPdfDataUrl: { type: String, default: null },
})

const anioSemanal = ref(añoSugeridoParaIncidentes())
const semanasSeleccionadas = ref([])
const semanaPortada = ref(null)
const descargandoPdf = ref(false)

const aniosOpciones = computed(() => {
  const list = []
  for (let y = RANGO_ANO_INICIO; y <= RANGO_ANO_FIN; y++) list.push(y)
  for (const inc of props.incidentes) {
    const f = inc?.fecha ? new Date(inc.fecha) : null
    if (f && !Number.isNaN(f.getTime())) list.push(f.getFullYear())
  }
  return [...new Set(list)].sort((a, b) => a - b)
})

const semanasDelAnio = computed(() => {
  const max = 52
  const list = []
  for (let w = 1; w <= max; w++) list.push(w)
  return list
})

const semanasConIncidentes = computed(() => semanasConDatos(props.incidentes, anioSemanal.value))

const semanasSeleccionadasOrdenadas = computed(() =>
  [...semanasSeleccionadas.value].sort((a, b) => a - b)
)

const puedeGenerarPdf = computed(() => semanasSeleccionadasOrdenadas.value.length >= 2)

const estiloTablaSemanal = computed(() => {
  const semanas = datosReporte.value.semanas.length
  const anchoIncidencia = 260
  const anchoSemanas = semanas * 92
  const anchoComparativa = semanas >= 2 ? 170 : 0
  return { minWidth: `${anchoIncidencia + anchoSemanas + anchoComparativa}px` }
})

const datosReporte = computed(() => {
  if (!puedeGenerarPdf.value) {
    return { semanas: [], portada: null, secciones: [] }
  }
  const semanas = semanasSeleccionadasOrdenadas.value
  const datos = construirDatosReporteSemanal(props.incidentes, anioSemanal.value, semanas)
  if (semanaPortada.value && datos.portada) {
    datos.portada.subtitulo = etiquetaPortadaSemana(anioSemanal.value, semanaPortada.value)
  }
  return datos
})

watch(
  semanasSeleccionadasOrdenadas,
  (list) => {
    if (list.length && !list.includes(semanaPortada.value)) {
      semanaPortada.value = list[list.length - 1]
    }
  },
  { immediate: true }
)

watch(anioSemanal, () => {
  semanasSeleccionadas.value = []
})

watch(
  semanasConIncidentes,
  (list) => {
    if (semanasSeleccionadas.value.length >= 2) return
    if (list.length >= 2) {
      semanasSeleccionadas.value = list.slice(-2)
    } else if (list.length === 1) {
      semanasSeleccionadas.value = [list[0]]
    }
  },
  { immediate: true }
)

function toggleSemana(w) {
  if (semanasSeleccionadas.value.includes(w)) {
    semanasSeleccionadas.value = semanasSeleccionadas.value.filter((x) => x !== w)
  } else {
    semanasSeleccionadas.value = [...semanasSeleccionadas.value, w].sort((a, b) => a - b)
  }
}

function clasePct(pct) {
  if (pct > 0) return 'pct-up'
  if (pct < 0) return 'pct-down'
  return 'pct-flat'
}

function descargarPdf() {
  if (!puedeGenerarPdf.value) {
    alert('Seleccione al menos 2 semanas para comparar.')
    return
  }
  descargandoPdf.value = true
  try {
    const sems = semanasSeleccionadasOrdenadas.value.join('-')
    const stamp = new Date().toISOString().slice(0, 10)
    descargarPdfReporteSemanal({
      datos: datosReporte.value,
      logoDataUrl: props.logoPdfDataUrl,
      nombreArchivo: `reporte_semanal_${anioSemanal.value}_S${sems}_${stamp}.pdf`,
    })
  } catch (e) {
    console.error(e)
    alert(e?.message || 'No se pudo generar el PDF semanal.')
  } finally {
    descargandoPdf.value = false
  }
}
</script>

<style scoped>
.rs-titulo {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-secondary);
}

.rs-label-semanas {
  margin: 0.75rem 0 0.45rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.rs-ayuda-cerrados {
  margin: -0.25rem 0 0.55rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #0f766e;
}

.selector-semanas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 0.35rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.selector-semana {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  padding: 0.3rem 0.2rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
}

.selector-semana.con_datos {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.selector-semana:has(input:checked) {
  border-color: #0033cc;
  background: #eef4ff;
  font-weight: 600;
}

.acciones-semana {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.portada-preview {
  text-align: center;
  padding: 1.5rem 1rem;
  border: 2px solid #003378;
}

.portada-inst {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #003378;
  letter-spacing: 0.02em;
}

.portada-titulo {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #b40000;
}

.portada-sub {
  margin: 0;
  font-size: 0.95rem;
  color: #334155;
}

.tabla-semana-card {
  padding: 0;
  overflow: hidden;
}

.tabla-wrap {
  overflow-x: auto;
  width: 100%;
}

.tabla-semana-header {
  background: #ffe600;
  color: #b40000;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  padding: 0.55rem 0.75rem;
  letter-spacing: 0.03em;
}

.tabla-semana {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.col-incidencia {
  width: 260px;
}

.col-semana {
  width: 92px;
}

.col-pct {
  width: 100px;
}

.col-tend {
  width: 70px;
}

.tabla-semana th {
  background: #003378;
  color: #fff;
  text-align: center;
  vertical-align: middle;
  padding: 0.36rem 0.45rem;
  white-space: nowrap;
}

.tabla-semana td {
  vertical-align: middle;
  padding: 0.34rem 0.45rem;
}

.th-incidencia,
.td-incidencia {
  text-align: left;
}

.td-incidencia {
  font-weight: 600;
  color: #1f2937;
}

.th-semana,
.td-num {
  font-variant-numeric: tabular-nums;
}

.th-pct,
.td-pct {
  font-variant-numeric: tabular-nums;
}

.tabla-semana td.td-num,
.tabla-semana th:not(:first-child) {
  text-align: center;
}

.tabla-semana tbody tr:nth-child(odd) td {
  background: #dce9f7;
}

.tabla-semana tbody tr:nth-child(even) td {
  background: #ebf3fb;
}

.td-pct {
  font-weight: 600;
  text-align: center;
}

.pct-up { color: #15803d; }
.pct-down { color: #b91c1c; }
.pct-flat { color: #64748b; }

.th-tend,
.td-tend {
  text-align: center;
}

.tend--sube { color: #15803d; }
.tend--baja { color: #b91c1c; }
.tend--igual { color: #94a3b8; font-size: 0.65rem; }

.leyenda-semana {
  margin: 0;
  padding: 0.5rem 0.75rem 0.65rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
</style>
