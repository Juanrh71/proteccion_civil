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
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { cargarCatalogoIncidentes } from './composables/useCatalogoIncidentes.js'

const route = useRoute()
onMounted(() => {
  cargarCatalogoIncidentes()
})
const scrollPrincipal = computed(
  () =>
    route.name === 'Dashboard' ||
    route.name === 'Reportes' ||
    route.name === 'Usuarios' ||
    route.name === 'Registrar'
)
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
