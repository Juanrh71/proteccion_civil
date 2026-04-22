<template>
  <div class="reportes-lista-view">
    <div class="titulo-acciones">
      <h1 class="page-title">Reportes</h1>
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
      <div v-if="lista.length === 0" class="lista-vacio">No hay incidentes registrados para esta fecha.</div>
      <div v-else class="tabla-wrap">
        <table class="tabla">
          <thead>
            <tr>
              <th>N°</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Municipio</th>
              <th>Parroquia</th>
              <th>Calle / Avenida</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(inc, idx) in lista" :key="inc.id">
              <td>{{ idx + 1 }}</td>
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
              <td>{{ inc.descripcion || '—' }}</td>
              <td>
                <span v-if="inc.lat != null && inc.lng != null">{{ Number(inc.lat).toFixed(4) }}, {{ Number(inc.lng).toFixed(4) }}</span>
                <span v-else>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { obtenerIncidentes } from '../api/incidentes'
import { descargarPdfTablaIncidentes } from '../utils/pdfTablaIncidentes.js'
import {
  RANGO_ANO_INICIO,
  RANGO_ANO_FIN,
  añoSugeridoParaIncidentes,
} from '../config/incidentes'

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
const filtroDia = ref(new Date().getDate())
const filtroMes = ref(new Date().getMonth() + 1)
const filtroAno = ref(añoSugeridoParaIncidentes())
const descargandoPdf = ref(false)
const logoPdfDataUrl = ref(null)

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

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleString('es-VE')
}

function textoEstadoListado(inc) {
  if (!inc) return '—'
  if (inc.cerrado === true || inc.estado === 'cerrado') return 'Cerrado'
  if (inc.estado === 'en_proceso') return 'En proceso'
  return 'Abierto'
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
    const filas = rows.map((inc, idx) => [
      String(idx + 1),
      formatearFecha(inc.fecha),
      inc.tipo_nombre || inc.tipo || '—',
      inc.municipio || '—',
      inc.parroquia || '—',
      inc.via || '—',
      textoEstadoListado(inc),
      inc.descripcion || '—',
      inc.lat != null && inc.lng != null
        ? `${Number(inc.lat).toFixed(4)}, ${Number(inc.lng).toFixed(4)}`
        : '—',
    ])
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
    const fechaSlug = `${filtroAnio.value}-${String(filtroMes.value).padStart(2, '0')}-${String(filtroDia.value).padStart(2, '0')}`
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

onMounted(async () => {
  incidentes.value = await obtenerIncidentes()
  logoPdfDataUrl.value = await cargarLogoBase64()
})
</script>

<style scoped>
.reportes-lista-view {
  max-width: 1400px;
}

.titulo-acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
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
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
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
</style>
