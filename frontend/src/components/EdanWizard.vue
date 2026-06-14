<template>
  <section class="edan-wizard">
    <header class="edan-wizard-head">
      <h2 class="edan-wizard-title">
        {{ mode === 'edit' ? 'Editar formulario EDAN' : 'Formulario EDAN' }}
      </h2>
      <p class="edan-wizard-sub">
        Paso {{ pasoActual }} de {{ PASOS.length }} - {{ PASOS[pasoActual - 1].titulo }}
      </p>
      <div class="edan-progress" role="progressbar" :aria-valuemin="1" :aria-valuemax="PASOS.length" :aria-valuenow="pasoActual">
        <span :style="{ width: `${(pasoActual / PASOS.length) * 100}%` }" />
      </div>
    </header>

    <div class="edan-step-body card">
      <template v-if="pasoActual === 1">
        <div class="grid-2">
          <div class="form-group">
            <label>Número planilla</label>
            <input v-model="form.numero_planilla" class="input" maxlength="50" @input="form.numero_planilla = sanitizarAlphaNumGuion(form.numero_planilla)" />
          </div>
          <div class="form-group">
            <label>Nro. informe</label>
            <input v-model="form.nro_informe" class="input" maxlength="50" @input="form.nro_informe = sanitizarAlphaNumGuion(form.nro_informe)" />
          </div>
          <div class="form-group">
            <label>Propietario o responsable</label>
            <input v-model="form.propetario" class="input" maxlength="100" @input="form.propetario = sanitizarLetras(form.propetario)" />
          </div>
          <div class="form-group">
            <label>Cédula</label>
            <input v-model="form.p_cedula" class="input" maxlength="20" @input="form.p_cedula = sanitizarNumeros(form.p_cedula, 20)" />
          </div>
          <div class="form-group">
            <label>Edad</label>
            <input v-model.number="form.P_edad" type="number" min="0" max="130" class="input" />
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input
              v-model="form.P_telefono"
              class="input"
              maxlength="12"
              @input="form.P_telefono = formatearTelefono(form.P_telefono)"
            />
          </div>
        </div>
      </template>

      <template v-else-if="pasoActual === 2">
        <div class="grid-3">
          <div class="form-group">
            <label>Municipio (Carabobo)</label>
            <select v-model="form.municipio" class="input">
              <option value="">Seleccione</option>
              <option v-for="m in MUNICIPIOS_CARABOBO" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Parroquia</label>
            <input v-model="form.parroquia" class="input" maxlength="100" @input="form.parroquia = sanitizarLetras(form.parroquia)" />
          </div>
          <div class="form-group">
            <label>Sector</label>
            <input v-model="form.sector" class="input" maxlength="100" @input="form.sector = sanitizarLetras(form.sector)" />
          </div>
          <div class="form-group">
            <label>Nro. casa</label>
            <input v-model="form.nro_casa" class="input" maxlength="20" @input="form.nro_casa = sanitizarAlphaNumGuion(form.nro_casa)" />
          </div>
          <div class="form-group">
            <label>Urbanización</label>
            <input v-model="form.urbanizacion" class="input" maxlength="100" @input="form.urbanizacion = sanitizarLetras(form.urbanizacion)" />
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input v-model="form.direccion" class="input" maxlength="255" @input="form.direccion = sanitizarDireccion(form.direccion, 255)" />
          </div>
          <div class="form-group">
            <label>Latitud (opcional)</label>
            <input v-model.number="form.lat" type="number" step="any" class="input" />
          </div>
          <div class="form-group">
            <label>Longitud (opcional)</label>
            <input v-model.number="form.lng" type="number" step="any" class="input" />
          </div>
        </div>
      </template>

      <template v-else-if="pasoActual === 3">
        <div class="grid-2">
          <div class="form-group">
            <label>Fecha solicitud</label>
            <input v-model="form.fecha_solicitud" type="datetime-local" class="input" />
          </div>
          <div class="form-group">
            <label>Fecha afectación</label>
            <input v-model="form.fecha_afectacion" type="datetime-local" class="input" />
          </div>
        </div>
      </template>

      <template v-else-if="pasoActual === 4">
        <div class="grid-2">
          <div class="form-group">
            <label>Tipo afectación</label>
            <select v-model="form.tipo_afectacion" class="input">
              <option value="">Seleccione</option>
              <option value="anegacion">Anegación</option>
              <option value="inundacion">Inundación</option>
              <option value="deslizamiento">Deslizamiento</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div class="form-group">
            <label>Condición vivienda</label>
            <select v-model="form.condicion_vivienda" class="input">
              <option value="">Seleccione</option>
              <option value="afectada">Afectada</option>
              <option value="alto_riesgo">Alto riesgo</option>
              <option value="destruida">Destruida</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo vivienda</label>
            <select v-model="form.tipo_vivienda" class="input">
              <option value="">Seleccione</option>
              <option value="anarquica">Anárquica</option>
              <option value="improvisada">Improvisada</option>
              <option value="casa convencional">Casa convencional</option>
            </select>
          </div>
          <div class="form-group" v-if="form.tipo_afectacion === 'otros'">
            <label>Afectación otros</label>
            <input v-model="form.afectacion_otros" class="input" maxlength="255" @input="form.afectacion_otros = sanitizarDireccion(form.afectacion_otros, 255)" />
          </div>
          <div class="form-group form-group-full">
            <label>Descripción de la afectación</label>
            <textarea v-model="form.descripcion_afectacion" class="input" rows="3" maxlength="4000" @input="form.descripcion_afectacion = sanitizarDireccion(form.descripcion_afectacion, 4000)" />
          </div>
          <div class="form-group form-group-full">
            <label>Descripción de la vivienda</label>
            <textarea v-model="form.descripcion_vivienda" class="input" rows="3" maxlength="4000" @input="form.descripcion_vivienda = sanitizarDireccion(form.descripcion_vivienda, 4000)" />
          </div>
        </div>
      </template>

      <template v-else-if="pasoActual === 5">
        <div class="grid-3">
          <div class="form-group"><label>Lact Fem</label><input v-model.number="form.lact_Fem" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Lact Masc</label><input v-model.number="form.lact_Masc" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Niños Fem</label><input v-model.number="form.ninos_Fem" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Niños Masc</label><input v-model.number="form.ninos_Masc" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Adultos Fem</label><input v-model.number="form.adultos_Fem" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Adultos Masc</label><input v-model.number="form.adultos_Masc" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>3era edad Fem</label><input v-model.number="form.tercera_edad_Fem" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>3era edad Masc</label><input v-model.number="form.tercera_edad_Masc" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Discapacitados</label><input v-model.number="form.discapacitados" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Total personas</label><input v-model.number="form.total_personas" type="number" min="0" class="input" /></div>
          <div class="form-group"><label>Nro. familias</label><input v-model.number="form.nro_familias" type="number" min="0" class="input" /></div>
        </div>
        <div class="detalle-toolbar">
          <h3>Afectados (detalle)</h3>
          <button type="button" class="btn btn-secondary btn-sm" @click="agregarDetalle">Agregar fila</button>
        </div>
        <div class="tabla-wrap">
          <table class="tabla-detalle">
            <thead>
              <tr>
                <th>Nombre y apellido</th>
                <th>Cédula</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, idx) in form.detalles_familiares" :key="idx">
                <td><input v-model="f.nombre_completo" class="input input-sm" maxlength="150" @input="f.nombre_completo = sanitizarLetras(f.nombre_completo)" /></td>
                <td><input v-model="f.cedula" class="input input-sm" maxlength="20" @input="f.cedula = sanitizarNumeros(f.cedula, 20)" /></td>
                <td><input v-model.number="f.edad" type="number" min="0" max="130" class="input input-sm" /></td>
                <td>
                  <select v-model="f.genero" class="input input-sm">
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </td>
                <td><button type="button" class="btn btn-secondary btn-sm" @click="eliminarDetalle(idx)">Quitar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <div class="grid-2">
          <div class="form-group form-group-full">
            <label>Requerimientos por afectación</label>
            <textarea v-model="form.requerimientos_afectacion" class="input" rows="3" maxlength="4000" @input="form.requerimientos_afectacion = sanitizarDireccion(form.requerimientos_afectacion, 4000)" />
          </div>
          <div class="form-group">
            <label>Pérdidas de enseres total</label>
            <textarea v-model="form.P_enseres_total" class="input" rows="2" maxlength="4000" @input="form.P_enseres_total = sanitizarDireccion(form.P_enseres_total, 4000)" />
          </div>
          <div class="form-group">
            <label>Pérdidas de enseres parcial</label>
            <textarea v-model="form.P_enseres_parcial" class="input" rows="2" maxlength="4000" @input="form.P_enseres_parcial = sanitizarDireccion(form.P_enseres_parcial, 4000)" />
          </div>
          <div class="form-group">
            <label>Sin pérdidas de enseres</label>
            <textarea v-model="form.p_enseres_no" class="input" rows="2" maxlength="4000" @input="form.p_enseres_no = sanitizarDireccion(form.p_enseres_no, 4000)" />
          </div>
          <div class="form-group">
            <label>Falla de agua</label>
            <select v-model="form.necesidades_agua" class="input">
              <option value="">Seleccione</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </select>
          </div>
          <div class="form-group">
            <label>Falla de alimentos</label>
            <select v-model="form.necesidades_alimentos" class="input">
              <option value="">Seleccione</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </select>
          </div>
          <div class="form-group">
            <label>Falla de luz</label>
            <select v-model="form.necesidades_luz" class="input">
              <option value="">Seleccione</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </template>
    </div>

    <p v-if="errorPaso || (mostrarErrorPasoActual && errorPasoActual)" class="msg error">
      {{ errorPaso || errorPasoActual }}
    </p>
    <footer class="edan-actions">
      <button type="button" class="btn btn-secondary" :disabled="pasoActual === 1 || submitting" @click="pasoAnterior">
        ← Atrás
      </button>
      <button
        v-if="pasoActual < PASOS.length"
        type="button"
        class="btn btn-primary"
        :disabled="submitting"
        @click="pasoSiguiente"
      >
        Siguiente →
      </button>
      <button v-else type="button" class="btn btn-primary" :disabled="submitting" @click="enviar">
        {{ submitting ? 'Guardando...' : submitLabel }}
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { MAPA_BOUNDS_CARABOBO, MUNICIPIOS_CARABOBO } from '../config/incidentes'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create',
  },
  submitLabel: {
    type: String,
    default: 'Guardar EDAN',
  },
})

