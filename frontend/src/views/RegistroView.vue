<template>
  <div class="auth-page">
    <div class="auth-view auth-view-compact">
      <div class="auth-logo-wrap">
        <img src="/imagenes/logo.png" alt="Protección Civil y Administración de Desastres" class="auth-logo" width="96" height="96" />
      </div>
      <h1 class="page-title">Registrarse</h1>

      <form @submit.prevent="enviar" class="form-auth card" autocomplete="off">
      <div class="form-row form-row-tight">
        <div class="form-group form-group-small">
          <label>Nombre </label>
          <input v-model="form.nombre" type="text" class="input input-small" autocomplete="off" />
          <p v-if="errores.nombre" class="field-error">{{ errores.nombre }}</p>
        </div>
        <div class="form-group form-group-small">
          <label>Apellido </label>
          <input v-model="form.apellido" type="text" class="input input-small" autocomplete="off" />
          <p v-if="errores.apellido" class="field-error">{{ errores.apellido }}</p>
        </div>
      </div>
      <div class="form-group form-group-small">
        <label>Correo </label>
        <input v-model="form.correo" type="email" class="input input-small" autocomplete="off" />
        <p v-if="errores.correo" class="field-error">{{ errores.correo }}</p>
      </div>
      <div class="form-row form-row-tight">
        <div class="form-group form-group-small">
          <label>Cédula </label>
          <div class="cedula-row">
            <select v-model="form.cedulaPrefijo" class="input input-small input-prefijo" autocomplete="off">
              <option value=""></option>
              <option v-for="p in PREFIJOS_CEDULA" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
            <input v-model="form.cedulaNumero" type="text" class="input input-small input-numero" inputmode="numeric" maxlength="9" autocomplete="off" />
          </div>
          <p v-if="errores.cedula" class="field-error">{{ errores.cedula }}</p>
        </div>
        <div class="form-group form-group-small">
          <label>Teléfono </label>
          <div class="telefono-row">
            <select v-model="form.telefonoPrefijo" class="input input-small input-prefijo" autocomplete="off">
              <option value=""></option>
              <option v-for="c in CODIGOS_TELEFONO" :key="c" :value="c">{{ c }}</option>
            </select>
            <input v-model="form.telefonoNumero" type="text" class="input input-small input-numero" inputmode="numeric" maxlength="7" autocomplete="off" />
          </div>
          <p v-if="errores.telefono" class="field-error">{{ errores.telefono }}</p>
        </div>
      </div>
      <div class="form-row form-row-tight">
        <div class="form-group form-group-small">
          <label>Contraseña </label>
          <input v-model="form.password" type="password" class="input input-small" autocomplete="off" />
          <p v-if="errores.password" class="field-error">{{ errores.password }}</p>
        </div>
        <div class="form-group form-group-small">
          <label>Confirmar </label>
          <input v-model="form.confirmacion" type="password" class="input input-small" autocomplete="off" />
          <p v-if="errores.confirmacion" class="field-error">{{ errores.confirmacion }}</p>
        </div>
      </div>
      <div class="form-actions form-actions-small">
        <button type="submit" class="btn btn-primary btn-small" :disabled="enviando">
          {{ enviando ? 'Registrando...' : 'Registrarse' }}
        </button>
      </div>
      <p v-if="mensajeGlobal" :class="mensajeOk ? 'msg ok' : 'msg error'">{{ mensajeGlobal }}</p>
      <p class="auth-link">
        ¿Ya tiene cuenta? <router-link to="/login">Iniciar sesión</router-link>
      </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const PREFIJOS_CEDULA = [
  { value: 'V', label: 'V' },
  { value: 'J', label: 'J' },
  { value: 'E', label: 'E' },
]
const CODIGOS_TELEFONO = ['0412', '0414', '0416', '0422', '0424', '0426']

const router = useRouter()
const { registro } = useAuth()

const form = ref({
  nombre: '',
  apellido: '',
  correo: '',
  cedulaPrefijo: '',
  cedulaNumero: '',
  telefonoPrefijo: '',
  telefonoNumero: '',
  password: '',
  confirmacion: '',
})
const errores = reactive({
  nombre: '',
  apellido: '',
  correo: '',
  cedula: '',
  telefono: '',
  password: '',
  confirmacion: '',
})
const mensajeGlobal = ref('')
const mensajeOk = ref(false)
const enviando = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const soloDigitos = /^\d+$/

