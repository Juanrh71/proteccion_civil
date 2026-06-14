<template>
  <Teleport to="body">
    <div v-if="visible" class="edan-preview-overlay" @click.self="cerrar">
      <div class="edan-preview-dialog" role="dialog" aria-label="Vista previa formulario EDAN">
        <header class="edan-preview-toolbar no-print">
          <h2>Vista previa — Formulario EDAN</h2>
          <div class="edan-preview-actions">
            <button type="button" class="btn btn-secondary btn-sm" @click="imprimir">Imprimir</button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="descargando" @click="emitDescargar">
              {{ descargando ? 'Generando…' : 'Descargar PDF' }}
            </button>
            <button type="button" class="btn btn-secondary btn-sm" aria-label="Cerrar" @click="cerrar">Cerrar</button>
          </div>
        </header>

        <article ref="hojaRef" class="edan-preview-sheet">
          <header class="edan-sheet-head">
            <img v-if="logoUrl" :src="logoUrl" alt="" class="edan-sheet-logo" width="48" height="48" />
            <div>
              <h1>Formulario EDAN</h1>
              <p class="edan-sheet-meta">
                <span v-if="data?.id != null">N° {{ data.id }}</span>
                <span>Planilla: {{ data?.numero_planilla || '—' }}</span>
                <span>{{ formatearFechaEdan(data?.fecha_reporte || new Date()) }}</span>
              </p>
            </div>
          </header>

          <section v-for="sec in secciones" :key="sec.titulo" class="edan-sheet-section">
            <h3>{{ sec.titulo }}</h3>
            <dl class="edan-sheet-grid">
              <template v-for="campo in sec.campos" :key="campo.label">
                <div class="edan-sheet-field" :class="{ 'edan-sheet-field--full': campo.full }">
                  <dt>{{ campo.label }}</dt>
                  <dd>{{ campo.value }}</dd>
                </div>
              </template>
            </dl>
          </section>

          <section class="edan-sheet-section">
            <h3>Detalle de afectados</h3>
            <table class="edan-sheet-table">
              <thead>
                <tr>
                  <th>Nombre y apellido</th>
                  <th>Cédula</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(fila, idx) in filasFamilia" :key="idx">
                  <td>{{ fila[0] }}</td>
                  <td>{{ fila[1] }}</td>
                  <td>{{ fila[2] }}</td>
                  <td>{{ fila[3] }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer class="edan-sheet-foot">
            IASIEDAGREC — Protección Civil Carabobo
          </footer>
        </article>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  filasDetalleFamiliar,
  formatearFechaEdan,
  seccionesFormularioEdan,
} from '../utils/edanFormulario.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, default: () => ({}) },
  logoUrl: { type: String, default: '/imagenes/logo.png' },
  descargando: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'descargar-pdf'])

const hojaRef = ref(null)

const secciones = computed(() => seccionesFormularioEdan(props.data))
const filasFamilia = computed(() => filasDetalleFamiliar(props.data))

function cerrar() {
  emit('close')
}

function emitDescargar() {
  emit('descargar-pdf')
}

function imprimir() {
  window.print()
}
</script>

<style scoped>
.edan-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.edan-preview-dialog {
  width: min(820px, 100%);
  margin: 0 auto 1rem;
}

.edan-preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
}

.edan-preview-toolbar h2 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-secondary, #003378);
}

.edan-preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.edan-preview-sheet {
  background: #fff;
  color: #1f2937;
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.2);
  padding: 10mm 11mm 8mm;
  font-size: 8.5pt;
  line-height: 1.25;
}

.edan-sheet-head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border-bottom: 2px solid #0033cc;
  padding-bottom: 0.45rem;
  margin-bottom: 0.45rem;
}

.edan-sheet-logo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: contain;
}

.edan-sheet-head h1 {
  margin: 0;
  font-size: 13pt;
  color: #003378;
}

.edan-sheet-meta {
  margin: 0.15rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  font-size: 7.5pt;
  color: #475569;
}

.edan-sheet-section {
  margin-bottom: 0.35rem;
}

.edan-sheet-section h3 {
  margin: 0 0 0.2rem;
  padding: 0.12rem 0.35rem;
  font-size: 8pt;
  background: #eef4ff;
  color: #003378;
}

.edan-sheet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.15rem 0.55rem;
  margin: 0;
}

.edan-sheet-field {
  min-width: 0;
}

.edan-sheet-field--full {
  grid-column: 1 / -1;
}

.edan-sheet-field dt {
  margin: 0;
  font-size: 7pt;
  font-weight: 700;
  color: #334155;
}

.edan-sheet-field dd {
  margin: 0;
  font-size: 7.5pt;
  word-break: break-word;
}

.edan-sheet-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7pt;
}

.edan-sheet-table th,
.edan-sheet-table td {
  border: 1px solid #cbd5e1;
  padding: 0.15rem 0.25rem;
  text-align: left;
}

.edan-sheet-table th {
  background: #0033cc;
  color: #fff;
  font-weight: 700;
}

.edan-sheet-foot {
  margin-top: 0.35rem;
  padding-top: 0.25rem;
  border-top: 1px solid #e2e8f0;
  font-size: 6.5pt;
  color: #64748b;
  text-align: center;
}

@media print {
  .no-print {
    display: none !important;
  }

  .edan-preview-overlay {
    position: static;
    background: none;
    padding: 0;
    overflow: visible;
  }

  .edan-preview-dialog {
    width: 100%;
    margin: 0;
  }

  .edan-preview-sheet {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
    min-height: auto;
    page-break-inside: avoid;
  }

  @page {
    size: A4 portrait;
    margin: 8mm;
  }
}
</style>
