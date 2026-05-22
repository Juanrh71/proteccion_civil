<template>
  <div class="inicio">
    <section
      class="banner-carrusel"
      aria-label="Banners institucionales"
      aria-roledescription="carrusel"
      @mouseenter="pausarCarrusel"
      @mouseleave="reanudarCarrusel"
    >
      <div class="banner-carrusel-vista">
        <img
          v-for="(banner, idx) in banners"
          :key="banner.src"
          :src="banner.src"
          :alt="banner.alt"
          class="banner-slide"
          :class="{ activo: idx === indiceActual }"
          :loading="idx === 0 ? 'eager' : 'lazy'"
        />
      </div>

      <button
        type="button"
        class="banner-nav banner-nav--prev"
        aria-label="Banner anterior"
        @click="anterior"
      >
        ‹
      </button>
      <button
        type="button"
        class="banner-nav banner-nav--next"
        aria-label="Banner siguiente"
        @click="siguiente"
      >
        ›
      </button>

      <div class="banner-indicadores" role="tablist" aria-label="Seleccionar banner">
        <button
          v-for="(banner, idx) in banners"
          :key="`dot-${banner.src}`"
          type="button"
          class="banner-punto"
          :class="{ activo: idx === indiceActual }"
          :aria-label="`Ir al banner ${idx + 1}`"
          :aria-selected="idx === indiceActual"
          role="tab"
          @click="irA(idx)"
        />
      </div>
    </section>

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
import { ref, onMounted, onUnmounted } from 'vue'

const INTERVALO_MS = 5000

const banners = [
  { src: '/imagenes/banners1.jpeg', alt: 'Banner 1 - Protección Civil Carabobo' },
  { src: '/imagenes/banners2.jpeg', alt: 'Banner 2 - Protección Civil Carabobo' },
  { src: '/imagenes/banners3.jpeg', alt: 'Banner 3 - Protección Civil Carabobo' },
]

const indiceActual = ref(0)
let temporizador = null
let pausado = false

function siguiente() {
  indiceActual.value = (indiceActual.value + 1) % banners.length
}

function anterior() {
  indiceActual.value = (indiceActual.value - 1 + banners.length) % banners.length
}

function irA(idx) {
  indiceActual.value = idx
}

function iniciarCarrusel() {
  if (temporizador) clearInterval(temporizador)
  temporizador = setInterval(() => {
    if (!pausado) siguiente()
  }, INTERVALO_MS)
}

function pausarCarrusel() {
  pausado = true
}

function reanudarCarrusel() {
  pausado = false
}

onMounted(() => {
  iniciarCarrusel()
})

onUnmounted(() => {
  if (temporizador) clearInterval(temporizador)
})
</script>

<style scoped>
.inicio {
  max-width: 960px;
}

.banner-carrusel {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 24px rgba(0, 51, 204, 0.12);
  background: #0f172a;
}

.banner-carrusel-vista {
  position: relative;
  width: 100%;
  aspect-ratio: 21 / 7;
  min-height: 160px;
  max-height: 280px;
}

.banner-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.7s ease-in-out;
  pointer-events: none;
}

.banner-slide.activo {
  opacity: 1;
  pointer-events: auto;
}

.banner-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-secondary, #0f172a);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 0.1rem;
}

.banner-nav:hover {
  background: #fff;
}

.banner-nav--prev {
  left: 0.65rem;
}

.banner-nav--next {
  right: 0.65rem;
}

.banner-indicadores {
  position: absolute;
  bottom: 0.65rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  gap: 0.45rem;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.45);
}

.banner-punto {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.banner-punto.activo {
  background: #fff;
  transform: scale(1.25);
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
