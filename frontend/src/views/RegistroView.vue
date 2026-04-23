<template>
  <div :class="esModoAdmin ? 'auth-page admin-usuarios' : 'auth-page'">
    <div :class="esModoAdmin ? 'auth-view auth-view-admin' : 'auth-view auth-view-compact'">
      <div
        class="auth-logo-wrap"
        :class="{ 'auth-logo-wrap--admin-tight': esModoAdmin && panelAdmin }"
      >
        <img
          src="/imagenes/logo.png"
          alt="Protección Civil y Administración de Desastres"
          :class="['auth-logo', esModoAdmin && panelAdmin ? 'auth-logo--sm' : '']"
          width="96"
          height="96"
        />
      </div>
      <h1 v-if="!esModoAdmin || !panelAdmin" class="page-title">
        {{ esModoAdmin ? 'Usuarios' : 'Registrarse' }}
      </h1>

      <template v-if="esModoAdmin">
        <div v-if="!panelAdmin" class="admin-intro">
          <span class="admin-pill">Administraci&oacute;n</span>
          <p class="admin-lead">Elija una acci&oacute;n. Los usuarios creados aqu&iacute; quedan como <strong>oficial</strong>.</p>
        </div>
        <div v-if="!panelAdmin" class="admin-menu">
          <button type="button" class="admin-menu-card" @click="abrirPanel('registrar')">
            <span class="admin-menu-ico admin-menu-ico--add" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </span>
            <span class="admin-menu-text">
              <span class="admin-menu-title">Registrar usuario nuevo</span>
              <span class="admin-menu-desc">Alta con correo, c&eacute;dula y contrase&ntilde;a.</span>
            </span>
            <span class="admin-menu-arrow" aria-hidden="true">&rarr;</span>
          </button>
          <button type="button" class="admin-menu-card" @click="abrirPanel('activos')">
            <span class="admin-menu-ico admin-menu-ico--list" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
            <span class="admin-menu-text">
              <span class="admin-menu-title">Ver usuarios y acceso</span>
              <span class="admin-menu-desc">Listado, bloquear o desbloquear cuentas.</span>
            </span>
            <span class="admin-menu-arrow" aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div v-else class="admin-work">
          <div class="admin-toolbar">
            <button type="button" class="admin-btn-back" @click="volverMenu">
              <span class="admin-btn-back-ico" aria-hidden="true">&larr;</span>
              Men&uacute; principal
            </button>
            <div class="admin-toolbar-right">
              <h2 class="admin-toolbar-title">{{ panelTitulo }}</h2>
            </div>
          </div>

          <form
            v-if="panelAdmin === 'registrar'"
            @submit.prevent="enviar"
            class="form-auth card admin-surface admin-form"
            autocomplete="off"
          >
            <p class="admin-form-note">Nuevo usuario con rol <span class="rol-tag rol-tag--oficial">oficial</span></p>
            <p class="admin-section-label">Datos</p>
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
            <p class="admin-section-label">Acceso</p>
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
            <div class="form-actions form-actions-small admin-form-actions">
              <button type="submit" class="btn btn-primary admin-btn-primary" :disabled="enviando">
                {{ enviando ? 'Registrando...' : 'Registrar usuario' }}
              </button>
            </div>
            <p
              v-if="mensajeGlobal"
              :class="['msg', 'admin-form-msg', mensajeOk ? 'ok' : 'error']"
            >
              {{ mensajeGlobal }}
            </p>
          </form>

          <div v-else class="admin-surface admin-lista">
            <div class="lista-toolbar">
              <span class="lista-toolbar-label">Filtrar por estado</span>
              <div class="chip-group" role="group" aria-label="Filtro por estado">
                <button
                  type="button"
                  class="chip"
                  :class="{ 'chip--on': filtroEstatus === 'activo' }"
                  @click="cambiarFiltroEstatus('activo')"
                >
                  Activos
                </button>
                <button
                  type="button"
                  class="chip"
                  :class="{ 'chip--on': filtroEstatus === 'inactivo' }"
                  @click="cambiarFiltroEstatus('inactivo')"
                >
                  Bloqueados
                </button>
              </div>
            </div>
            <p v-if="errorLista" class="msg error msg-left admin-alert">{{ errorLista }}</p>
            <p
              v-else-if="!cargandoUsuarios && !usuarios.length"
              class="msg msg-muted msg-left admin-empty"
            >
              No hay usuarios en esta lista.
            </p>
            <p v-else-if="cargandoUsuarios" class="msg msg-muted msg-left admin-loading">Cargando usuarios&hellip;</p>
            <div v-else class="tabla-wrap">
              <table class="tabla-usuarios">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Documento</th>
                    <th>Tel&eacute;fono</th>
                    <th>Rol</th>
                    <th class="th-acc">Acci&oacute;n</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in usuarios" :key="u.id">
                    <td class="td-nombre">
                      <span class="td-nombre-text">{{ u.nombre }} {{ u.apellido }}</span>
                    </td>
                    <td class="td-mono">{{ u.correo }}</td>
                    <td class="td-mono">{{ u.cedula }}</td>
                    <td class="td-mono">{{ u.telefono }}</td>
                    <td>
                      <span v-if="u.rol === 'admin'" class="rol-tag rol-tag--admin">admin</span>
                      <span v-else-if="u.rol === 'oficial'" class="rol-tag rol-tag--oficial">oficial</span>
                      <span v-else class="rol-tag rol-tag--civil">civil</span>
                    </td>
                    <td class="td-acc">
                      <button
                        v-if="puedeBloquear(u)"
                        type="button"
                        class="btn btn-acc btn-acc--block"
                        :disabled="procesandoId === u.id"
                        @click="toggleBloqueo(u, 'inactivo')"
                      >
                        {{ procesandoId === u.id ? '...' : 'Bloquear' }}
                      </button>
                      <button
                        v-else-if="puedeDesbloquear(u)"
                        type="button"
                        class="btn btn-acc btn-acc--unblock"
                        :disabled="procesandoId === u.id"
                        @click="toggleBloqueo(u, 'activo')"
                      >
                        {{ procesandoId === u.id ? '...' : 'Desbloquear' }}
                      </button>
                      <span v-else class="td-acc-na" title="No aplica">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <form v-else @submit.prevent="enviar" class="form-auth card" autocomplete="off">
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
        <p v-if="!esModoAdmin" class="auth-link">
          ¿Ya tiene cuenta? <router-link to="/login">Iniciar sesión</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { getUsuario } from '../api/auth'

