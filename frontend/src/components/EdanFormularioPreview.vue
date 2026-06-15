<template>
  <Teleport to="body">
    <div v-if="visible" class="edan-preview-overlay" @click.self="cerrar">
      <div class="edan-preview-dialog" role="dialog" aria-label="Vista previa planilla EDAN">
        <header class="edan-preview-toolbar no-print">
          <h2>Planilla EDAN — F-DGAGR-11</h2>
          <div class="edan-preview-actions">
            <button type="button" class="btn btn-secondary btn-sm" @click="imprimir">Imprimir</button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="descargando" @click="emitDescargar">
              {{ descargando ? 'Generando…' : 'Descargar PDF' }}
            </button>
            <button type="button" class="btn btn-secondary btn-sm" aria-label="Cerrar" @click="cerrar">Cerrar</button>
          </div>
        </header>

        <div ref="planillaHostRef" class="edan-preview-scroll">
          <EdanPlanillaOficial :data="data" :logo-pc-url="logoUrl" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import EdanPlanillaOficial from './EdanPlanillaOficial.vue'

defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, default: () => ({}) },
  logoUrl: { type: String, default: '/imagenes/logo.png' },
  descargando: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'descargar-pdf'])

const planillaHostRef = ref(null)

defineExpose({ planillaHostRef })

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
  padding: 0.75rem;
  overflow-y: auto;
}

.edan-preview-dialog {
  width: min(1160px, 100%);
  margin: 0 auto 1rem;
}

.edan-preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.55rem;
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

.edan-preview-scroll {
  overflow-x: auto;
  padding-bottom: 0.5rem;
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

  .edan-preview-scroll {
    overflow: visible;
  }

  @page {
    size: A4 landscape;
    margin: 6mm;
  }
}
</style>
