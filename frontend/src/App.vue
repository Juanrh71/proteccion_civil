<template>
  <div class="app">
    <AppHeader />
    <main :class="['main', { 'main-reportes-scroll': scrollPrincipal }]">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { cargarCatalogoIncidentes } from './composables/useCatalogoIncidentes.js'
import { obtenerIncidentes } from './api/incidentes.js'
import { getToken } from './api/auth.js'

const route = useRoute()

const INTERVALO_ALARMA_INCIDENTES_MS = 2000
let alarmaTimer = null
let alarmaInicializada = false
let audioHabilitado = false
let audioCtx = null
const incidentesMovilesVistos = new Set()

onMounted(() => {
  cargarCatalogoIncidentes()
  prepararAudioAlarma()
  iniciarMonitoreoIncidentesMoviles()
})

onUnmounted(() => {
  if (alarmaTimer != null) {
    clearInterval(alarmaTimer)
    alarmaTimer = null
  }
  window.removeEventListener('pointerdown', habilitarAudioAlarma)
  window.removeEventListener('keydown', habilitarAudioAlarma)
})

const scrollPrincipal = computed(
  () =>
    route.name === 'Dashboard' ||
    route.name === 'Reportes' ||
    route.name === 'Usuarios' ||
    route.name === 'Registrar'
)

function prepararAudioAlarma() {
  window.addEventListener('pointerdown', habilitarAudioAlarma, { once: true })
  window.addEventListener('keydown', habilitarAudioAlarma, { once: true })
}

function habilitarAudioAlarma() {
  try {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return
    audioCtx = audioCtx || new AudioContextCtor()
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    audioHabilitado = true
  } catch {
    audioHabilitado = false
  }
}

function sonarAlarmaIncidenteMovil() {
  try {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    audioCtx = audioCtx || (AudioContextCtor ? new AudioContextCtor() : null)
    if (!audioCtx) return
    if (!audioHabilitado && audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    const inicio = audioCtx.currentTime
    const beeps = [0, 0.28, 0.56]
    for (const offset of beeps) {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, inicio + offset)
      gain.gain.setValueAtTime(0.0001, inicio + offset)
      gain.gain.exponentialRampToValueAtTime(0.18, inicio + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, inicio + offset + 0.18)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(inicio + offset)
      osc.stop(inicio + offset + 0.2)
    }
  } catch {
    // El navegador puede bloquear sonido hasta que el usuario interactúe con la página.
  }
}

function esIncidenteMovil(inc) {
  return inc && String(inc.procedencia || '').trim().toLowerCase() === 'movil'
}

async function revisarIncidentesMoviles() {
  if (!getToken()) {
    alarmaInicializada = false
    incidentesMovilesVistos.clear()
    return
  }
  try {
    const lista = await obtenerIncidentes({ soloAbiertos: true })
    const idsActuales = new Set()
    let hayNuevoMovil = false
    for (const inc of lista) {
      if (!esIncidenteMovil(inc) || inc.id == null) continue
      const id = String(inc.id)
      idsActuales.add(id)
      if (alarmaInicializada && !incidentesMovilesVistos.has(id)) {
        hayNuevoMovil = true
      }
    }
    incidentesMovilesVistos.clear()
    for (const id of idsActuales) incidentesMovilesVistos.add(id)
    if (!alarmaInicializada) {
      alarmaInicializada = true
      return
    }
    if (hayNuevoMovil) sonarAlarmaIncidenteMovil()
  } catch {
    // Si la consulta falla, conservamos el último estado visto para evitar falsas alarmas.
  }
}

function iniciarMonitoreoIncidentesMoviles() {
  revisarIncidentesMoviles()
  alarmaTimer = setInterval(revisarIncidentesMoviles, INTERVALO_ALARMA_INCIDENTES_MS)
}
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
}

.main.main-reportes-scroll {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
</style>
