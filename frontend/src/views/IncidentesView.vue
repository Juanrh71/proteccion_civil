<template>
  <div class="incidentes-view">
    <h1 class="page-title">Listado de Incidentes</h1>
    <p class="subtitle"></p>

    <div class="filtros card">
      <div class="filtros-row">
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="filtroTipo" class="input">
            <option value="">Todos</option>
            <option v-for="t in TIPOS_INCIDENTE" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Municipio</label>
          <select v-model="filtroMunicipio" class="input">
            <option value="">Todos</option>
            <option v-for="m in MUNICIPIOS_CARABOBO" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Buscar</label>
          <input v-model="filtroTexto" type="text" class="input" placeholder="Descripción o tipo..." />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="tabla-wrap">
        <table class="tabla">
          <thead>
            <tr>
              <th>Id</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Municipio</th>
              <th>Descripción</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in incidentesFiltrados" :key="inc.id">
              <td>Reporte</td>
              <td>{{ formatearFecha(inc.fecha) }}</td>
              <td>{{ inc.tipo_nombre || inc.tipo }}</td>
              <td>{{ inc.municipio || '—' }}</td>
              <td>{{ inc.descripcion || '—' }}</td>
              <td>
                <span v-if="inc.lat && inc.lng">{{ inc.lat.toFixed(4) }}, {{ inc.lng.toFixed(4) }}</span>
                <span v-else>—</span>
              </td>
              <td>
                <button type="button" class="btn btn-secondary btn-sm" @click="abrirEditar(inc)">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="incidentesFiltrados.length === 0" class="sin-datos">No hay incidentes que coincidan con los filtros.</p>
      <p class="total">Total: {{ incidentesFiltrados.length }} incidente(s)</p>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal card">
        <h3 class="modal-title">Editar incidente</h3>
        <form @submit.prevent="guardarEdicion" class="form-editar">
          <div class="form-row">
            <div class="form-group">
              <label>Tipo de incidente *</label>
              <select v-model="formEditar.tipo" class="input" required>
                <option value="">Seleccione el tipo</option>
                <option v-for="t in TIPOS_INCIDENTE" :key="t.id" :value="t.id">{{ t.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Municipio</label>
              <select v-model="formEditar.municipio" class="input">
                <option value="">Seleccione municipio</option>
                <option v-for="m in MUNICIPIOS_CARABOBO" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formEditar.descripcion" class="input" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Latitud *</label>
              <input v-model.number="formEditar.lat" type="number" step="any" class="input" required />
            </div>
            <div class="form-group">
              <label>Longitud *</label>
              <input v-model.number="formEditar.lng" type="number" step="any" class="input" required />
            </div>
          </div>
          <div class="form-group">
            <label>Fecha *</label>
            <input v-model="formEditar.fecha" type="datetime-local" class="input" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
            <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          </div>
          <p v-if="mensajeEditar" :class="mensajeEditarOk ? 'msg ok' : 'msg error'">{{ mensajeEditar }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerIncidentes, actualizarIncidente } from '../api/incidentes'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO } from '../config/incidentes'

const incidentes = ref([])
const filtroTipo = ref('')
const filtroMunicipio = ref('')
const filtroTexto = ref('')
const mostrarModal = ref(false)
const editingId = ref(null)
const guardando = ref(false)
const mensajeEditar = ref('')
const mensajeEditarOk = ref(false)

const formEditar = ref({
  tipo: '',
  municipio: '',
  descripcion: '',
  lat: null,
  lng: null,
  fecha: '',
})

const incidentesFiltrados = computed(() => {
  let list = [...incidentes.value]
  if (filtroTipo.value) list = list.filter((i) => i.tipo === filtroTipo.value)
  if (filtroMunicipio.value) list = list.filter((i) => i.municipio === filtroMunicipio.value)
  if (filtroTexto.value) {
    const t = filtroTexto.value.toLowerCase()
    list = list.filter(
      (i) =>
        (i.descripcion && i.descripcion.toLowerCase().includes(t)) ||
        (i.tipo_nombre && i.tipo_nombre.toLowerCase().includes(t)) ||
        (i.tipo && i.tipo.toLowerCase().includes(t))
    )
  }
  return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-VE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function fechaParaInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toISOString().slice(0, 16)
}

function abrirEditar(inc) {
  editingId.value = inc.id
  formEditar.value = {
    tipo: inc.tipo || '',
    municipio: inc.municipio || '',
    descripcion: inc.descripcion || '',
    lat: inc.lat ?? null,
    lng: inc.lng ?? null,
    fecha: fechaParaInput(inc.fecha),
  }
  mensajeEditar.value = ''
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  editingId.value = null
}

async function guardarEdicion() {
  if (formEditar.value.lat == null || formEditar.value.lng == null || !formEditar.value.tipo) {
    mensajeEditar.value = 'Complete tipo, latitud y longitud.'
    mensajeEditarOk.value = false
    return
  }
  guardando.value = true
  mensajeEditar.value = ''
  try {
    const payload = {
      ...formEditar.value,
      fecha: formEditar.value.fecha ? new Date(formEditar.value.fecha).toISOString() : new Date().toISOString(),
    }
    await actualizarIncidente(editingId.value, payload)
    incidentes.value = await obtenerIncidentes()
    cerrarModal()
  } catch (e) {
    mensajeEditar.value = e.response?.data?.error || 'Error al guardar. Intente de nuevo.'
    mensajeEditarOk.value = false
  }
  guardando.value = false
}

onMounted(async () => {
  incidentes.value = await obtenerIncidentes()
})
</script>

<style scoped>
.incidentes-view {
  max-width: 1200px;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}
.filtros-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}
.tabla-wrap {
  overflow-x: auto;
}
.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}
.tabla th,
.tabla td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.tabla th {
  font-weight: 600;
  color: var(--color-secondary);
  background: #f8fafc;
}
.tabla td {
  color: var(--color-text);
}
.sin-datos {
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
}
.total {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  border-top: 1px solid #e2e8f0;
}
.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal {
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-title {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: var(--color-secondary);
}
.form-editar .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-editar .form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.form-editar .msg {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}
.form-editar .msg.ok { color: var(--color-success); }
.form-editar .msg.error { color: var(--color-primary); }
@media (max-width: 768px) {
  .tabla th:nth-child(5),
  .tabla td:nth-child(5) { display: none; }
  .tabla th:nth-child(6),
  .tabla td:nth-child(6) { display: none; }
}
</style>
