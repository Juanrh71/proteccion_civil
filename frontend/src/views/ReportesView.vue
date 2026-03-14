<template>
  <div class="reportes-view">
    <h1 class="page-title">Reportes y Estadísticas</h1>
    <p class="subtitle">

    </p>

    <div class="resumen-cards">
      <div class="card resumen-card">
        <span class="resumen-numero">{{ total }}</span>
        <span class="resumen-etiqueta">Total incidentes</span>
      </div>
      <div class="card resumen-card">
        <span class="resumen-numero">{{ porTipo.length }}</span>
        <span class="resumen-etiqueta">Tipos distintos</span>
      </div>
      <div class="card resumen-card">
        <span class="resumen-numero">{{ municipiosConDatos.length }}</span>
        <span class="resumen-etiqueta">Municipios con registro</span>
      </div>
    </div>

    <div class="grid-reportes">
      <div class="card">
        <h3>Por tipo de incidente</h3>
        <ul class="lista-stats">
          <li v-for="item in porTipo" :key="item.tipo">
            <span class="stat-label">{{ item.tipo_nombre || item.tipo }}</span>
            <span class="stat-value">{{ item.cantidad }} ({{ item.porcentaje }}%)</span>
          </li>
        </ul>
      </div>
      <div class="card">
        <h3>Por municipio</h3>
        <ul class="lista-stats">
          <li v-for="item in porMunicipio" :key="item.municipio">
            <span class="stat-label">{{ item.municipio || 'Sin municipio' }}</span>
            <span class="stat-value">{{ item.cantidad }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="card">
      <h3>Distribución por categoría</h3>
      <div class="barras">
        <div v-for="item in porCategoria" :key="item.categoria" class="barra-item">
          <span class="barra-label">{{ item.categoria }}</span>
          <div class="barra-wrap">
            <div class="barra" :style="{ width: item.porcentaje + '%' }"></div>
          </div>
          <span class="barra-valor">{{ item.cantidad }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerIncidentes } from '../api/incidentes'

const incidentes = ref([])
const total = computed(() => incidentes.value.length)

const porTipo = computed(() => {
  const map = {}
  incidentes.value.forEach((i) => {
    const key = i.tipo || 'otro'
    const nombre = i.tipo_nombre || key
    if (!map[key]) map[key] = { tipo: key, tipo_nombre: nombre, cantidad: 0 }
    map[key].cantidad++
  })
  const list = Object.values(map).sort((a, b) => b.cantidad - a.cantidad)
  const tot = incidentes.value.length
  list.forEach((x) => (x.porcentaje = tot ? ((x.cantidad / tot) * 100).toFixed(1) : 0))
  return list
})

const porMunicipio = computed(() => {
  const map = {}
  incidentes.value.forEach((i) => {
    const key = i.municipio || 'Sin municipio'
    if (!map[key]) map[key] = { municipio: key, cantidad: 0 }
    map[key].cantidad++
  })
  return Object.values(map).sort((a, b) => b.cantidad - a.cantidad)
})

const municipiosConDatos = computed(() => {
  const set = new Set(incidentes.value.map((i) => i.municipio).filter(Boolean))
  return [...set]
})

const porCategoria = computed(() => {
  const map = {}
  incidentes.value.forEach((i) => {
    const key = i.categoria || 'otro'
    if (!map[key]) map[key] = { categoria: key, cantidad: 0 }
    map[key].cantidad++
  })
  const list = Object.values(map).sort((a, b) => b.cantidad - a.cantidad)
  const tot = incidentes.value.length
  list.forEach((x) => (x.porcentaje = tot ? (x.cantidad / tot) * 100 : 0))
  return list
})

onMounted(async () => {
  incidentes.value = await obtenerIncidentes()
})
</script>

<style scoped>
.reportes-view {
  max-width: 1000px;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}
.resumen-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.resumen-card {
  text-align: center;
  padding: 1.25rem;
}
.resumen-numero {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}
.resumen-etiqueta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.grid-reportes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.grid-reportes h3,
.card > h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: 1rem;
}
.lista-stats {
  list-style: none;
}
.lista-stats li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9375rem;
}
.stat-label {
  flex: 1;
  margin-right: 0.5rem;
}
.stat-value {
  font-weight: 600;
  color: var(--color-secondary);
}
.barras {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.barra-item {
  display: grid;
  grid-template-columns: 140px 1fr 50px;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
}
.barra-label {
  text-transform: capitalize;
  color: var(--color-text);
}
.barra-wrap {
  height: 24px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.barra {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s;
}
.barra-valor {
  font-weight: 600;
  color: var(--color-secondary);
  text-align: right;
}
</style>
