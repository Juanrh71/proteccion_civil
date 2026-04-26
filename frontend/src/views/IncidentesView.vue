<template>
  <div class="incidentes-view">
    <div class="titulo-acciones">
      <h1 class="page-title">Listado de Incidentes</h1>
      <button type="button" class="btn btn-secondary" :disabled="descargandoPdf" @click="descargarPdf">
        {{ descargandoPdf ? 'Generando PDF…' : 'Descargar PDF' }}
      </button>
    </div>
    <p v-if="avisoResultadoGuardado" class="aviso-resultado" role="status">{{ avisoResultadoGuardado }}</p>
    <p v-if="errorCargaLista" class="aviso-lista-error" role="alert">{{ errorCargaLista }}</p>

    <div class="vista-por-estado card" role="tablist" aria-label="Filtrar listado por estado del incidente">
      <div class="vista-por-estado-inner">
        <button
          type="button"
          class="vista-tab"
          :class="{ activa: vistaLista === 'abiertos' }"
          role="tab"
          :aria-selected="vistaLista === 'abiertos'"
          @click="vistaLista = 'abiertos'"
        >
          <span class="vista-tab-titulo">Abiertos</span>
          <span class="vista-tab-sub">Recibidos, pendientes de despacho</span>
          <span class="vista-tab-num">{{ conteoAbiertos }}</span>
        </button>
        <button
          type="button"
          class="vista-tab"
          :class="{ activa: vistaLista === 'en_proceso' }"
          role="tab"
          :aria-selected="vistaLista === 'en_proceso'"
          @click="vistaLista = 'en_proceso'"
        >
          <span class="vista-tab-titulo">En proceso</span>
          <span class="vista-tab-sub">Atención o seguimiento activo</span>
          <span class="vista-tab-num">{{ conteoEnProceso }}</span>
        </button>
        <button
          type="button"
          class="vista-tab"
          :class="{ activa: vistaLista === 'cerrados' }"
          role="tab"
          :aria-selected="vistaLista === 'cerrados'"
          @click="vistaLista = 'cerrados'"
        >
          <span class="vista-tab-titulo">Cerrados</span>
          <span class="vista-tab-sub">Incidente finalizado</span>
          <span class="vista-tab-num">{{ conteoCerrados }}</span>
        </button>
      </div>
    </div>

    <div class="filtros card">
      <div class="filtros-row">
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="filtroTipo" class="input">
            <option value="">Todos</option>
            <option v-for="t in tiposFiltroOpciones" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Municipios</label>
          <div class="combo" :class="{ 'combo-abierto': abrirMunicipios }">
            <div v-if="filtroMunicipios.length > 0" class="chips-wrap">
              <span v-for="m in filtroMunicipios" :key="m" class="chip-item">
                {{ m }}
                <button type="button" class="chip-x" @click.stop="quitarMunicipio(m)">×</button>
              </span>
            </div>
            <input
              v-model="municipioQuery"
              type="text"
              class="combo-input"
              placeholder="Escriba y seleccione municipios…"
              @focus="abrirMunicipios = true"
              @blur="onMunicipiosBlur"
              @keydown.enter.prevent="agregarPrimerMunicipio"
            />
            <ul v-show="abrirMunicipios" class="combo-lista" role="listbox">
              <li
                v-for="m in municipiosFiltradosLista"
                :key="m"
                class="combo-item"
                role="option"
                @mousedown.prevent="toggleMunicipio(m)"
              >
                <span>{{ m }}</span>
                <span v-if="filtroMunicipios.includes(m)">✓</span>
              </li>
              <li v-if="municipiosFiltradosLista.length === 0" class="combo-vacio">Sin coincidencias</li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label>Parroquias</label>
          <div class="combo" :class="{ 'combo-abierto': abrirParroquias }">
            <div v-if="filtroParroquias.length > 0" class="chips-wrap">
              <span v-for="p in filtroParroquias" :key="p" class="chip-item">
                {{ p }}
                <button type="button" class="chip-x" @click.stop="quitarParroquia(p)">×</button>
              </span>
            </div>
            <input
              v-model="parroquiaQuery"
              type="text"
              class="combo-input"
              placeholder="Escriba y seleccione parroquias…"
              :disabled="parroquiasOpcionesFiltro.length === 0"
              @focus="abrirParroquias = true"
              @blur="onParroquiasBlur"
              @keydown.enter.prevent="agregarPrimeraParroquia"
            />
            <ul v-show="abrirParroquias" class="combo-lista" role="listbox">
              <li
                v-for="p in parroquiasFiltradasLista"
                :key="p"
                class="combo-item"
                role="option"
                @mousedown.prevent="toggleParroquia(p)"
              >
                <span>{{ p }}</span>
                <span v-if="filtroParroquias.includes(p)">✓</span>
              </li>
              <li v-if="parroquiasFiltradasLista.length === 0" class="combo-vacio">Sin coincidencias</li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label>Buscar</label>
          <input v-model="filtroTexto" type="text" class="input" placeholder="Tipo, municipio, parroquia o calle…" />
        </div>
      </div>
    </div>

    <div class="card incidentes-card">
      <div class="tabla-wrap">
        <table class="tabla">
          <thead>
            <tr>
              <th class="th-n" title="Número de reporte (ID del sistema)">N°</th>
              <th class="th-fecha">Fecha</th>
              <th>Tipo</th>
              <th>Municipio</th>
              <th>Parroquia</th>
              <th>Calle / Avenida</th>
              <th>Estado</th>
              <th v-if="vistaLista === 'cerrados'" class="th-resultado">Resultado</th>
              <th class="th-acc">Acc.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in incidentesFiltrados" :key="inc.id">
              <td>{{ inc.id != null ? inc.id : '—' }}</td>
              <td class="td-fecha">{{ formatearFechaTabla(inc.fecha) }}</td>
              <td>{{ inc.tipo_nombre || inc.tipo }}</td>
              <td>{{ inc.municipio || '—' }}</td>
              <td>{{ inc.parroquia || '—' }}</td>
              <td>{{ inc.via || '—' }}</td>
              <td>
                <span v-if="textoEstadoListado(inc) === 'Cerrado'" class="badge-estado badge-cerrado">Cerrado</span>
                <span v-else-if="textoEstadoListado(inc) === 'En proceso'" class="badge-estado badge-proceso">En proceso</span>
                <span v-else class="badge-estado badge-abierto">Abierto</span>
              </td>
              <td v-if="vistaLista === 'cerrados'" class="td-resultado">
                <button type="button" class="btn btn-resultado-tabla btn-sm" @click="abrirModalVerResultado(inc)">
                  Resultado
                </button>
              </td>
              <td class="acciones-cell">
                <div class="acciones-btns" role="group" :aria-label="'Acciones incidente ' + (inc.id != null ? inc.id : '')">
                  <button
                    v-if="esEditable(inc)"
                    type="button"
                    class="btn btn-icon btn-icon--editar"
                    aria-label="Editar incidente"
                    title="Editar"
                    @click="abrirEditar(inc)"
                  >
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                    </svg>
                  </button>
                  <button
                    v-if="inc.estado === 'abierto' && inc.cerrado !== true"
                    type="button"
                    class="btn btn-icon btn-icon--proceso"
                    :aria-label="cambiandoEstadoId === inc.id ? 'Aplicando en proceso' : 'Pasar a en proceso'"
                    :title="cambiandoEstadoId === inc.id ? 'Aplicando…' : 'En proceso'"
                    :disabled="cambiandoEstadoId === inc.id || cerrandoId === inc.id"
                    @click="marcarEstadoOperativo(inc, 'en_proceso')"
                  >
                    <svg
                      v-if="cambiandoEstadoId === inc.id"
                      class="btn-icon-svg btn-icon-svg--spin"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="32" stroke-linecap="round" opacity="0.35" />
                      <path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 3a9 9 0 0 1 9 9" />
                    </svg>
                    <svg v-else class="btn-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path fill="currentColor" d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <button
                    v-if="inc.cerrado !== true"
                    type="button"
                    class="btn btn-icon btn-icon--cerrar"
                    :aria-label="cerrandoId === inc.id ? 'Cerrando incidente' : 'Cerrar incidente'"
                    :title="cerrandoId === inc.id ? 'Cerrando…' : 'Cerrar incidente'"
                    :disabled="cerrandoId === inc.id || cambiandoEstadoId === inc.id"
                    @click="confirmarCerrarDesdeFila(inc)"
                  >
                    <svg
                      v-if="cerrandoId === inc.id"
                      class="btn-icon-svg btn-icon-svg--spin"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="32" stroke-linecap="round" opacity="0.35" />
                      <path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 3a9 9 0 0 1 9 9" />
                    </svg>
                    <svg v-else class="btn-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="leyenda-acciones" aria-label="Leyenda: qué hace cada icono de la columna Acc.">
        <span class="leyenda-titulo">Leyenda de acciones</span>
        <span class="leyenda-item">
          <span class="leyenda-icon-muestra btn-icon btn-icon--editar" aria-hidden="true">
            <svg class="btn-icon-svg" viewBox="0 0 24 24" focusable="false">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
            </svg>
          </span>
          Editar
        </span>
        <span class="leyenda-item">
          <span class="leyenda-icon-muestra btn-icon btn-icon--proceso" aria-hidden="true">
            <svg class="btn-icon-svg" viewBox="0 0 24 24" focusable="false">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </span>
          Pasar a en proceso
        </span>
        <span class="leyenda-item">
          <span class="leyenda-icon-muestra btn-icon btn-icon--cerrar" aria-hidden="true">
            <svg class="btn-icon-svg" viewBox="0 0 24 24" focusable="false">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </span>
          Cerrar incidente
        </span>
      </div>
      <p v-if="incidentesFiltrados.length === 0" class="sin-datos">No hay incidentes que coincidan con los filtros.</p>
      <p class="total">Total: {{ incidentesFiltrados.length }} incidente(s)</p>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal modal-editar card">
        <h3 class="modal-title">Editar reporte N° {{ editingId }}</h3>
        <form @submit.prevent="guardarEdicion" class="form-editar">
          <div class="form-group">
            <label>Tipo de incidente</label>
            <input :value="tipoEdicionNombre" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Fecha y hora</label>
            <input :value="fechaEdicionFija" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Parroquia</label>
            <input :value="parroquiaEdicionFija" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Municipio</label>
            <input v-model="formEditar.municipio" type="text" class="input" disabled />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formEditar.descripcion" class="input" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Calle, avenida o referencia</label>
            <input v-model="formEditar.via" type="text" class="input" maxlength="500" />
          </div>
          <div class="form-group">
            <label>Ubicación en mapa (opcional)</label>
            <div class="coords-row">
              <input v-model.number="formEditar.lat" type="number" step="any" class="input" placeholder="Latitud" />
              <input v-model.number="formEditar.lng" type="number" step="any" class="input" placeholder="Longitud" />
            </div>
            <div class="mapa-mini card">
              <MapaCarabobo
                :incidentes="puntoEdicionMapa"
                :centro="centroEdicionMapa"
                :zoom="14"
                permitir-click
                mostrar-buscador
                @ubicacion-seleccionada="asignarCoordenadasEdicion"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="guardando || cerrandoId != null">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
            <button
              v-if="editingAbierto"
              type="button"
              class="btn btn-cerrar"
              :disabled="cerrandoId != null"
              @click="confirmarCerrarDesdeModal"
            >
              {{ cerrandoId != null ? 'Cerrando…' : 'Cerrar incidente' }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="cerrandoId != null" @click="cerrarModal">Cancelar</button>
          </div>
          <p v-if="mensajeEditar" :class="mensajeEditarOk ? 'msg ok' : 'msg error'">{{ mensajeEditar }}</p>
        </form>
      </div>
    </div>

    <div
      v-if="mostrarModalResultado"
      class="modal-overlay modal-overlay--encima"
      @click.self="cancelarModalResultado"
    >
      <div class="modal card modal-resultado" role="dialog" aria-labelledby="titulo-resultado">
        <h3 id="titulo-resultado" class="modal-title">Resultado</h3>
        <p v-if="cierreDesdeEnProceso" class="resultado-ayuda">
          Este incidente estuvo <strong>en proceso</strong>. Indique heridos y/o fallecidos (use 0 si no hubo) y describa el
          resultado. El incidente quedará <strong>cerrado</strong>.
        </p>
        <p v-else class="resultado-ayuda">
          Cierre directo desde <strong>abierto</strong> (p. ej. duplicado o falso). Explique el motivo. No se registran
          víctimas en este tipo de cierre. El incidente quedará <strong>cerrado</strong>.
        </p>
        <div v-if="cierreDesdeEnProceso" class="form-group tabla-victimas-wrap">
          <label class="tabla-victimas-label">Personas afectadas</label>
          <table class="tabla-victimas-cierre" aria-label="Heridos y fallecidos al cierre">
            <thead>
              <tr>
                <th scope="col">Concepto</th>
                <th scope="col">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Heridos</td>
                <td>
                  <input
                    v-model.number="heridosCierreForm"
                    type="number"
                    min="0"
                    max="999999"
                    class="input input-num-cierre"
                    :disabled="enviandoResultadoCierre"
                    aria-label="Número de heridos"
                  />
                </td>
              </tr>
              <tr>
                <td>Fallecidos</td>
                <td>
                  <input
                    v-model.number="fallecidosCierreForm"
                    type="number"
                    min="0"
                    max="999999"
                    class="input input-num-cierre"
                    :disabled="enviandoResultadoCierre"
                    aria-label="Número de fallecidos"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="form-group">
          <label for="texto-resultado-cierre">Resultado</label>
          <textarea
            id="texto-resultado-cierre"
            v-model="textoResultadoCierre"
            class="input"
            rows="4"
            maxlength="4000"
            :disabled="enviandoResultadoCierre"
            placeholder="Escriba aquí…"
          />
        </div>
        <p v-if="errorResultadoCierre" class="msg error">{{ errorResultadoCierre }}</p>
        <div class="form-actions form-actions-resultado">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="enviandoResultadoCierre"
            @click="enviarResultadoCierre"
          >
            {{ enviandoResultadoCierre ? 'Guardando…' : 'Guardar' }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="enviandoResultadoCierre"
            @click="cancelarModalResultado"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalVerResultado"
      class="modal-overlay modal-overlay--encima modal-overlay--ver-resultado"
      @click.self="cerrarModalVerResultado"
    >
      <div class="modal card modal-ver-resultado" role="dialog" aria-labelledby="titulo-ver-resultado">
        <h3 id="titulo-ver-resultado" class="modal-title">Resultado del incidente</h3>
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
        <div class="form-actions form-actions-resultado">
          <button type="button" class="btn btn-secondary" @click="cerrarModalVerResultado">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import {
  obtenerIncidentes,
  actualizarIncidente,
  cerrarIncidente,
  actualizarEstadoIncidente,
} from '../api/incidentes'
import { obtenerUbicacionInversa } from '../api/geocoding.js'
import { TIPOS_INCIDENTE, MUNICIPIOS_CARABOBO, MAPA_CENTRO_CARABOBO, PARROQUIAS_POR_MUNICIPIO } from '../config/incidentes'
import { useCatalogoIncidentes } from '../composables/useCatalogoIncidentes'
import { descargarPdfTablaIncidentes } from '../utils/pdfTablaIncidentes.js'
import {
  etiquetaResultadoPdf,
  textoResultadoModalLeer,
  textoVictimasCierre,
  tieneRegistroVictimasCierre,
} from '../utils/resultadoIncidente.js'

const { categorias, tiposPlano } = useCatalogoIncidentes()

const tiposFiltroOpciones = computed(() => {
  if (categorias.value.length > 0) {
    return tiposPlano.value.map((t) => ({ id: t.id, nombre: t.nombre }))
  }
  return TIPOS_INCIDENTE.map((t) => ({ id: t.id, nombre: t.nombre }))
})

const incidentes = ref([])
const vistaLista = ref('abiertos')
const filtroTipo = ref('')
const filtroMunicipios = ref([])
const filtroParroquias = ref([])
const filtroTexto = ref('')
const municipioQuery = ref('')
const parroquiaQuery = ref('')
const abrirMunicipios = ref(false)
const abrirParroquias = ref(false)
const mostrarModal = ref(false)
const editingId = ref(null)
const tipoEdicionFijo = ref('')
const tipoEdicionNombre = ref('')
const fechaEdicionFija = ref('')
const parroquiaEdicionFija = ref('')
const editingAbierto = ref(true)
const cerrandoId = ref(null)
const cambiandoEstadoId = ref(null)
const guardando = ref(false)
const mensajeEditar = ref('')
const mensajeEditarOk = ref(false)
const descargandoPdf = ref(false)
const logoPdfDataUrl = ref(null)
const mostrarModalResultado = ref(false)
const incidenteResultadoCierre = ref(null)
const textoResultadoCierre = ref('')
const heridosCierreForm = ref(0)
const fallecidosCierreForm = ref(0)
const errorResultadoCierre = ref('')
const enviandoResultadoCierre = ref(false)

const cierreDesdeEnProceso = computed(() => incidenteResultadoCierre.value?.estado === 'en_proceso')
const avisoResultadoGuardado = ref('')
const errorCargaLista = ref('')
const mostrarModalVerResultado = ref(false)
const incidenteVerResultado = ref(null)
const ahoraMs = ref(Date.now())
const listaFetchMs = ref(Date.now())
let relojEdicion = null
let secuenciaReverseMunicipio = 0

const formEditar = ref({
  municipio: '',
  descripcion: '',
  via: '',
  lat: null,
  lng: null,
})

function incPerteneceAVista(inc, vista) {
  const cerr = inc.cerrado === true
  let est = 'abierto'
  if (cerr || inc.estado === 'cerrado') est = 'cerrado'
  else if (inc.estado === 'en_proceso') est = 'en_proceso'
  if (vista === 'cerrados') return est === 'cerrado'
  if (vista === 'en_proceso') return est === 'en_proceso'
  return est === 'abierto'
}

const conteoAbiertos = computed(() => incidentes.value.filter((i) => incPerteneceAVista(i, 'abiertos')).length)
const conteoEnProceso = computed(() => incidentes.value.filter((i) => incPerteneceAVista(i, 'en_proceso')).length)
const conteoCerrados = computed(() => incidentes.value.filter((i) => incPerteneceAVista(i, 'cerrados')).length)

function normalizarBusqueda(s) {
  if (s == null || s === '') return ''
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

const incidentesFiltrados = computed(() => {
  const todos = incidentes.value
  const salida = []
  for (let i = 0; i < todos.length; i++) {
    const inc = todos[i]
    if (!incPerteneceAVista(inc, vistaLista.value)) continue
    if (filtroTipo.value && inc.tipo !== filtroTipo.value) continue
    if (filtroMunicipios.value.length > 0 && !filtroMunicipios.value.includes(inc.municipio || '')) continue
    if (filtroParroquias.value.length > 0 && !filtroParroquias.value.includes(inc.parroquia || '')) continue
    const textoBuscar = filtroTexto.value.trim()
    if (textoBuscar) {
      const buscar = normalizarBusqueda(textoBuscar)
      let ok = false
      if (inc.descripcion && normalizarBusqueda(inc.descripcion).includes(buscar)) ok = true
      if (!ok && inc.tipo_nombre && normalizarBusqueda(inc.tipo_nombre).includes(buscar)) ok = true
      if (!ok && inc.tipo && normalizarBusqueda(String(inc.tipo)).includes(buscar)) ok = true
      if (!ok && inc.municipio && normalizarBusqueda(inc.municipio).includes(buscar)) ok = true
      if (!ok && inc.parroquia && normalizarBusqueda(String(inc.parroquia)).includes(buscar)) ok = true
      if (!ok && inc.via && normalizarBusqueda(String(inc.via)).includes(buscar)) ok = true
      if (!ok) continue
    }
    salida.push(inc)
  }
  salida.sort(function (a, b) {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  })
  return salida
})

const parroquiasOpcionesFiltro = computed(() => {
  const set = new Set()
  const municipiosSeleccionados = filtroMunicipios.value
  if (municipiosSeleccionados.length > 0) {
    // Unión de parroquias de todos los municipios seleccionados.
    for (const mun of municipiosSeleccionados) {
      const parroquias = PARROQUIAS_POR_MUNICIPIO[mun] || []
      for (const p of parroquias) {
        if (p) set.add(p)
      }
    }
  } else {
    // Sin municipio seleccionado: mostrar catálogo completo para facilitar filtrado.
    for (const parroquias of Object.values(PARROQUIAS_POR_MUNICIPIO)) {
      for (const p of parroquias || []) {
        if (p) set.add(p)
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
})

const municipiosFiltradosLista = computed(() => {
  const q = normalizarBusqueda(municipioQuery.value.trim())
  if (!q) return MUNICIPIOS_CARABOBO
  return MUNICIPIOS_CARABOBO.filter((m) => normalizarBusqueda(m).includes(q))
})

const parroquiasFiltradasLista = computed(() => {
  const q = normalizarBusqueda(parroquiaQuery.value.trim())
  if (!q) return parroquiasOpcionesFiltro.value
  return parroquiasOpcionesFiltro.value.filter((p) => normalizarBusqueda(p).includes(q))
})

watch(parroquiasOpcionesFiltro, (opciones) => {
  const permitidas = new Set(opciones)
  filtroParroquias.value = filtroParroquias.value.filter((p) => permitidas.has(p))
})

function toggleMunicipio(m) {
  const i = filtroMunicipios.value.indexOf(m)
  if (i >= 0) filtroMunicipios.value.splice(i, 1)
  else filtroMunicipios.value.push(m)
}

function toggleParroquia(p) {
  const i = filtroParroquias.value.indexOf(p)
  if (i >= 0) filtroParroquias.value.splice(i, 1)
  else filtroParroquias.value.push(p)
}

function quitarMunicipio(m) {
  filtroMunicipios.value = filtroMunicipios.value.filter((x) => x !== m)
}

function quitarParroquia(p) {
  filtroParroquias.value = filtroParroquias.value.filter((x) => x !== p)
}

function agregarPrimerMunicipio() {
  if (municipiosFiltradosLista.value.length === 0) return
  toggleMunicipio(municipiosFiltradosLista.value[0])
}

function agregarPrimeraParroquia() {
  if (parroquiasFiltradasLista.value.length === 0) return
  toggleParroquia(parroquiasFiltradasLista.value[0])
}

function onMunicipiosBlur() {
  setTimeout(() => { abrirMunicipios.value = false }, 160)
}

function onParroquiasBlur() {
  setTimeout(() => { abrirParroquias.value = false }, 160)
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleString('es-VE')
}

function formatearFechaTabla(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function textoEstadoListado(inc) {
  if (!inc) return '—'
  if (inc.cerrado === true || inc.estado === 'cerrado') return 'Cerrado'
  if (inc.estado === 'en_proceso') return 'En proceso'
  return 'Abierto'
}

function segundosDesdeRegistroEstimados(inc) {
  if (!inc) return Infinity
  const s = inc.segundos_desde_registro
  if (s != null && Number.isFinite(Number(s))) {
    const base = Number(s)
    const extra = (ahoraMs.value - listaFetchMs.value) / 1000
    return base + extra
  }
  if (!inc.fecha) return Infinity
  const t = new Date(inc.fecha).getTime()
  if (Number.isNaN(t)) return Infinity
  return (ahoraMs.value - t) / 1000
}

function esEditable(inc) {
  if (!inc || inc.cerrado === true || inc.estado === 'cerrado') return false
  return segundosDesdeRegistroEstimados(inc) < 120
}

function motivoBloqueoEdicion(inc) {
  if (!inc) return 'No se puede editar.'
  if (inc.cerrado === true) return 'No se puede editar: incidente cerrado.'
  return 'No se puede editar: pasaron más de 2 minutos desde el registro.'
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
  descargandoPdf.value = true
  try {
    const filas = incidentesFiltrados.value.map((inc) => [
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
    descargarPdfTablaIncidentes({
      logoDataUrl: logoPdfDataUrl.value,
      tituloPrincipal: 'Tabla de incidentes',
      lineasInfo: [`Generado: ${new Date().toLocaleString('es-VE')}`],
      tablaStartY: 30,
      filas,
      nombreArchivo: `tabla_incidentes_${stamp}.pdf`,
    })
  } catch (err) {
    console.error(err)
    alert('No se pudo generar el PDF. Si el problema continúa, recargue la página e intente de nuevo.')
  } finally {
    descargandoPdf.value = false
  }
}

function abrirEditar(inc) {
  if (!esEditable(inc)) {
    alert(motivoBloqueoEdicion(inc))
    return
  }
  editingId.value = inc.id
  tipoEdicionFijo.value = inc.tipo ? inc.tipo : ''
  tipoEdicionNombre.value = inc.tipo_nombre || inc.tipo || '—'
  fechaEdicionFija.value = formatearFecha(inc.fecha)
  parroquiaEdicionFija.value = inc.parroquia || '—'
  editingAbierto.value = inc.cerrado !== true
  let lat = null
  let lng = null
  if (inc.lat !== undefined && inc.lat !== null) lat = inc.lat
  if (inc.lng !== undefined && inc.lng !== null) lng = inc.lng

  formEditar.value = {
    municipio: inc.municipio ? inc.municipio : '',
    descripcion: inc.descripcion ? inc.descripcion : '',
    via: inc.via != null && inc.via !== '' ? String(inc.via) : '',
    lat: lat,
    lng: lng,
  }
  mensajeEditar.value = ''
  mostrarModal.value = true
}

const centroEdicionMapa = computed(() => {
  const f = formEditar.value
  if (f.lat != null && f.lng != null) {
    return { lat: f.lat, lng: f.lng }
  }
  return MAPA_CENTRO_CARABOBO
})

const puntoEdicionMapa = computed(() => {
  const f = formEditar.value
  if (f.lat != null && f.lng != null) {
    return [
      {
        lat: f.lat,
        lng: f.lng,
        tipo_nombre: 'Ubicación del reporte',
        categoria: 'otro',
      },
    ]
  }
  return []
})

function viaDesdeLabelBusquedaEdicion(label) {
  if (!label || typeof label !== 'string') return ''
  const primera = label.split(',')[0].trim()
  if (!primera || primera.length > 500) return ''
  const pNorm = normalizarBusqueda(primera)
  for (const m of MUNICIPIOS_CARABOBO) {
    if (normalizarBusqueda(m) === pNorm) return ''
  }
  return primera
}

async function asignarCoordenadasEdicion(coords) {
  formEditar.value.lat = coords.lat
  formEditar.value.lng = coords.lng
  const labelBusqueda = coords.label != null ? String(coords.label) : ''
  const seq = ++secuenciaReverseMunicipio
  const u = await obtenerUbicacionInversa(coords.lat, coords.lng)
  if (seq !== secuenciaReverseMunicipio) return
  if (u.municipio && MUNICIPIOS_CARABOBO.includes(u.municipio)) {
    formEditar.value.municipio = u.municipio
  }
  if (u.via && String(u.via).trim()) {
    formEditar.value.via = String(u.via).trim()
  } else if (labelBusqueda) {
    const desdeLabel = viaDesdeLabelBusquedaEdicion(labelBusqueda)
    if (desdeLabel) formEditar.value.via = desdeLabel
  }
}

function cerrarModal() {
  mostrarModal.value = false
  editingId.value = null
  tipoEdicionFijo.value = ''
  tipoEdicionNombre.value = ''
  fechaEdicionFija.value = ''
  parroquiaEdicionFija.value = ''
  editingAbierto.value = true
}

async function marcarEstadoOperativo(inc, estado) {
  if (!inc || cambiandoEstadoId.value != null) return
  cambiandoEstadoId.value = inc.id
  try {
    await actualizarEstadoIncidente(inc.id, estado)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
    errorCargaLista.value = ''
  } catch (e) {
    let msg = 'No se pudo actualizar el estado.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    alert(msg)
  } finally {
    cambiandoEstadoId.value = null
  }
}

function abrirModalResultado(inc) {
  if (!inc) return
  incidenteResultadoCierre.value = inc
  textoResultadoCierre.value = ''
  heridosCierreForm.value = 0
  fallecidosCierreForm.value = 0
  errorResultadoCierre.value = ''
  mostrarModalResultado.value = true
}

function cancelarModalResultado() {
  mostrarModalResultado.value = false
  incidenteResultadoCierre.value = null
  textoResultadoCierre.value = ''
  heridosCierreForm.value = 0
  fallecidosCierreForm.value = 0
  errorResultadoCierre.value = ''
}

function abrirModalVerResultado(inc) {
  incidenteVerResultado.value = inc
  mostrarModalVerResultado.value = true
}

function cerrarModalVerResultado() {
  mostrarModalVerResultado.value = false
  incidenteVerResultado.value = null
}

async function enviarResultadoCierre() {
  const inc = incidenteResultadoCierre.value
  const t = textoResultadoCierre.value.trim()
  if (!inc) return
  if (!t) {
    errorResultadoCierre.value = 'Escriba el resultado antes de guardar.'
    return
  }
  if (inc.cerrado === true || inc.estado === 'cerrado') {
    errorResultadoCierre.value = 'Este incidente ya está cerrado.'
    return
  }
  enviandoResultadoCierre.value = true
  errorResultadoCierre.value = ''
  cerrandoId.value = inc.id
  try {
    const payload = { resultado: t }
    if (inc.estado === 'en_proceso') {
      const h = Number(heridosCierreForm.value)
      const f = Number(fallecidosCierreForm.value)
      payload.heridos_cierre = Number.isFinite(h) && h >= 0 ? Math.min(999999, Math.floor(h)) : 0
      payload.fallecidos_cierre = Number.isFinite(f) && f >= 0 ? Math.min(999999, Math.floor(f)) : 0
    }
    await cerrarIncidente(inc.id, payload)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
    errorCargaLista.value = ''
    cancelarModalResultado()
    if (mostrarModal.value && editingId.value === inc.id) cerrarModal()
    avisoResultadoGuardado.value = 'Incidente cerrado correctamente.'
    window.setTimeout(() => {
      avisoResultadoGuardado.value = ''
    }, 8000)
  } catch (e) {
    let msg = 'No se pudo cerrar el incidente.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    errorResultadoCierre.value = msg
  } finally {
    enviandoResultadoCierre.value = false
    cerrandoId.value = null
  }
}

function confirmarCerrarDesdeFila(inc) {
  abrirModalResultado(inc)
}

function confirmarCerrarDesdeModal() {
  const id = editingId.value
  if (id == null) return
  const inc = incidentes.value.find((i) => i.id === id)
  if (!inc) return
  abrirModalResultado(inc)
}

async function guardarEdicion() {
  if (!tipoEdicionFijo.value) {
    mensajeEditar.value = 'No se pudo determinar el tipo del incidente.'
    mensajeEditarOk.value = false
    return
  }
  guardando.value = true
  mensajeEditar.value = ''
  try {
    const incBase = incidentes.value.find((i) => i.id === editingId.value)
    const payload = {
      tipo: tipoEdicionFijo.value,
      grupo_excel_id: incBase?.categoria,
      tipo_nombre_sugerido: tipoEdicionNombre.value,
      municipio: formEditar.value.municipio,
      descripcion: formEditar.value.descripcion,
      via: formEditar.value.via,
      lat: formEditar.value.lat,
      lng: formEditar.value.lng,
    }
    await actualizarIncidente(editingId.value, payload)
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
    errorCargaLista.value = ''
    cerrarModal()
  } catch (e) {
    let msg = 'Error al guardar. Intente de nuevo.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    mensajeEditar.value = msg
    mensajeEditarOk.value = false
  }
  guardando.value = false
}

function aplicarListaIncidentesDesdeApi(data) {
  incidentes.value = Array.isArray(data) ? data : []
  listaFetchMs.value = Date.now()
}

onMounted(async () => {
  try {
    aplicarListaIncidentesDesdeApi(await obtenerIncidentes())
    errorCargaLista.value = ''
  } catch (e) {
    errorCargaLista.value = e?.message || 'No se pudo cargar el listado.'
  }
  logoPdfDataUrl.value = await cargarLogoBase64()
  relojEdicion = setInterval(() => {
    ahoraMs.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (relojEdicion != null) {
    clearInterval(relojEdicion)
    relojEdicion = null
  }
})
</script>

<style scoped>
.incidentes-view {
  max-width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.titulo-acciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.35rem;
  flex-shrink: 0;
}
.incidentes-view .filtros.card {
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.4rem;
  flex-shrink: 0;
}
.titulo-acciones .page-title {
  margin-bottom: 0;
}
.filtros-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.55rem 0.75rem;
}
.combo {
  position: relative;
  border: 1px solid #c8d3e1;
  border-radius: var(--radius, 6px);
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}
.combo:focus-within,
.combo-abierto {
  border-color: rgba(0, 51, 204, 0.45);
  box-shadow: 0 0 0 3px rgba(0, 51, 204, 0.12);
}
.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.42rem 0.52rem 0.05rem;
}
.chip-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #e6efff;
  color: #163274;
  border: 1px solid #c8dcff;
  border-radius: 999px;
  padding: 0.18rem 0.42rem;
  font-size: 0.75rem;
  font-weight: 500;
}
.chip-x {
  border: none;
  background: transparent;
  color: #163274;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0;
}
.combo-input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  padding: 0.5rem 0.7rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--color-text, #1e293b);
  background: transparent;
  outline: none;
  border-radius: var(--radius, 6px);
}
.combo-lista {
  position: absolute;
  left: -1px;
  right: -1px;
  top: calc(100% + 2px);
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  max-height: min(240px, 42vh);
  overflow-y: auto;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius, 6px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  z-index: 30;
}
.combo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.48rem 0.72rem;
  font-size: 0.86rem;
  line-height: 1.35;
  cursor: pointer;
  color: var(--color-text, #1e293b);
}
.combo-item:hover {
  background: #eef4ff;
}
.combo-vacio {
  padding: 0.65rem 0.75rem;
  font-size: 0.8125rem;
  color: #94a3b8;
  cursor: default;
}
.incidentes-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0.6rem 0.75rem 0.5rem;
}
.tabla-wrap {
  flex: 1 1 0;
  min-height: 8.5rem;
  overflow-x: auto;
  overflow-y: auto;
}
.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.tabla th,
.tabla td {
  padding: 0.32rem 0.4rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  line-height: 1.3;
}
.tabla th {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--color-secondary);
  background: #f8fafc;
}
.tabla td {
  color: var(--color-text);
}
.th-n {
  width: 2.25rem;
}
.th-fecha {
  width: 6.5rem;
}
.th-resultado {
  width: 5.5rem;
}
.th-acc {
  width: 3.1rem;
}
.td-fecha {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-size: 0.78rem;
}
.td-resultado {
  white-space: nowrap;
}
.btn-resultado-tabla {
  padding: 0.28rem 0.45rem;
  font-size: 0.72rem;
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
.modal-overlay--ver-resultado {
  z-index: 1120;
}
.modal-ver-resultado {
  max-width: 520px;
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
.sin-resultado-msg {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.sin-datos {
  padding: 0.75rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
.total {
  padding: 0.4rem 0.1rem 0.15rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.leyenda-acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.5rem 0.1rem 0.35rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  border-bottom: 1px solid #e8edf3;
  flex-shrink: 0;
}
.leyenda-titulo {
  flex-basis: 100%;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  margin: 0;
}
.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.leyenda-icon-muestra {
  pointer-events: none;
  cursor: default;
  flex-shrink: 0;
}
.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
}
.acciones-btns {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-end;
}
.acciones-cell {
  width: 1%;
  white-space: nowrap;
  padding-left: 0.2rem;
}
.btn-icon {
  min-width: 1.9rem;
  min-height: 1.9rem;
  width: 1.9rem;
  height: 1.9rem;
  padding: 0;
  border-radius: 6px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.btn-icon:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn-icon-svg {
  display: block;
  width: 1rem;
  height: 1rem;
}
.btn-icon--editar {
  /* Azul cielo: buen contraste con icono, sin mancha oscura en la tabla */
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #7dd3fc;
  box-shadow: 0 1px 0 rgba(3, 105, 161, 0.08);
}
.btn-icon--editar:hover:not(:disabled) {
  background: #bae6fd;
  border-color: #38bdf8;
  color: #0c4a6e;
}
.btn-icon--proceso {
  border: 1px solid #fb923c;
  color: #c2410c;
  background: #fff7ed;
  box-shadow: 0 1px 0 rgba(194, 65, 12, 0.06);
}
.btn-icon--proceso:hover:not(:disabled) {
  background: #ffedd5;
  border-color: #f97316;
}
.btn-icon--cerrar {
  border: 1px solid #fb7185;
  color: #be123c;
  background: #fff1f2;
  box-shadow: 0 1px 0 rgba(190, 18, 60, 0.06);
}
.btn-icon--cerrar:hover:not(:disabled) {
  background: #ffe4e6;
  border-color: #f43f5e;
}
.btn-icon-svg--spin {
  animation: icon-spin-leyenda 0.7s linear infinite;
}
@keyframes icon-spin-leyenda {
  to {
    transform: rotate(360deg);
  }
}
.btn-cerrar {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background: #fff;
}
.btn-cerrar:hover:not(:disabled) {
  background: #fff5f5;
}
.badge-estado {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  white-space: nowrap;
  vertical-align: middle;
}
.badge-abierto {
  background: #ecfdf5;
  color: #047857;
}
.badge-proceso {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.badge-cerrado {
  background: #f1f5f9;
  color: #64748b;
}
.vista-por-estado {
  margin-bottom: 0.45rem;
  padding: 0.45rem 0.6rem;
  flex-shrink: 0;
}
.vista-por-estado-inner {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.vista-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #c8d3e1;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  font: inherit;
}
.vista-tab:hover {
  border-color: #94a3b8;
  background: #fff;
}
.vista-tab.activa {
  border-color: #0033cc;
  box-shadow: 0 0 0 2px rgba(0, 51, 204, 0.12);
  background: linear-gradient(180deg, #f0f4ff 0%, #e8efff 100%);
}
.vista-tab-titulo {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-secondary);
}
.vista-tab-sub {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.25;
}
.vista-tab-num {
  margin-top: 0.15rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0033cc;
}
.btn-proceso {
  border: 1px solid #d97706;
  color: #b45309;
  background: #fffbeb;
}
.btn-proceso:hover:not(:disabled) {
  background: #fef3c7;
}
@media (max-width: 720px) {
  .vista-por-estado-inner {
    grid-template-columns: 1fr;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-overlay--encima {
  z-index: 1100;
}
.modal-resultado {
  max-width: 520px;
}
.resultado-ayuda {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.45;
  margin-bottom: 1rem;
}
.tabla-victimas-wrap {
  margin-bottom: 1rem;
}
.tabla-victimas-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
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
  vertical-align: middle;
}
.tabla-victimas-cierre thead th {
  background: #f1f5f9;
  font-weight: 600;
}
.input-num-cierre {
  max-width: 8rem;
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
.form-actions-resultado {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}
.aviso-resultado {
  margin: 0 0 0.65rem;
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #0c4a6e;
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
  border-radius: var(--radius);
}
.aviso-lista-error {
  margin: 0 0 0.65rem;
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #7f1d1d;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius);
}
.modal {
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-editar {
  max-width: 640px;
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
.mapa-mini {
  padding: 0;
  overflow: hidden;
  height: 260px;
}
.modal-title {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: var(--color-secondary);
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
.hint-opcional {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--color-text-muted, #64748b);
}
@media (max-width: 768px) {
  .tabla th:nth-child(3),
  .tabla td:nth-child(3),
  .tabla th:nth-child(4),
  .tabla td:nth-child(4),
  .tabla th:nth-child(5),
  .tabla td:nth-child(5),
  .tabla th:nth-child(6),
  .tabla td:nth-child(6) {
    display: none;
  }
}
</style>
