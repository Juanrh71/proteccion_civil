<template>
  <div v-if="manual" class="manual-widget">
    <button
      type="button"
      class="manual-tab"
      :aria-expanded="abierto"
      aria-label="Abrir manual de uso"
      @click="abierto = !abierto"
    >
      <span class="manual-icon" aria-hidden="true">?</span>
      <span class="manual-label">Manual de uso</span>
    </button>

    <aside v-if="abierto" class="manual-panel" role="dialog" aria-label="Manual de uso de la vista">
      <div class="manual-head">
        <div>
          <span class="manual-kicker">Guía rápida</span>
          <h2>{{ manual.titulo }}</h2>
        </div>
        <button type="button" class="manual-close" aria-label="Cerrar manual" @click="abierto = false">×</button>
      </div>

      <p class="manual-desc">{{ manual.descripcion }}</p>

      <ul class="manual-list">
        <li v-for="item in manual.puntos" :key="item">{{ item }}</li>
      </ul>

      <p v-if="manual.nota" class="manual-note">{{ manual.nota }}</p>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const abierto = ref(false)

const MANUALES = {
  Inicio: {
    titulo: 'Inicio',
    descripcion:
      'Esta vista funciona como menú principal del sistema. Desde aquí se accede rápidamente a los módulos operativos.',
    puntos: [
      'Use las tarjetas para entrar al mapa, registro, incidentes, dashboard o reportes.',
      'El carrusel superior muestra imágenes institucionales del sistema.',
      'Si es administrador, el sistema lo dirige al panel administrativo.',
    ],
  },
  Mapa: {
    titulo: 'Mapa en vivo',
    descripcion:
      'Permite visualizar en el mapa los incidentes abiertos o en proceso y los reportes EDAN recientes dentro del estado Carabobo.',
    puntos: [
      'Use “Buscar por categoría” para filtrar por tipo de emergencia o grupo de incidente.',
      'Use “Buscar por región” para ubicar incidentes o reportes EDAN por municipio, parroquia o sector.',
      'Cada punto del mapa representa un incidente activo; al presionarlo se abre su información.',
      'Los círculos rosados son reportes EDAN enviados desde la app móvil (visibles durante 7 días).',
      'La leyenda indica el color correspondiente a cada categoría.',
    ],
    nota: 'Los incidentes cerrados no aparecen en el mapa en vivo.',
  },
  Registrar: {
    titulo: 'Registrar',
    descripcion:
      'En esta vista se registran nuevos incidentes y reportes EDAN desde el sistema web.',
    puntos: [
      'En “Incidente” complete tipo, municipio, parroquia, calle o avenida y ubicación.',
      'El sistema valida que el incidente pertenezca al estado Carabobo.',
      'En “EDAN” complete el formulario por pasos; puede avanzar o retroceder antes de guardar.',
      'Los campos obligatorios deben completarse antes de registrar.',
    ],
  },
  Incidentes: {
    titulo: 'Incidentes',
    descripcion:
      'Muestra el listado de incidentes registrados y los reportes EDAN, con filtros y acciones operativas.',
    puntos: [
      'Use las tarjetas “Abiertos”, “En proceso” y “Cerrados” para cambiar el listado visible.',
      'Los incidentes pueden editarse solo durante el tiempo permitido y si no están cerrados.',
      'Los botones de acción permiten editar, pasar a en proceso o cerrar un incidente.',
      'La pestaña EDAN muestra reportes EDAN y permite editarlos cuando sea necesario.',
      'Si el reporte llegó desde la app móvil y trae imagen, se muestra como evidencia adjunta.',
    ],
  },
  Dashboard: {
    titulo: 'Dashboard',
    descripcion:
      'Presenta una vista general de indicadores, tendencias, mapas y gráficos del comportamiento de incidentes.',
    puntos: [
      'Revise los totales y comparativas por período para tener una visión rápida del sistema.',
      'Use los filtros disponibles para analizar años, meses, municipios o categorías.',
      'Los gráficos ayudan a interpretar el comportamiento operativo y estadístico.',
      'El mapa resume la distribución geográfica de los incidentes.',
    ],
  },
  Reportes: {
    titulo: 'Reportes',
    descripcion:
      'Permite consultar reportes diarios, comparativas históricas, indicadores y reportes semanales.',
    puntos: [
      'Seleccione el tipo de reporte desde el menú superior de la vista.',
      'Use fechas, años, municipios o categorías para ajustar la información mostrada.',
      'La comparativa semanal permite seleccionar varias semanas y revisar sus diferencias.',
      'Use “Descargar PDF” para generar reportes formales cuando esté disponible.',
    ],
  },
  Usuarios: {
    titulo: 'Panel administrador',
    descripcion:
      'Reúne las funciones administrativas del sistema: usuarios, catálogo, auditoría y accesos.',
    puntos: [
      '“Registrar usuario nuevo” permite crear oficiales desde el panel web.',
      '“Ver usuarios y acceso” separa activos, pendientes y bloqueados.',
      'Los usuarios de la app móvil llegan a pendientes y deben aprobarse antes de ingresar.',
      'Al bloquear un usuario debe indicarse el motivo, que luego puede consultarse.',
      '“Catálogo de incidentes” permite administrar categorías y tipos visibles.',
      '“Auditoría de ediciones” muestra cambios realizados sobre reportes de incidentes.',
    ],
  },
  Login: {
    titulo: 'Inicio de sesión',
    descripcion:
      'Permite ingresar al sistema con las credenciales autorizadas o recuperar la contraseña.',
    puntos: [
      'Ingrese correo y contraseña para acceder.',
      'Si olvidó la contraseña, use la opción de recuperación.',
      'El código de verificación se envía al correo registrado.',
      'Los usuarios pendientes o bloqueados no pueden iniciar sesión hasta ser aprobados o desbloqueados.',
    ],
  },
}

