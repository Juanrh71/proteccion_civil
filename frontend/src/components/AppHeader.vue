<template>
  <header class="header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon"></span>
        <span class="logo-text">Protección Civil Carabobo</span>
      </router-link>
      <nav class="nav">
        <template v-if="estaAutenticado">
          <router-link to="/" class="nav-link">Inicio</router-link>
          <router-link to="/mapa" class="nav-link">Mapa</router-link>
          <router-link to="/registrar" class="nav-link">Registrar</router-link>
          <router-link to="/incidentes" class="nav-link">Incidentes</router-link>
          <router-link to="/reportes" class="nav-link">Reportes</router-link>
          <span class="nav-user">{{ nombreUsuario }}</span>
          <button type="button" class="btn-logout" @click="cerrarSesion">Cerrar sesión</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Iniciar sesión</router-link>
          <router-link to="/registro" class="nav-link">Registrarse</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuario, estaAutenticado, logout } = useAuth()

const nombreUsuario = computed(() => {
  const u = usuario.value
  if (!u) return ''
  if (u.nombre && u.apellido) return `${u.nombre} ${u.apellido}`.trim()
  return u.correo || ''
})

function cerrarSesion() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: var(--color-secondary);
  color: white;
  box-shadow: var(--shadow-md);
}
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
}
.logo:hover {
  text-decoration: none;
  opacity: 0.9;
}
.logo-icon {
  font-size: 1.5rem;
}
.nav {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.nav-link {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.9375rem;
}
.nav-link:hover {
  background: rgba(255,255,255,0.1);
  color: white;
  text-decoration: none;
}
.nav-link.router-link-active {
  background: var(--color-primary);
  color: white;
}
.nav-user {
  color: rgba(255,255,255,0.95);
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
}
.btn-logout {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.5);
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.9375rem;
  cursor: pointer;
  font-weight: 500;
}
.btn-logout:hover {
  background: rgba(255,255,255,0.15);
}
</style>
