/**
 * Composable de autenticación: estado reactivo, login, registro, logout.
 */
import { ref, computed } from 'vue'
import * as authApi from '../api/auth'

const token = ref(authApi.getToken())
const usuario = ref(authApi.getUsuario())

export function useAuth() {
  const estaAutenticado = computed(() => !!token.value)

  function setAuthState(newToken, newUsuario) {
    token.value = newToken
    usuario.value = newUsuario
  }

  async function login(correo, password) {
    const data = await authApi.login(correo, password)
    setAuthState(authApi.getToken(), authApi.getUsuario())
    return data
  }

  async function registro(datos) {
    return authApi.registro(datos)
  }

  function logout() {
    authApi.logout()
    setAuthState(null, null)
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
    logout,
    initFromStorage,
    getToken: authApi.getToken,
  }
}
