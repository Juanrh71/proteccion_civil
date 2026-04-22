<template>
  <div class="inicio">
    <div class="inicio-logo-wrap">
    </div>
    <h1 class="page-title">Gestión de Incidentes</h1>

    <div class="grid-cards">
      <router-link to="/mapa" class="card card-link">
        <span class="card-icon"></span>
        <h2>Mapa en vivo</h2>
      </router-link>
      <router-link to="/registrar" class="card card-link">
        <span class="card-icon"></span>
        <h2>Registrar Incidente</h2>
      </router-link>
      <router-link to="/incidentes" class="card card-link">
        <span class="card-icon"></span>
        <h2>Listado de Incidentes</h2>
      </router-link>
      <router-link to="/dashboard" class="card card-link">
        <span class="card-icon"></span>
        <h2>Dashboard</h2>
      </router-link>
      <router-link to="/reportes" class="card card-link">
        <span class="card-icon"></span>
        <h2>Reportes</h2>
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
.inicio-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}
.inicio-logo {
  display: block;
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 51, 204, 0.15);
  border: 3px solid rgba(255, 128, 0, 0.35);
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
  border-color: rgba(255, 128, 0, 0.35);
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
  color: var(--color-royal-blue);
  margin-bottom: 0.5rem;
}
.card-link p {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
