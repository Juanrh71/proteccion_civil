<template>
  <div class="inicio">
    <h1 class="page-title">Gestión de Incidentes</h1>

    <div class="grid-cards">
      <router-link to="/mapa" class="card card-link">
        <span class="card-icon"></span>
        <h2>Mapa Geoespacial</h2>
        <p>Visualice los incidentes en el mapa del estado Carabobo y analice zonas de mayor incidencia.</p>
      </router-link>
      <router-link to="/registrar" class="card card-link">
        <span class="card-icon"></span>
        <h2>Registrar Incidente</h2>
        <p>Registre un nuevo incidente con la clasificación oficial (emergente / no emergente), ubicación y detalles.</p>
      </router-link>
      <router-link to="/incidentes" class="card card-link">
        <span class="card-icon"></span>
        <h2>Listado de Incidentes</h2>
        <p>Consulte el listado de incidentes registrados con filtros y búsqueda.</p>
      </router-link>
      <router-link to="/reportes" class="card card-link">
        <span class="card-icon"></span>
        <h2>Reportes y Estadísticas</h2>
        <p>Estadísticas por tipo de incidente, municipio y categoría para la toma de decisiones.</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.inicio {
  max-width: 900px;
}
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.card-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
}
.card-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  text-decoration: none;
  color: inherit;
}
.card-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}
.card-link h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
}
.card-link p {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
