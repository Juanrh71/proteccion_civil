import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../api/auth'

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: () => import('../views/InicioView.vue'),
    meta: { title: 'Inicio', requiresAuth: true },
  },
  {
    path: '/mapa',
    name: 'Mapa',
    component: () => import('../views/MapaView.vue'),
    meta: { title: 'Mapa Geoespacial', requiresAuth: true },
  },
  {
    path: '/registrar',
    name: 'Registrar',
    component: () => import('../views/RegistrarView.vue'),
    meta: { title: 'Registrar Incidente', requiresAuth: true },
  },
  {
    path: '/incidentes',
    name: 'Incidentes',
    component: () => import('../views/IncidentesView.vue'),
    meta: { title: 'Listado de Incidentes', requiresAuth: true },
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../views/ReportesView.vue'),
    meta: { title: 'Reportes y Estadísticas', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Iniciar sesión' },
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('../views/RegistroView.vue'),
    meta: { title: 'Registrarse' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - Protección Civil Carabobo`
    : 'Protección Civil Carabobo'

  const token = getToken()
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  if ((to.path === '/login' || to.path === '/registro') && token) {
    next('/')
    return
  }
  next()
})

export default router
