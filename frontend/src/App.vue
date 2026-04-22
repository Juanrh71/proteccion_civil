<template>
  <div class="app">
    <AppHeader />
    <main :class="['main', { 'main-reportes-scroll': esVistaReportes }]">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const esVistaReportes = computed(() => route.name === 'Dashboard' || route.name === 'Reportes')
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
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