const PREFIJOS_CEDULA = [
  { value: 'V', label: 'V' },
  { value: 'J', label: 'J' },
  { value: 'E', label: 'E' },
]
const CODIGOS_TELEFONO = ['0412', '0414', '0416', '0422', '0424', '0426']

const router = useRouter()
const route = useRoute()
const { registro, listarUsuarios, cambiarEstatusUsuario } = useAuth()
const esModoAdmin = route.path === '/usuarios'
const me = computed(() => getUsuario())

const panelAdmin = ref(null) // null | 'registrar' | 'activos'
const filtroEstatus = ref('activo')
const usuarios = ref([])
const cargandoUsuarios = ref(false)
const errorLista = ref('')
const procesandoId = ref(null)

const panelTitulo = computed(() => {
  if (panelAdmin.value === 'registrar') return 'Registrar usuario nuevo'
  if (panelAdmin.value === 'activos') {
    return filtroEstatus.value === 'inactivo' ? 'Usuarios bloqueados' : 'Usuarios activos'
  }
  return ''
})

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

function abrirPanel(panel) {
  panelAdmin.value = panel
  if (panel === 'activos') {
    cargarUsuarios()
  }
}

function volverMenu() {
  panelAdmin.value = null
  errorLista.value = ''
  procesandoId.value = null
}

