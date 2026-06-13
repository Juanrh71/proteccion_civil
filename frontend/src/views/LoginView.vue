<template>
  <div :class="['auth-page', { 'auth-page--recovery': modoRecuperacion }]">
    <div class="auth-view">
      <div class="auth-logo-wrap">
        <img src="/imagenes/logo.png" alt="Protección Civil y Administración de Desastres" class="auth-logo" width="120" height="120" />
      </div>
      <h1 class="page-title">{{ modoRecuperacion ? 'Restablecer contraseña' : 'Iniciar sesión' }}</h1>

      <form v-if="!modoRecuperacion" @submit.prevent="enviar" class="form-auth card" autocomplete="off">
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
        <button type="button" class="link-button" @click="abrirRecuperacion">
          ¿Has olvidado la contraseña?
        </button>
        <p class="auth-link">
          Si no tiene cuenta, contacte al administrador.
        </p>
      </form>

      <form v-else @submit.prevent="confirmarRestablecimiento" class="form-auth card form-auth--recovery" autocomplete="off">
        <p class="recovery-help">
          Ingrese su correo para recibir un código de verificación. Luego coloque el código y su nueva contraseña.
        </p>
        <div class="recovery-email-row">
          <div class="form-group recovery-email-field">
            <label>Correo electrónico</label>
            <input
              v-model="recuperacion.correo"
              type="email"
              class="input"
              autocomplete="off"
            />
            <p v-if="erroresRecuperacion.correo" class="field-error">{{ erroresRecuperacion.correo }}</p>
          </div>
          <button
            type="button"
            class="btn btn-secondary recovery-code-btn"
            :disabled="enviandoCodigo"
            @click="solicitarCodigo"
          >
            {{ enviandoCodigo ? 'Enviando...' : 'Enviar código' }}
          </button>
        </div>
        <div class="form-group">
          <label>Código de verificación</label>
          <input
            v-model="recuperacion.codigo"
            type="text"
            class="input"
            inputmode="numeric"
            maxlength="6"
            autocomplete="off"
          />
          <p v-if="erroresRecuperacion.codigo" class="field-error">{{ erroresRecuperacion.codigo }}</p>
        </div>
        <div class="form-group">
          <label>Nueva contraseña</label>
          <input
            v-model="recuperacion.password"
            type="password"
            class="input"
            autocomplete="off"
          />
          <p v-if="erroresRecuperacion.password" class="field-error">{{ erroresRecuperacion.password }}</p>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="restableciendo">
            {{ restableciendo ? 'Guardando...' : 'Restablecer contraseña' }}
          </button>
        </div>
        <p v-if="mensajeRecuperacion" :class="mensajeRecuperacionOk ? 'msg ok' : 'msg error'">
          {{ mensajeRecuperacion }}
        </p>
        <button type="button" class="link-button" @click="volverLogin">
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, solicitarCodigoRecuperacion, cambiarPasswordConCodigo } = useAuth()

const form = ref({ correo: '', password: '' })
const errores = reactive({ correo: '', password: '' })
const mensajeGlobal = ref('')
const enviando = ref(false)
const modoRecuperacion = ref(false)
const recuperacion = ref({ correo: '', codigo: '', password: '' })
const erroresRecuperacion = reactive({ correo: '', codigo: '', password: '' })
const mensajeRecuperacion = ref('')
const mensajeRecuperacionOk = ref(false)
const enviandoCodigo = ref(false)
const restableciendo = ref(false)

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

function limpiarErroresRecuperacion() {
  erroresRecuperacion.correo = ''
  erroresRecuperacion.codigo = ''
  erroresRecuperacion.password = ''
}

function abrirRecuperacion() {
  modoRecuperacion.value = true
  recuperacion.value.correo = form.value.correo.trim()
  recuperacion.value.codigo = ''
  recuperacion.value.password = ''
  mensajeRecuperacion.value = ''
  mensajeRecuperacionOk.value = false
  limpiarErroresRecuperacion()
}

function volverLogin() {
  modoRecuperacion.value = false
  mensajeRecuperacion.value = ''
  mensajeRecuperacionOk.value = false
  limpiarErroresRecuperacion()
}

function validarCorreoRecuperacion() {
  limpiarErroresRecuperacion()
  const correo = recuperacion.value.correo.trim()
  if (!correo) {
    erroresRecuperacion.correo = 'El correo es requerido.'
    return false
  }
  if (!emailRegex.test(correo)) {
    erroresRecuperacion.correo = 'El correo no tiene un formato válido.'
    return false
  }
  return true
}

