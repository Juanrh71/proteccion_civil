import { ref, computed } from 'vue'
import * as authApi from '../api/auth'

const token = ref(authApi.getToken())
const usuario = ref(authApi.getUsuario())

export function useAuth() {
  const estaAutenticado = computed(() => !!token.value)

  async function login(correo, password) {
    const data = await authApi.login(correo, password)
    token.value = authApi.getToken()
    usuario.value = authApi.getUsuario()
    return data
  }

  async function registro(datos) {
    return authApi.registro(datos)
  }

  function listarUsuarios(estatus) {
    return authApi.listarUsuarios(estatus)
  }

  function cambiarEstatusUsuario(id, estatus) {
    return authApi.cambiarEstatusUsuario(id, estatus)
  }

  function logout() {
    authApi.logout()
    token.value = null
    usuario.value = null
  }

  function initFromStorage() {
    token.value = authApi.getToken()
    usuario.value = authApi.getUsuario()
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
  }
}
