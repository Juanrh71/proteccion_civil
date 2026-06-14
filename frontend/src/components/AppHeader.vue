<template>
  <header class="header">
    <div class="header-inner">
      <div class="header-brand">
        <router-link to="/" class="logo">
          <img src="/imagenes/logo.png" alt="Protección Civil y Administración de Desastres" class="logo-img" width="52" height="52" />
          <span class="logo-text">IASIEDAGREC</span>
        </router-link>
        <UserManualButton />
      </div>
      <nav class="nav">
        <template v-if="estaAutenticado">
          <template v-if="esAdmin">
            <router-link to="/usuarios" class="nav-link">Panel administrador</router-link>
          </template>
          <template v-else>
            <router-link to="/" class="nav-link">Inicio</router-link>
            <router-link to="/mapa" class="nav-link">Mapa en vivo</router-link>
            <router-link to="/registrar" class="nav-link">Registrar</router-link>
            <router-link to="/incidentes" class="nav-link">Incidentes</router-link>
            <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            <router-link to="/reportes" class="nav-link">Reportes</router-link>
          </template>
          <span class="nav-user">{{ nombreUsuario }}</span>
          <button type="button" class="btn-logout" @click="cerrarSesion">Cerrar sesión</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Iniciar sesión</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import UserManualButton from './UserManualButton.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuario, estaAutenticado, logout } = useAuth()
const esAdmin = computed(() => usuario.value?.rol === 'admin')

const nombreUsuario = computed(() => {
  const u = usuario.value
  if (!u) return ''
  if (u.nombre && u.apellido) return u.nombre + ' ' + u.apellido
  return u.correo ? u.correo : ''
})

function cerrarSesion() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: var(--color-royal-blue);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
  border-bottom: 3px solid var(--color-orange);
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
.header-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--color-white);
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
}
.logo:hover {
  text-decoration: none;
  opacity: 0.95;
}
.logo-img {
  display: block;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.logo-text {
  text-shadow: 0 1px 2px rgba(16, 16, 16, 0.2);
}
.nav {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.nav-link {
  color: rgba(255, 255, 255, 0.92);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.9375rem;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-white);
  text-decoration: none;
}
.nav-link.router-link-active {
  background: var(--color-burgundy);
  color: var(--color-white);
  box-shadow: 0 2px 0 var(--color-orange);
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