function validar() {
  const f = form.value
  errores.nombre = ''
  errores.apellido = ''
  errores.correo = ''
  errores.cedula = ''
  errores.telefono = ''
  errores.password = ''
  errores.confirmacion = ''
  let ok = true

  if (!f.nombre.trim()) {
    errores.nombre = 'El nombre es requerido.'
    ok = false
  }
  if (!f.apellido.trim()) {
    errores.apellido = 'El apellido es requerido.'
    ok = false
  }
  if (!f.correo.trim()) {
    errores.correo = 'El correo es requerido.'
    ok = false
  } else if (!emailRegex.test(f.correo)) {
    errores.correo = 'El correo no tiene un formato válido.'
    ok = false
  }
  if (!f.cedulaPrefijo) {
    errores.cedula = 'Seleccione el tipo de documento (V, J, E).'
    ok = false
  }
  const cedulaNum = (f.cedulaNumero || '').replace(/\s/g, '')
  if (!cedulaNum) {
    errores.cedula = 'Ingrese el número de cédula.'
    ok = false
  } else if (!soloDigitos.test(cedulaNum)) {
    errores.cedula = 'El número de cédula debe contener solo dígitos.'
    ok = false
  } else if (cedulaNum.length < 6 || cedulaNum.length > 9) {
    errores.cedula = 'El número debe tener entre 6 y 9 dígitos.'
    ok = false
  }
  if (!f.telefonoPrefijo) {
    errores.telefono = 'Seleccione el código de teléfono (0412, 0414, etc.).'
    ok = false
  }
  const telefonoNum = (f.telefonoNumero || '').replace(/\s/g, '')
  if (!telefonoNum) {
    errores.telefono = 'Ingrese el número de teléfono.'
    ok = false
  } else if (!soloDigitos.test(telefonoNum)) {
    errores.telefono = 'El número debe contener solo dígitos.'
    ok = false
  } else if (telefonoNum.length !== 6) {
    errores.telefono = 'El número debe tener 6 dígitos.'
    ok = false
  }
  if (!f.password) {
    errores.password = 'La contraseña es requerida.'
    ok = false
  } else if (f.password.length < 6) {
    errores.password = 'La contraseña debe tener al menos 6 caracteres.'
    ok = false
  }
  if (f.confirmacion !== f.password) {
    errores.confirmacion = 'La confirmación de contraseña no coincide.'
    ok = false
  }
  return ok
}

async function enviar() {
  mensajeGlobal.value = ''
  if (!validar()) return
  enviando.value = true
  try {
    const cedula = form.value.cedulaPrefijo + (form.value.cedulaNumero || '').replace(/\s/g, '')
    const telefono = form.value.telefonoPrefijo + (form.value.telefonoNumero || '').replace(/\s/g, '')
    await registro({
      nombre: form.value.nombre.trim(),
      apellido: form.value.apellido.trim(),
      correo: form.value.correo.trim(),
      cedula,
      telefono,
      password: form.value.password,
      confirmacion: form.value.confirmacion,
    })
    mensajeOk.value = true
    mensajeGlobal.value = 'Usuario registrado correctamente. Ya puede iniciar sesión.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    mensajeOk.value = false
    let msg = 'Error al registrarse. Intente de nuevo.'
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
  padding: 0.5rem;
}
.auth-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.35rem;
}
.auth-logo {
  display: block;
  width: 96px;
  height: 96px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(0, 51, 204, 0.18);
  border: 2px solid rgba(255, 128, 0, 0.4);
}
.auth-view-compact .page-title {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  text-align: center;
}
.auth-view-compact .subtitle {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
  color: var(--color-text-muted);
}
.auth-view {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}
.form-auth.card {
  padding: 1rem;
}
.form-row-tight {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.form-group-small {
  margin-bottom: 0.5rem;
}
.form-group-small label {
  font-size: 0.9375rem;
  margin-bottom: 0.2rem;
}
.input-small {
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
}
.cedula-row,
.telefono-row {
  display: flex;
  gap: 0.35rem;
}
.input-prefijo {
  flex: 0 0 auto;
  width: 3.5rem;
  padding: 0.5rem 0.35rem;
  font-size: 0.9375rem;
}
.cedula-row .input-prefijo {
  width: 2.75rem;
}
.input-numero {
  flex: 1;
  min-width: 0;
}
.field-error {
  font-size: 0.875rem;
  color: var(--color-primary);
  margin-top: 0.15rem;
}
.form-actions-small {
  margin-top: 0.5rem;
}
.btn-small {
  padding: 0.75rem;
  font-size: 0.9375rem;
}
.msg {
  margin-top: 0.5rem;
  font-size: 0.9375rem;
  text-align: center;
}
.msg.ok {
  color: var(--color-success);
}
.msg.error {
  color: var(--color-primary);
}
.auth-link {
  margin-top: 0.5rem;
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
@media (max-width: 480px) {
  .form-row-tight {
    grid-template-columns: 1fr;
  }
}
</style>