async function solicitarCodigo() {
  mensajeRecuperacion.value = ''
  mensajeRecuperacionOk.value = false
  if (!validarCorreoRecuperacion()) return
  enviandoCodigo.value = true
  try {
    const res = await solicitarCodigoRecuperacion(recuperacion.value.correo.trim())
    mensajeRecuperacion.value = res.message || 'Código enviado con éxito.'
    mensajeRecuperacionOk.value = true
  } catch (e) {
    let msg = 'No se pudo enviar el código.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    mensajeRecuperacion.value = msg
    mensajeRecuperacionOk.value = false
  } finally {
    enviandoCodigo.value = false
  }
}

async function confirmarRestablecimiento() {
  mensajeRecuperacion.value = ''
  mensajeRecuperacionOk.value = false
  if (!validarCorreoRecuperacion()) return
  const codigo = recuperacion.value.codigo.trim()
  if (!/^\d{6}$/.test(codigo)) {
    erroresRecuperacion.codigo = 'El código debe tener exactamente 6 dígitos.'
    return
  }
  if (!recuperacion.value.password || recuperacion.value.password.length < 6) {
    erroresRecuperacion.password = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }

  restableciendo.value = true
  try {
    const res = await cambiarPasswordConCodigo(
      recuperacion.value.correo.trim(),
      codigo,
      recuperacion.value.password
    )
    mensajeRecuperacion.value = res.message || 'Contraseña restablecida con éxito.'
    mensajeRecuperacionOk.value = true
    form.value.correo = recuperacion.value.correo.trim()
    form.value.password = ''
    setTimeout(() => volverLogin(), 1800)
  } catch (e) {
    let msg = 'No se pudo restablecer la contraseña.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    mensajeRecuperacion.value = msg
    mensajeRecuperacionOk.value = false
  } finally {
    restableciendo.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 0;
  padding: 0.25rem 1rem;
  overflow: hidden;
}
.auth-page--recovery {
  align-items: center;
}
.auth-view {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
.auth-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.3rem;
}
.auth-logo {
  display: block;
  width: 76px;
  height: 76px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 51, 204, 0.2);
  border: 3px solid rgba(255, 128, 0, 0.45);
}
.auth-page--recovery .auth-logo {
  width: 62px;
  height: 62px;
  border-width: 2px;
}
.auth-view .page-title {
  text-align: center;
  margin: 0 0 0.55rem;
  font-size: 1.35rem;
  line-height: 1.15;
}
.auth-page--recovery .page-title {
  margin-bottom: 0.45rem;
  font-size: 1.25rem;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-auth.card {
  padding: 1rem;
}
.form-auth--recovery {
  padding: 0.85rem 0.95rem;
  max-height: 100%;
  overflow: visible;
}
.form-auth .form-group {
  margin-bottom: 0.55rem;
}
.form-auth--recovery .form-group {
  margin-bottom: 0.45rem;
}
.form-auth--recovery .form-group label {
  font-size: 0.9rem;
  margin-bottom: 0.18rem;
}
.form-auth--recovery .input {
  padding: 0.5rem 0.7rem;
  font-size: 0.94rem;
}
.field-error {
  font-size: 0.78rem;
  color: var(--color-primary);
  margin-top: 0.15rem;
}
.form-actions {
  margin-top: 0.55rem;
}
.form-actions .btn {
  width: 100%;
  padding: 0.58rem 0.75rem;
}
.msg.error {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  color: var(--color-primary);
  text-align: center;
}
.msg.ok {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  color: var(--color-success);
  text-align: center;
}
.recovery-help {
  margin: 0 0 0.55rem;
  font-size: 0.82rem;
  line-height: 1.3;
  color: var(--color-text-muted);
  text-align: center;
}
.recovery-email-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.55rem;
  align-items: end;
  margin-bottom: 0.45rem;
}
.recovery-email-field {
  min-width: 0;
  margin-bottom: 0;
}
.recovery-code-btn {
  min-width: 7.5rem;
  padding: 0.5rem 0.7rem;
  white-space: nowrap;
}
.link-button {
  display: block;
  width: 100%;
  margin: 0.5rem 0 0;
  border: 0;
  background: transparent;
  color: var(--color-royal-blue);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
}
.link-button:hover {
  color: var(--color-burgundy);
  text-decoration: underline;
}
.auth-link {
  margin-top: 0.7rem;
  font-size: 0.88rem;
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

@media (max-width: 520px) {
  .auth-view {
    max-width: 100%;
  }
  .recovery-email-row {
    grid-template-columns: 1fr;
  }
  .recovery-code-btn {
    width: 100%;
  }
}

@media (max-height: 650px) {
  .auth-logo {
    width: 58px;
    height: 58px;
  }
  .auth-page--recovery .auth-logo {
    width: 48px;
    height: 48px;
  }
  .form-auth.card {
    padding: 0.75rem;
  }
  .recovery-help {
    display: none;
  }
}
</style>
