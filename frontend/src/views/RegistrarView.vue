<template>
  <div class="registrar-view">
    <h1 class="page-title">Registrar Incidente</h1>
    <p class="subtitle">

    </p>

    <form @submit.prevent="enviar" class="form-registro card">
      <div class="form-row">
        <div class="form-group">
          <label>Tipo de incidente</label>
          <select v-model="form.tipo" class="input" required>
            <option value="">Seleccione el tipo</option>
            <option v-for="t in TIPOS_INCIDENTE" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Municipio</label>
          <select v-model="form.municipio" class="input">
            <option value="">Seleccione municipio</option>
            <option v-for="m in MUNICIPIOS_CARABOBO" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Fecha del incidente</label>
        <div class="fecha-hora-row">
          <div class="fecha-selects">
            <select v-model.number="form.fechaDia" class="input" required>
              <option v-for="n in diasDelMes" :key="n" :value="n">{{ n }}</option>
            </select>
            <span class="fecha-sep">/</span>
            <select v-model.number="form.fechaMes" class="input" required>
              <option v-for="(nombre, idx) in MESES" :key="idx" :value="idx + 1">{{ nombre }}</option>
            </select>
            <span class="fecha-sep">/</span>
            <select v-model.number="form.fechaAno" class="input" required>
              <option v-for="y in anos" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <input v-model="form.fechaTime" type="time" class="input input-time" required />
        </div>
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea v-model="form.descripcion" class="input" rows="3" placeholder="Detalles del incidente..."></textarea>
      </div>

      <div class="form-group">
        <label>Ubicación (coordenadas) </label>
        <div class="coords-row">
          <input v-model.number="form.lat" type="number" step="any" class="input" placeholder="Latitud" required />
          <input v-model.number="form.lng" type="number" step="any" class="input" placeholder="Longitud" required />
          <button type="button" class="btn btn-secondary" @click="obtenerMiUbicacion" :disabled="ubicando">
            {{ ubicando ? 'Obteniendo...' : 'Usar mi ubicación' }}
          </button>
        </div>
        <p class="hint">Haga clic en el mapa para marcar la ubicación del incidente.</p>
      </div>

      <div class="mapa-mini card">
        <MapaCarabobo
          :incidentes="puntoUnico"
          :centro="centroMapa"
          :zoom="12"
          permitir-click
          @ubicacion-seleccionada="asignarCoordenadas"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="enviando">
          {{ enviando ? 'Guardando...' : 'Registrar incidente' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="limpiar">Limpiar</button>
      </div>

      <p v-if="mensaje" :class="mensajeOk ? 'msg ok' : 'msg error'">{{ mensaje }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO, MAPA_CENTRO_CARABOBO } from '../config/incidentes'
import { guardarIncidente } from '../api/incidentes'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function nowTimeStr() {
  const d = new Date()
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

function getDefaultFecha() {
  return { dia: 1, mes: 1, ano: 2026 }
}

const anoActual = new Date().getFullYear()
const def = getDefaultFecha()
const form = ref({
  tipo: '',
  municipio: '',
  descripcion: '',
  lat: null,
  lng: null,
  fechaDia: def.dia,
  fechaMes: def.mes,
  fechaAno: def.ano,
  fechaTime: nowTimeStr(),
})

const anos = computed(() => {
  const list = []
  for (let y = 2026; y <= anoActual + 2; y++) list.push(y)
  return list
})

const diasDelMes = computed(() => {
  const mes = form.value.fechaMes || 1
  const ano = form.value.fechaAno || 2026
  const ultimo = new Date(ano, mes, 0).getDate()
  const list = []
  for (let d = 1; d <= ultimo; d++) list.push(d)
  return list
})

watch(
  () => [form.value.fechaMes, form.value.fechaAno],
  () => {
    const maxDia = diasDelMes.value.length
    if (form.value.fechaDia > maxDia) form.value.fechaDia = maxDia
  }
)

const enviando = ref(false)
const ubicando = ref(false)
const mensaje = ref('')
const mensajeOk = ref(false)

const centroMapa = computed(() => {
  if (form.value.lat != null && form.value.lng != null) {
    return { lat: form.value.lat, lng: form.value.lng }
  }
  return MAPA_CENTRO_CARABOBO
})

const puntoUnico = computed(() => {
  if (form.value.lat != null && form.value.lng != null) {
    return [{
      lat: form.value.lat,
      lng: form.value.lng,
      tipo_nombre: 'Ubicación seleccionada',
      categoria: 'otro',
    }]
  }
  return []
})

function asignarCoordenadas({ lat, lng }) {
  form.value.lat = lat
  form.value.lng = lng
}

function obtenerMiUbicacion() {
  if (!navigator.geolocation) {
    mensaje.value = 'Su navegador no soporta geolocalización.'
    mensajeOk.value = false
    return
  }
  ubicando.value = true
  mensaje.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.lat = pos.coords.latitude
      form.value.lng = pos.coords.longitude
      ubicando.value = false
      mensaje.value = 'Ubicación obtenida correctamente.'
      mensajeOk.value = true
    },
    () => {
      ubicando.value = false
      mensaje.value = 'No se pudo obtener la ubicación. Permita el acceso o marque en el mapa.'
      mensajeOk.value = false
    }
  )
}

function limpiar() {
  const def = getDefaultFecha()
  form.value = {
    tipo: '',
    municipio: '',
    descripcion: '',
    lat: null,
    lng: null,
    fechaDia: def.dia,
    fechaMes: def.mes,
    fechaAno: def.ano,
    fechaTime: nowTimeStr(),
  }
  mensaje.value = ''
}

function getFechaIso() {
  const dia = form.value.fechaDia || 1
  const mes = form.value.fechaMes || 1
  const ano = form.value.fechaAno || 2026
  const t = form.value.fechaTime || '00:00'
  const dStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${t}`
  return new Date(dStr).toISOString()
}

async function enviar() {
  if (!form.value.lat || !form.value.lng || !form.value.tipo) {
    mensaje.value = 'Complete tipo de incidente y ubicación (coordenadas o clic en mapa).'
    mensajeOk.value = false
    return
  }
  enviando.value = true
  mensaje.value = ''
  try {
    await guardarIncidente({
      ...form.value,
      fecha: getFechaIso(),
    })
    mensaje.value = 'Incidente registrado correctamente.'
    mensajeOk.value = true
    limpiar()
  } catch (e) {
    mensaje.value = 'Error al guardar. Intente de nuevo.'
    mensajeOk.value = false
  }
  enviando.value = false
}
</script>

<style scoped>
.registrar-view {
  max-width: 800px;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.coords-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.coords-row .input {
  flex: 1;
  min-width: 120px;
}
.fecha-hora-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
.fecha-selects {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.fecha-selects .input {
  width: auto;
  min-width: 4rem;
  padding: 0.5rem 0.4rem;
}
.fecha-sep {
  color: var(--color-text-muted);
  font-weight: 600;
}
.input-time {
  min-width: 6rem;
}
.hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}
.mapa-mini {
  padding: 0;
  overflow: hidden;
  height: 280px;
  margin: 1rem 0;
}
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.msg {
  margin-top: 1rem;
  font-size: 0.9375rem;
}
.msg.ok { color: var(--color-success); }
.msg.error { color: var(--color-primary); }
@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