const manual = computed(() => MANUALES[route.name] || null)

watch(
  () => route.name,
  () => {
    abierto.value = false
  }
)
</script>

<style scoped>
.manual-widget {
  position: relative;
  z-index: 1200;
  flex-shrink: 0;
}

.manual-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #0033cc;
  font-weight: 800;
  font-size: 0.78rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  white-space: nowrap;
}

.manual-tab:hover {
  background: #eef4ff;
}

.manual-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: #0033cc;
  color: #fff;
  font-size: 0.78rem;
  line-height: 1;
}

.manual-panel {
  position: absolute;
  top: calc(100% + 0.55rem);
  left: 0;
  width: min(360px, calc(100vw - 2rem));
  max-height: min(68vh, 560px);
  margin-top: 0;
  padding: 0.95rem;
  overflow-y: auto;
  border: 1px solid rgba(0, 51, 204, 0.16);
  border-radius: 16px;
  background: #ffffff;
  color: #1f2937;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
}

.manual-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.manual-kicker {
  display: inline-block;
  margin-bottom: 0.15rem;
  color: #b45309;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.manual-head h2 {
  margin: 0;
  color: #003378;
  font-size: 1.05rem;
}

.manual-close {
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 999px;
  background: #fee2e2;
  color: #7f1d1d;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.manual-desc {
  margin: 0.75rem 0 0.65rem;
  color: #334155;
  font-size: 0.88rem;
  line-height: 1.45;
}

.manual-list {
  margin: 0;
  padding-left: 1.1rem;
  color: #334155;
  font-size: 0.84rem;
  line-height: 1.45;
}

.manual-list li + li {
  margin-top: 0.35rem;
}

.manual-note {
  margin: 0.75rem 0 0;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 0.8rem;
  font-weight: 700;
}

@media (max-width: 720px) {
  .manual-label {
    display: none;
  }
}
</style>