const emit = defineEmits(['submit'])

const PASOS = [
  { id: 1, titulo: 'Datos de identificación' },
  { id: 2, titulo: 'Ubicación' },
  { id: 3, titulo: 'Fechas' },
  { id: 4, titulo: 'Afectación y vivienda' },
  { id: 5, titulo: 'Personas afectadas' },
  { id: 6, titulo: 'Requerimientos y enseres' },
]
const pasoActual = ref(1)
const errorPaso = ref('')
const mostrarErrorPasoActual = ref(false)

function defaultForm() {
  return {
    id: null,
    id_oficial: null,
    numero_planilla: '',
    propetario: '',
    p_cedula: '',
    P_edad: 0,
    P_telefono: '',
    municipio: '',
    parroquia: '',
    sector: '',
    nro_casa: '',
    urbanizacion: '',
    direccion: '',
    lat: null,
    lng: null,
    nro_informe: '',
    fecha_solicitud: '',
    fecha_afectacion: '',
    descripcion_afectacion: '',
    tipo_afectacion: '',
    afectacion_otros: '',
    condicion_vivienda: '',
    tipo_vivienda: '',
    descripcion_vivienda: '',
    lact_Fem: 0,
    lact_Masc: 0,
    ninos_Fem: 0,
    ninos_Masc: 0,
    adultos_Fem: 0,
    adultos_Masc: 0,
    tercera_edad_Fem: 0,
    tercera_edad_Masc: 0,
    discapacitados: 0,
    total_personas: 0,
    nro_familias: 0,
    requerimientos_afectacion: '',
    P_enseres_total: '',
    P_enseres_parcial: '',
    p_enseres_no: '',
    necesidades_agua: '',
    necesidades_alimentos: '',
    necesidades_luz: '',
    detalles_familiares: [],
  }
}

