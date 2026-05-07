import { createRouter, createWebHistory } from 'vue-router'
import { getToken, getUsuario } from '../api/auth'

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
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Dashboard', requiresAuth: true },
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../views/ReportesListaView.vue'),
    meta: { title: 'Reportes', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Iniciar sesión' },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('../views/RegistroView.vue'),
    meta: { title: 'Usuarios', requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - IASIEDAGREC`
    : 'IASIEDAGREC'

  const token = getToken()
  const usuario = getUsuario()
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  if (to.meta.requiresAdmin && (!usuario || usuario.rol !== 'admin')) {
    next('/')
    return
  }
  if (token && usuario?.rol === 'admin' && to.path === '/') {
    next('/dashboard')
    return
  }
  if (to.path === '/login' && token) {
    next(usuario?.rol === 'admin' ? '/dashboard' : '/')
    return
  }
  next()
})

export default router
