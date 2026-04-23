<template>
  <div class="auth-page">
    <div class="auth-view">
      <div class="auth-logo-wrap">
        <img src="/imagenes/logo.png" alt="Protección Civil y Administración de Desastres" class="auth-logo" width="120" height="120" />
      </div>
      <h1 class="page-title">Iniciar sesión</h1>

      <form @submit.prevent="enviar" class="form-auth card" autocomplete="off">
        <div class="form-group">
          <label>Correo electrónico</label>
          <input
            v-model="form.correo"
            type="email"
            class="input"
            autocomplete="off"
          />
          <p v-if="errores.correo" class="field-error">{{ errores.correo }}</p>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            autocomplete="off"
          />
          <p v-if="errores.password" class="field-error">{{ errores.password }}</p>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="enviando">
            {{ enviando ? 'Entrando...' : 'Iniciar sesión' }}
          </button>
        </div>
        <p v-if="mensajeGlobal" class="msg error">{{ mensajeGlobal }}</p>
        <p class="auth-link">
          Si no tiene cuenta, contacte al administrador.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const form = ref({ correo: '', password: '' })
const errores = reactive({ correo: '', password: '' })
const mensajeGlobal = ref('')
const enviando = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar() {
  errores.correo = ''
  errores.password = ''
  let ok = true
  if (!form.value.correo.trim()) {
    errores.correo = 'El correo es requerido.'
    ok = false
  } else if (!emailRegex.test(form.value.correo)) {
    errores.correo = 'El correo no tiene un formato válido.'
    ok = false
  }
  if (!form.value.password) {
    errores.password = 'La contraseña es requerida.'
    ok = false
  }
  return ok
}

async function enviar() {
  mensajeGlobal.value = ''
  if (!validar()) return
  enviando.value = true
  try {
    await login(form.value.correo, form.value.password)
    router.push('/')
  } catch (e) {
    let msg = 'Credenciales incorrectas.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    mensajeGlobal.value = msg
  }
  enviando.value = false
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 2rem 1rem;
}
.auth-view {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}
.auth-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}
.auth-logo {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 51, 204, 0.2);
  border: 3px solid rgba(255, 128, 0, 0.45);
}
.auth-view .page-title {
  text-align: center;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-auth.card {
  padding: 2rem;
}
.form-auth .form-group {
  margin-bottom: 1.25rem;
}
.field-error {
  font-size: 0.875rem;
  color: var(--color-primary);
  margin-top: 0.25rem;
}
.form-actions {
  margin-top: 1.5rem;
}
.form-actions .btn {
  width: 100%;
  padding: 0.75rem;
}
.msg.error {
  margin-top: 1rem;
  font-size: 0.9375rem;
  color: var(--color-primary);
  text-align: center;
}
.auth-link {
  margin-top: 1.5rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  text-align: center;
}
.auth-link a {
  color: var(--color-royal-blue);
  font-weight: 600;
}
.auth-link a:hover {
  color: var(--color-burgundy);
}
</style>