function fechaLocalInput(v) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${hh}:${mm}`
}

function setDesdeInicial(data) {
  const base = defaultForm()
  const x = data || {}
  form.value = {
    ...base,
    ...x,
    fecha_solicitud: fechaLocalInput(x.fecha_solicitud),
    fecha_afectacion: fechaLocalInput(x.fecha_afectacion),
    detalles_familiares: Array.isArray(x.detalles_familiares) ? x.detalles_familiares.map((d) => ({
      nombre_completo: String(d?.nombre_completo || ''),
      cedula: String(d?.cedula || ''),
      edad: Number.isFinite(Number(d?.edad)) ? Number(d.edad) : 0,
      genero: String(d?.genero || '').trim() === 'Femenino' ? 'Femenino' : 'Masculino',
    })) : [],
  }
}

const form = ref(defaultForm())

watch(
  () => props.initialData,
  (v) => {
    setDesdeInicial(v)
    pasoActual.value = 1
    errorPaso.value = ''
  },
  { immediate: true, deep: true }
)

function isBlank(v) {
  return String(v || '').trim() === ''
}

function tieneSoloLetras(v) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]+$/.test(String(v || '').trim())
}

function sanitizarLetras(v) {
  return String(v || '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]/g, '')
}

function sanitizarNumeros(v, maxLen = 20) {
  return String(v || '')
    .replace(/\D/g, '')
    .slice(0, maxLen)
}

function sanitizarAlphaNumGuion(v) {
  return String(v || '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .slice(0, 50)
}

function sanitizarDireccion(v, maxLen = 255) {
  return String(v || '')
    .replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s.,#°º/-]/g, '')
    .slice(0, maxLen)
}

function formatearTelefono(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 4) return d
  return `${d.slice(0, 4)}-${d.slice(4)}`
}

function telefonoValido(v) {
  return /^04\d{2}-\d{7}$/.test(String(v || '').trim())
}

function enteroValido(n, min = 0, max = 999999) {
  return Number.isInteger(Number(n)) && Number(n) >= min && Number(n) <= max
}

function fechaValida(v) {
  const d = new Date(v)
  return !Number.isNaN(d.getTime()) ? d : null
}

function validarCoords() {
  const lat = form.value.lat
  const lng = form.value.lng
  const tieneLat = lat !== null && lat !== '' && lat !== undefined
  const tieneLng = lng !== null && lng !== '' && lng !== undefined
  if (tieneLat !== tieneLng) return 'Debe colocar latitud y longitud juntas.'
  if (!tieneLat) return ''
  const nLat = Number(lat)
  const nLng = Number(lng)
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) {
    return 'Latitud y longitud deben ser numéricas.'
  }
  const [[minLat, minLng], [maxLat, maxLng]] = MAPA_BOUNDS_CARABOBO
  if (nLat < minLat || nLat > maxLat || nLng < minLng || nLng > maxLng) {
    return 'Las coordenadas deben estar dentro de Carabobo.'
  }
  return ''
}

function validarPaso(idx) {
  if (idx === 1) {
    if (isBlank(form.value.numero_planilla)) return 'Número de planilla es obligatorio.'
    if (!/^[A-Za-z0-9-]+$/.test(String(form.value.numero_planilla || '').trim())) {
      return 'Número de planilla solo admite letras, números y guion.'
    }
    if (isBlank(form.value.nro_informe)) return 'Nro de informe es obligatorio.'
    if (!/^[A-Za-z0-9-]+$/.test(String(form.value.nro_informe || '').trim())) {
      return 'Nro. informe solo admite letras, números y guion.'
    }
    if (isBlank(form.value.propetario)) return 'Propietario es obligatorio.'
    if (!tieneSoloLetras(form.value.propetario)) {
      return 'Propietario solo permite letras.'
    }
    if (isBlank(form.value.p_cedula)) return 'Cédula es obligatoria.'
    if (!/^\d{6,20}$/.test(String(form.value.p_cedula || '').trim())) {
      return 'Cédula debe ser numérica (6 a 20 dígitos).'
    }
    if (!enteroValido(form.value.P_edad, 0, 130)) return 'Edad debe estar entre 0 y 130.'
    if (isBlank(form.value.P_telefono)) return 'Teléfono es obligatorio.'
    if (!telefonoValido(form.value.P_telefono)) {
      return 'Teléfono debe tener formato 0414-1234567.'
    }
    return ''
  }
  if (idx === 2) {
    if (!MUNICIPIOS_CARABOBO.includes(form.value.municipio)) return 'Seleccione un municipio de Carabobo.'
    if (isBlank(form.value.parroquia)) return 'Parroquia es obligatoria.'
    if (!tieneSoloLetras(form.value.parroquia)) return 'Parroquia solo permite letras.'
    if (isBlank(form.value.sector)) return 'Sector es obligatorio.'
    if (!tieneSoloLetras(form.value.sector)) return 'Sector solo permite letras.'
    if (isBlank(form.value.urbanizacion)) return 'Urbanización es obligatoria.'
    if (!tieneSoloLetras(form.value.urbanizacion)) {
      return 'Urbanización solo permite letras.'
    }
    if (isBlank(form.value.nro_casa)) return 'Nro. casa es obligatorio.'
    if (!/^[A-Za-z0-9-]+$/.test(String(form.value.nro_casa || '').trim())) {
      return 'Nro. casa solo admite letras, números y guion.'
    }
    if (isBlank(form.value.direccion)) return 'Dirección es obligatoria.'
    if (!/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s.,#°º/-]+$/.test(String(form.value.direccion || '').trim())) {
      return 'Dirección solo admite letras, números y signos básicos.'
    }
    const errCoords = validarCoords()
    if (errCoords) return errCoords
    return ''
  }
  if (idx === 3) {
    if (isBlank(form.value.fecha_solicitud)) return 'Fecha de solicitud es obligatoria.'
    if (isBlank(form.value.fecha_afectacion)) return 'Fecha de afectación es obligatoria.'
    const solicitud = fechaValida(form.value.fecha_solicitud)
    const afectacion = fechaValida(form.value.fecha_afectacion)
    if (!solicitud) return 'Fecha de solicitud no es válida.'
    if (!afectacion) return 'Fecha de afectación no es válida.'
    const ahora = new Date()
    if (solicitud > ahora) return 'Fecha de solicitud no puede ser futura.'
    if (afectacion > ahora) return 'Fecha de afectación no puede ser futura.'
    if (afectacion > solicitud) return 'Fecha de afectación no puede ser posterior a la solicitud.'
    return ''
  }
  if (idx === 4) {
    if (isBlank(form.value.tipo_afectacion)) return 'Seleccione tipo de afectación.'
    if (form.value.tipo_afectacion === 'otros' && isBlank(form.value.afectacion_otros)) {
      return 'Debe describir afectación en otros.'
    }
    if (isBlank(form.value.condicion_vivienda)) return 'Seleccione condición de vivienda.'
    if (isBlank(form.value.tipo_vivienda)) return 'Seleccione tipo de vivienda.'
    if (isBlank(form.value.descripcion_afectacion)) return 'Descripción de afectación es obligatoria.'
    if (isBlank(form.value.descripcion_vivienda)) return 'Descripción de vivienda es obligatoria.'
    return ''
  }
  if (idx === 5) {
    const numericos = [
      'lact_Fem',
      'lact_Masc',
      'ninos_Fem',
      'ninos_Masc',
      'adultos_Fem',
      'adultos_Masc',
      'tercera_edad_Fem',
      'tercera_edad_Masc',
      'discapacitados',
      'total_personas',
      'nro_familias',
    ]
    for (const k of numericos) {
      if (!enteroValido(form.value[k])) return `El campo ${k} debe ser entero no negativo.`
    }
    if (Number(form.value.total_personas) <= 0) return 'Total personas debe ser mayor que cero.'
    if (Number(form.value.nro_familias) <= 0) return 'Nro. familias debe ser mayor que cero.'
    const suma =
      form.value.lact_Fem +
      form.value.lact_Masc +
      form.value.ninos_Fem +
      form.value.ninos_Masc +
      form.value.adultos_Fem +
      form.value.adultos_Masc +
      form.value.tercera_edad_Fem +
      form.value.tercera_edad_Masc
    if (suma <= 0) {
      return 'Debe registrar al menos una persona en los grupos etarios.'
    }
    if (form.value.total_personas < suma) {
      return 'Total personas no puede ser menor que la suma de grupos etarios.'
    }
    if (!form.value.detalles_familiares.length) {
      return 'Debe agregar al menos una fila en el detalle de afectados.'
    }
    for (const f of form.value.detalles_familiares) {
      const nombre = String(f?.nombre_completo || '').trim()
      const cedula = String(f?.cedula || '').trim()
      if (!nombre) return 'En detalle familiar, nombre y apellido es obligatorio.'
      if (!tieneSoloLetras(nombre)) return 'En detalle familiar, nombre y apellido solo permite letras.'
      if (!cedula) return 'En detalle familiar, cédula es obligatoria.'
      if (!/^\d{6,20}$/.test(cedula)) return 'En detalle familiar, cédula debe ser numérica (6 a 20 dígitos).'
      if (!enteroValido(f?.edad, 0, 130)) return 'En detalle familiar, edad debe ser válida (0 a 130).'
      if (!['Femenino', 'Masculino'].includes(String(f?.genero || ''))) {
        return 'En detalle familiar, sexo debe ser Femenino o Masculino.'
      }
    }
    return ''
  }
  if (idx === 6) {
    if (isBlank(form.value.requerimientos_afectacion)) return 'Requerimientos por afectación es obligatorio.'
    if (isBlank(form.value.P_enseres_total)) return 'Pérdidas de enseres total es obligatorio.'
    if (isBlank(form.value.P_enseres_parcial)) return 'Pérdidas de enseres parcial es obligatorio.'
    if (isBlank(form.value.p_enseres_no)) return 'Sin pérdidas de enseres es obligatorio.'
    if (!['si', 'no'].includes(form.value.necesidades_agua)) return 'Seleccione si/no en necesidad de agua.'
    if (!['si', 'no'].includes(form.value.necesidades_alimentos)) return 'Seleccione si/no en necesidad de alimentos.'
    if (!['si', 'no'].includes(form.value.necesidades_luz)) return 'Seleccione si/no en necesidad de luz.'
    return ''
  }
  return ''
}

const errorPasoActual = computed(() => validarPaso(pasoActual.value))

function pasoSiguiente() {
  mostrarErrorPasoActual.value = true
  errorPaso.value = errorPasoActual.value
  if (errorPaso.value) return
  pasoActual.value = Math.min(PASOS.length, pasoActual.value + 1)
  mostrarErrorPasoActual.value = false
}

function pasoAnterior() {
  errorPaso.value = ''
  mostrarErrorPasoActual.value = false
  pasoActual.value = Math.max(1, pasoActual.value - 1)
}

function agregarDetalle() {
  form.value.detalles_familiares.push({
    nombre_completo: '',
    cedula: '',
    edad: 0,
    genero: 'Masculino',
  })
}

function eliminarDetalle(idx) {
  form.value.detalles_familiares.splice(idx, 1)
}

const payload = computed(() => ({
  ...form.value,
  fecha_solicitud: form.value.fecha_solicitud ? new Date(form.value.fecha_solicitud).toISOString() : null,
  fecha_afectacion: form.value.fecha_afectacion ? new Date(form.value.fecha_afectacion).toISOString() : null,
}))

function enviar() {
  mostrarErrorPasoActual.value = true
  for (let p = 1; p <= PASOS.length; p++) {
    const err = validarPaso(p)
    if (err) {
      pasoActual.value = p
      errorPaso.value = err
      return
    }
  }
  errorPaso.value = ''
  mostrarErrorPasoActual.value = false
  emit('submit', payload.value)
}
</script>

<style scoped>
.edan-wizard {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 0;
}
.edan-wizard-head {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.edan-wizard-title {
  margin: 0;
  font-size: 1.12rem;
  color: var(--color-secondary);
}
.edan-wizard-sub {
  margin: 0;
  font-size: 0.84rem;
  color: var(--color-text-muted);
}
.edan-progress {
  height: 8px;
  width: 100%;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}
.edan-progress span {
  display: block;
  height: 100%;
  background: #0033cc;
}
.edan-step-body {
  padding: 0.75rem;
  overflow: visible;
}
.grid-2,
.grid-3 {
  display: grid;
  gap: 0.6rem 0.8rem;
}
.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.form-group-full {
  grid-column: 1 / -1;
}
.detalle-toolbar {
  margin-top: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.detalle-toolbar h3 {
  margin: 0;
  font-size: 0.92rem;
}
.tabla-wrap {
  margin-top: 0.4rem;
  max-height: 175px;
  overflow: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.tabla-detalle {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
.tabla-detalle th,
.tabla-detalle td {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.3rem;
}
.input-sm {
  min-height: 32px;
  padding: 0.35rem 0.45rem;
  font-size: 0.8rem;
}
.edan-actions {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.35rem;
}
@media (max-width: 980px) {
  .grid-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>

