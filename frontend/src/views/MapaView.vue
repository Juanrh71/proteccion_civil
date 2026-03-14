<template>
  <div class="mapa-view">
    <h1 class="page-title">Mapa Geoespacial</h1>
    <p class="subtitle"></p>

    <div class="filtro-fecha card">
      <label class="filtro-label">Ver reportes del día:</label>
      <div class="fecha-selects">
        <select v-model.number="filtroDia" class="input">
          <option v-for="n in diasDelMes" :key="n" :value="n">{{ n }}</option>
        </select>
        <span class="fecha-sep">/</span>
        <select v-model.number="filtroMes" class="input">
          <option v-for="(nombre, idx) in MESES" :key="idx" :value="idx + 1">{{ nombre }}</option>
        </select>
        <span class="fecha-sep">/</span>
        <select v-model.number="filtroAno" class="input">
          <option v-for="y in anos" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div class="mapa-box card">
      <MapaCarabobo :incidentes="incidentesFiltrados" />
    </div>
    <div class="leyenda card">
      <h3>Leyenda por categoría</h3>
      <div class="leyenda-items">
        <span class="leyenda-item"><i style="background:#dc2626"></i> Médico / Salud</span>
        <span class="leyenda-item"><i style="background:#ea580c"></i> Vial</span>
        <span class="leyenda-item"><i style="background:#b91c1c"></i> Incendio</span>
        <span class="leyenda-item"><i style="background:#7c3aed"></i> Riesgo químico / GLP / MatPel</span>
        <span class="leyenda-item"><i style="background:#0284c7"></i> Rescate (SAR)</span>
        <span class="leyenda-item"><i style="background:#0d9488"></i> Socio-natural</span>
        <span class="leyenda-item"><i style="background:#059669"></i> Prevención</span>
        <span class="leyenda-item"><i style="background:#ca8a04"></i> Educación</span>
        <span class="leyenda-item"><i style="background:#6b7280"></i> Administrativo</span>
        <span class="leyenda-item"><i style="background:#64748b"></i> Otro</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MapaCarabobo from '../components/MapaCarabobo.vue'
import { obtenerIncidentes } from '../api/incidentes'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const incidentes = ref([])
const filtroDia = ref(1)
const filtroMes = ref(1)
const filtroAno = ref(2026)

const anoActual = new Date().getFullYear()
const anos = computed(() => {
  const list = []
  for (let y = 2026; y <= anoActual + 1; y++) list.push(y)
  return list
})

const diasDelMes = computed(() => {
  const mes = filtroMes.value || 1
  const ano = filtroAno.value || 2026
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

const incidentesFiltrados = computed(() => {
  const list = incidentes.value
  const dia = filtroDia.value
  const mes = filtroMes.value
  const ano = filtroAno.value
  return list.filter((inc) => {
    if (!inc.fecha) return false
    const d = new Date(inc.fecha)
    return d.getDate() === dia && d.getMonth() + 1 === mes && d.getFullYear() === ano
  })
})

onMounted(async () => {
  incidentes.value = await obtenerIncidentes()
})
</script>

<style scoped>
.mapa-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}
.filtro-fecha {
  padding: 1rem;
}
.filtro-label {
  display: block;
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}
.fecha-selects {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.fecha-selects .input {
  width: auto;
  min-width: 4.5rem;
  padding: 0.5rem 0.4rem;
}
.fecha-sep {
  color: var(--color-text-muted);
  font-weight: 600;
}
.filtro-hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
  margin-bottom: 0;
}
.mapa-box {
  padding: 0;
  overflow: hidden;
  height: 520px;
}
.leyenda h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-secondary);
}
.leyenda-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.leyenda-item i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
}
</style>