function cambiarFiltroEstatus(nuevo) {
  if (filtroEstatus.value === nuevo) return
  filtroEstatus.value = nuevo
  if (panelAdmin.value === 'activos') {
    cargarUsuarios()
  }
}

async function cargarUsuarios() {
  errorLista.value = ''
  cargandoUsuarios.value = true
  try {
    usuarios.value = await listarUsuarios(filtroEstatus.value)
  } catch (e) {
    let msg = 'No se pudo cargar la lista de usuarios.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    errorLista.value = msg
    usuarios.value = []
  } finally {
    cargandoUsuarios.value = false
  }
}

function esMismoUsuario(u) {
  return me.value && Number(me.value.id) === Number(u.id)
}

function puedeBloquear(u) {
  return u.estatus === 'activo' && u.rol !== 'admin' && !esMismoUsuario(u)
}

function puedeDesbloquear(u) {
  return u.estatus === 'inactivo' && u.rol !== 'admin' && !esMismoUsuario(u)
}

async function toggleBloqueo(u, estatus) {
  const accion = estatus === 'inactivo' ? 'bloquear' : 'desbloquear'
  // eslint-disable-next-line no-alert
  if (!window.confirm(`Seguro que desea ${accion} a ${u.nombre} ${u.apellido}?`)) return
  procesandoId.value = u.id
  errorLista.value = ''
  try {
    await cambiarEstatusUsuario(u.id, estatus)
    await cargarUsuarios()
  } catch (e) {
    let msg = 'No se pudo actualizar el usuario.'
    if (e.response && e.response.data && e.response.data.error) {
      msg = e.response.data.error
    }
    errorLista.value = msg
  } finally {
    procesandoId.value = null
  }
}

