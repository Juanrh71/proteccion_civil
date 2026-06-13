import { ref, computed } from 'vue'
import * as authApi from '../api/auth'
import { cargarCatalogoIncidentes } from './useCatalogoIncidentes.js'

const token = ref(authApi.getToken())
const usuario = ref(authApi.getUsuario())

export function useAuth() {
  const estaAutenticado = computed(() => !!token.value)

  async function login(correo, password) {
    const data = await authApi.login(correo, password)
    token.value = authApi.getToken()
    usuario.value = authApi.getUsuario()
    await cargarCatalogoIncidentes()
    return data
  }

  async function registro(datos) {
    return authApi.registro(datos)
  }

  function listarUsuarios(estatus) {
    return authApi.listarUsuarios(estatus)
  }

  function cambiarEstatusUsuario(id, estatus, motivoBloqueo = '') {
    return authApi.cambiarEstatusUsuario(id, estatus, motivoBloqueo)
  }

  function logout() {
    authApi.logout()
    token.value = null
    usuario.value = null
    cargarCatalogoIncidentes()
  }

  function initFromStorage() {
    token.value = authApi.getToken()
    usuario.value = authApi.getUsuario()
  }

  function solicitarCodigoRecuperacion(correo) {
    return authApi.solicitarCodigoRecuperacion(correo)
  }

  function cambiarPasswordConCodigo(correo, codigo, password) {
    return authApi.cambiarPasswordConCodigo(correo, codigo, password)
  }

  return {
    token: computed(() => token.value),
    usuario: computed(() => usuario.value),
    estaAutenticado,
    login,
    registro,
    listarUsuarios,
    cambiarEstatusUsuario,
    logout,
    initFromStorage,
    getToken: authApi.getToken,
    solicitarCodigoRecuperacion,
    cambiarPasswordConCodigo,
  }
}