watch(filtroEstatus, () => {
  if (esModoAdmin && panelAdmin.value === 'activos') {
    cargarUsuarios()
  }
})

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
  } else if (telefonoNum.length !== 7) {
    errores.telefono = 'El número debe tener 7 dígitos (formato móvil Venezuela: 04xx + 7).'
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
    if (esModoAdmin) {
      mensajeGlobal.value = 'Usuario registrado correctamente.'
      if (panelAdmin.value === 'activos') {
        await cargarUsuarios()
      }
    } else {
      mensajeGlobal.value = 'Usuario registrado correctamente. Ya puede iniciar sesión.'
      setTimeout(() => router.push('/login'), 1500)
    }
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
.auth-logo-wrap--admin-tight {
  margin-bottom: 0.25rem;
}
.auth-logo--sm {
  width: 64px;
  height: 64px;
}
.auth-view-admin .page-title {
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
  color: var(--color-royal-blue);
}
@supports ((background-clip: text) or (-webkit-background-clip: text)) {
  .auth-view-admin .page-title {
    background: linear-gradient(120deg, var(--color-royal-blue) 0%, #1a47d4 50%, var(--color-burgundy) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}
.admin-usuarios {
  align-items: flex-start;
  padding: 1rem 0.75rem 1.75rem;
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(0, 51, 204, 0.12), transparent 55%),
    var(--color-surface);
  min-height: calc(100vh - 100px);
}
.auth-view-admin {
  max-width: 920px;
  width: 100%;
  padding: 0 0.25rem 1.5rem;
}
.admin-intro {
  text-align: center;
  max-width: 32rem;
  margin: 0 auto 1rem;
}
.admin-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-royal-blue);
  background: linear-gradient(180deg, #fff, var(--color-surface-card));
  border: 1px solid rgba(0, 51, 204, 0.2);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
}
.admin-lead {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--color-text-muted);
}
.admin-menu {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 0 auto 1rem;
  max-width: 880px;
}
.admin-menu-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
  border: 1px solid rgba(0, 51, 204, 0.14);
  border-radius: 14px;
  padding: 1rem 1rem 1rem 0.95rem;
  background: linear-gradient(145deg, #fff 0%, var(--color-surface-card) 100%);
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.12s ease;
  box-shadow: 0 2px 8px rgba(0, 35, 120, 0.06);
}
.admin-menu-card:hover {
  border-color: rgba(255, 128, 0, 0.45);
  box-shadow: 0 8px 24px rgba(0, 51, 204, 0.12);
  transform: translateY(-2px);
}
.admin-menu-card:active {
  transform: translateY(0);
}
.admin-menu-ico {
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-menu-ico--add {
  color: var(--color-royal-blue);
  background: rgba(0, 51, 204, 0.1);
}
.admin-menu-ico--list {
  color: var(--color-burgundy);
  background: rgba(128, 0, 0, 0.08);
}
.admin-menu-text {
  flex: 1;
  min-width: 0;
}
.admin-menu-title {
  display: block;
  font-weight: 700;
  font-size: 1.02rem;
  margin-bottom: 0.2rem;
  color: var(--color-text);
}
.admin-menu-desc {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}
.admin-menu-arrow {
  flex: 0 0 auto;
  align-self: center;
  color: var(--color-orange);
  font-size: 1.15rem;
  font-weight: 700;
  opacity: 0.85;
}
.admin-work {
  width: 100%;
}
.admin-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem 1rem;
  margin-bottom: 1rem;
  padding: 0.4rem 0.15rem;
}
.admin-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(0, 51, 204, 0.22);
  background: #fff;
  color: var(--color-royal-blue);
  font-size: 0.88rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 35, 120, 0.06);
}
.admin-btn-back:hover {
  background: var(--color-surface-card);
  box-shadow: 0 2px 8px rgba(0, 35, 120, 0.1);
}
.admin-btn-back-ico {
  font-size: 1rem;
  line-height: 1;
  opacity: 0.9;
}
.admin-toolbar-right {
  text-align: right;
  flex: 1;
  min-width: 0;
}
.admin-toolbar-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.01em;
}
.admin-surface {
  border-radius: 16px;
  border: 1px solid rgba(0, 51, 204, 0.12);
  background: #fff;
  box-shadow: 0 4px 18px rgba(0, 35, 120, 0.07);
  overflow: hidden;
}
.admin-form {
  padding: 1.15rem 1.2rem 1.3rem;
}
.admin-form .form-group-small {
  margin-bottom: 0.6rem;
}
.admin-form .input-small {
  border-radius: 10px;
  border-color: rgba(0, 0, 0, 0.1);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.admin-form .input-small:focus {
  outline: none;
  border-color: var(--color-royal-blue);
  box-shadow: 0 0 0 3px rgba(0, 51, 204, 0.12);
}
.admin-form-note {
  margin: 0 0 1rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--color-text);
  background: linear-gradient(90deg, rgba(0, 51, 204, 0.07), rgba(255, 128, 0, 0.06));
  border-radius: 10px;
  border: 1px solid rgba(0, 51, 204, 0.1);
}
.admin-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0.2rem 0 0.45rem;
}
.admin-form-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}
.admin-btn-primary {
  min-width: 10rem;
  padding: 0.75rem 1.15rem;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(128, 0, 0, 0.2);
}
.admin-btn-primary:disabled {
  opacity: 0.65;
  box-shadow: none;
}
.admin-form-msg {
  margin-top: 0.75rem;
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  font-size: 0.9rem;
  text-align: left;
}
.admin-form-msg.ok {
  background: rgba(13, 122, 74, 0.1);
  color: var(--color-success);
}
.admin-form-msg.error {
  background: rgba(128, 0, 0, 0.07);
  color: var(--color-primary);
}
.rol-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  line-height: 1.2;
}
.rol-tag--oficial {
  color: #0a4a7a;
  background: rgba(0, 51, 204, 0.12);
  border: 1px solid rgba(0, 51, 204, 0.15);
}
.rol-tag--civil {
  color: #3d3d45;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.rol-tag--admin {
  color: #5c1a1a;
  background: rgba(128, 0, 0, 0.1);
  border: 1px solid rgba(128, 0, 0, 0.18);
}
.admin-lista {
  padding: 0;
  border: none;
  box-shadow: none;
  background: transparent;
}
.admin-surface.admin-lista {
  padding: 0;
}
.lista-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 0.75rem;
  padding: 0.9rem 1.1rem;
  background: linear-gradient(180deg, var(--color-surface-card) 0%, #fff 100%);
  border-bottom: 1px solid rgba(0, 51, 204, 0.1);
}
.lista-toolbar-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.chip-group {
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  gap: 0.2rem;
}
.chip {
  border: none;
  background: transparent;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.chip:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.6);
}
.chip--on {
  background: #fff;
  color: var(--color-royal-blue);
  box-shadow: 0 1px 3px rgba(0, 35, 120, 0.12);
}
.chip--on:hover {
  color: var(--color-royal-blue);
}
.msg-left {
  text-align: left;
}
.msg-muted {
  color: var(--color-text-muted);
}
.admin-alert {
  margin: 0.75rem 1.1rem 0;
  padding: 0.5rem 0.7rem;
  border-radius: 10px;
  background: rgba(128, 0, 0, 0.07);
  font-size: 0.9rem;
}
.admin-empty,
.admin-loading {
  margin: 1rem 1.1rem 1.1rem;
  font-size: 0.95rem;
}
.td-mono {
  font-variant-numeric: tabular-nums;
  font-size: 0.88rem;
  word-break: break-word;
  color: #333;
}
.td-nombre {
  max-width: 9rem;
}
.td-nombre-text {
  font-weight: 600;
  color: var(--color-text);
}
.th-acc,
.td-acc {
  text-align: right;
  white-space: nowrap;
}
.td-acc-na {
  color: #b0b4bd;
  font-size: 1.1rem;
  padding-right: 0.2rem;
}
.btn-acc {
  min-width: 6.5rem;
  padding: 0.45rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: filter 0.12s ease, box-shadow 0.12s ease, transform 0.08s ease;
}
.btn-acc:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  filter: grayscale(0.1);
}
.btn-acc--block {
  background: linear-gradient(180deg, #b01010, var(--color-burgundy));
  color: #fff;
  box-shadow: 0 1px 4px rgba(128, 0, 0, 0.35);
  border-color: var(--color-burgundy-dark);
}
.btn-acc--block:hover:not(:disabled) {
  filter: brightness(1.05);
  box-shadow: 0 2px 8px rgba(128, 0, 0, 0.35);
}
.btn-acc--unblock {
  background: #fff;
  color: var(--color-royal-blue);
  border: 1px solid rgba(0, 51, 204, 0.35);
  box-shadow: 0 1px 2px rgba(0, 35, 120, 0.08);
}
.btn-acc--unblock:hover:not(:disabled) {
  background: var(--color-surface-card);
  border-color: var(--color-royal-blue);
}
.tabla-wrap {
  width: 100%;
  overflow-x: auto;
  padding: 0.25rem 0 0.25rem;
}
.tabla-usuarios {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
}
.tabla-usuarios thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f0f4fa;
  text-align: left;
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(0, 51, 204, 0.12);
}
.tabla-usuarios tbody td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
}
.tabla-usuarios tbody tr:nth-child(even) {
  background: rgba(0, 51, 204, 0.02);
}
.tabla-usuarios tbody tr:hover {
  background: rgba(255, 128, 0, 0.06);
}
@media (max-width: 900px) {
  .auth-view-admin {
    max-width: 100%;
  }
  .admin-menu {
    grid-template-columns: 1fr;
  }
  .admin-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .admin-toolbar-right {
    text-align: left;
  }
  .th-acc,
  .td-acc {
    text-align: center;
  }
  .td-acc {
    white-space: normal;
  }
  .td-acc .btn-acc {
    width: 100%;
  }
}
@media (max-width: 480px) {
  .form-row-tight {
    grid-template-columns: 1fr;
  }
}
</style>
