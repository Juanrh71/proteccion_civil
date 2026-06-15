<template>
  <article class="edan-planilla-oficial">
    <table class="planilla-grid" cellspacing="0" cellpadding="0">
      <colgroup>
        <col v-for="n in 24" :key="n" />
      </colgroup>

      <tbody>
      <!-- Encabezado institucional -->
      <tr class="planilla-head-row">
        <td colspan="4" class="planilla-head-left">
          <div class="justicia-emblema" aria-hidden="true">
            <span class="justicia-franja am"></span>
            <span class="justicia-franja az"></span>
            <span class="justicia-franja ro"></span>
            <span class="justicia-texto">JUSTICIA</span>
          </div>
        </td>
        <td colspan="16" class="planilla-head-center">
          <div class="planilla-titulo-caja">
            <div>Evaluacion de Daños Analisis y Necesidades</div>
            <div class="planilla-titulo-edan">EDAN</div>
            <div>REDAN CENTRAL - ZOEDAN CARABOBO</div>
          </div>
        </td>
        <td colspan="4" class="planilla-head-right">
          <img :src="logoPcUrl" alt="Protección Civil" class="planilla-logo-pc" crossorigin="anonymous" />
        </td>
      </tr>

      <!-- DATOS DE IDENTIFICACION -->
      <tr>
        <td colspan="24" class="planilla-seccion">DATOS DE IDENTIFICACION</td>
      </tr>
      <tr>
        <td colspan="2" class="lbl">Evaluador</td>
        <td colspan="4" class="val">{{ p.evaluador }}</td>
        <td colspan="1" class="lbl">CI</td>
        <td colspan="3" class="val">{{ p.evaluadorCi }}</td>
        <td colspan="1" class="lbl">Hora</td>
        <td colspan="2" class="val">{{ p.hora }}</td>
        <td colspan="1" class="lbl">Fecha</td>
        <td colspan="3" class="val">{{ p.fecha }}</td>
        <td colspan="2" class="lbl">Nro Planilla</td>
        <td colspan="5" class="val">{{ p.nroPlanilla }}</td>
      </tr>
      <tr>
        <td colspan="2" class="lbl">Propietario</td>
        <td colspan="5" class="val">{{ p.propietario }}</td>
        <td colspan="1" class="lbl">Edad</td>
        <td colspan="2" class="val">{{ p.edad }}</td>
        <td colspan="1" class="lbl">CI</td>
        <td colspan="4" class="val">{{ p.ci }}</td>
        <td colspan="2" class="lbl">Teléfonos</td>
        <td colspan="7" class="val">{{ p.telefonos }}</td>
      </tr>
      <tr>
        <td colspan="2" class="lbl">Municipio</td>
        <td colspan="4" class="val">{{ p.municipio }}</td>
        <td colspan="2" class="lbl">Parroquia</td>
        <td colspan="3" class="val">{{ p.parroquia }}</td>
        <td colspan="2" class="lbl">Sector</td>
        <td colspan="2" class="val">{{ p.sector }}</td>
        <td colspan="2" class="lbl">Casa Nº</td>
        <td colspan="1" class="val">{{ p.casaN }}</td>
        <td colspan="2" class="lbl">Urbanización</td>
        <td colspan="4" class="val">{{ p.urbanizacion }}</td>
      </tr>
      <tr>
        <td colspan="2" class="lbl">Dirección</td>
        <td colspan="22" class="val">{{ p.direccion }}</td>
      </tr>
      <tr>
        <td colspan="2" class="lbl">Coordenadas</td>
        <td colspan="1" class="lbl sm">Norte</td>
        <td colspan="3" class="val">{{ p.norte }}</td>
        <td colspan="1" class="lbl sm">Este</td>
        <td colspan="3" class="val">{{ p.este }}</td>
        <td colspan="2" class="lbl sm">Elevación</td>
        <td colspan="2" class="val">{{ p.elevacion }}</td>
        <td colspan="3" class="lbl">Nro. de Informe</td>
        <td colspan="3" class="val">{{ p.nroInforme }}</td>
        <td colspan="2" class="lbl">Fecha de Solicitud</td>
        <td colspan="2" class="val">{{ p.fechaSolicitud }}</td>
      </tr>

      <!-- Afectación -->
      <tr>
        <td colspan="3" class="lbl">Fecha afectación</td>
        <td colspan="3" class="val">{{ p.fechaAfectacion }}</td>
        <td colspan="4" class="lbl">Descripción de la afectación</td>
        <td colspan="14" class="val">{{ p.descripcionAfectacion }}</td>
      </tr>
      <tr>
        <td colspan="2" class="lbl chk">Anegación</td>
        <td colspan="1" class="val cen">{{ p.anegacion }}</td>
        <td colspan="2" class="lbl chk">Inundación</td>
        <td colspan="1" class="val cen">{{ p.inundacion }}</td>
        <td colspan="2" class="lbl chk">Deslizamiento</td>
        <td colspan="1" class="val cen">{{ p.deslizamiento }}</td>
        <td colspan="1" class="lbl chk">Otros:</td>
        <td colspan="1" class="val cen">{{ p.otros }}</td>
        <td colspan="13" class="val">{{ p.afectacionOtros }}</td>
      </tr>

      <!-- Condición vivienda -->
      <tr>
        <td colspan="4" class="planilla-seccion sm">CONDICION DE LA VIVIENDA</td>
        <td colspan="2" class="lbl chk">Afectada</td>
        <td colspan="1" class="val cen">{{ p.condAfectada }}</td>
        <td colspan="2" class="lbl chk">Alto riesgo</td>
        <td colspan="1" class="val cen">{{ p.condAltoRiesgo }}</td>
        <td colspan="2" class="lbl chk">Destruida</td>
        <td colspan="1" class="val cen">{{ p.condDestruida }}</td>
        <td colspan="11" class="val"></td>
      </tr>

      <!-- Tipo vivienda -->
      <tr>
        <td colspan="4" class="planilla-seccion sm">TIPO DE VIVIENDA</td>
        <td colspan="5" class="lbl chk">Anárquica o Improvisada</td>
        <td colspan="1" class="val cen">{{ p.tipoAnarquica }}</td>
        <td colspan="4" class="lbl chk">Casa convencional</td>
        <td colspan="1" class="val cen">{{ p.tipoConvencional }}</td>
        <td colspan="9" class="val"></td>
      </tr>

      <!-- Tabla afectados + resumen -->
      <tr>
        <td colspan="1" class="lbl cen">Nº</td>
        <td colspan="7" class="lbl cen">Nombre y Apellido</td>
        <td colspan="3" class="lbl cen">CI</td>
        <td colspan="2" class="lbl cen">Sexo</td>
        <td colspan="1" class="lbl cen">Edad</td>
        <td colspan="10" class="lbl cen">Resumen de afectación</td>
      </tr>
      <tr v-for="(fila, idx) in p.filasAfectados" :key="idx">
        <td colspan="1" class="val cen">{{ fila.n }}</td>
        <td colspan="7" class="val">{{ fila.nombre }}</td>
        <td colspan="3" class="val">{{ fila.ci }}</td>
        <td colspan="2" class="val cen">{{ fila.sexo }}</td>
        <td colspan="1" class="val cen">{{ fila.edad }}</td>
        <td v-if="idx === 0" colspan="10" :rowspan="8" class="val resumen-cell">{{ p.resumenAfectacion }}</td>
      </tr>

      <!-- Totales demográficos -->
      <tr>
        <td colspan="2" class="lbl sm">Lact. Fem</td>
        <td colspan="1" class="val cen">{{ p.lactFem }}</td>
        <td colspan="2" class="lbl sm">Ad. Fem</td>
        <td colspan="1" class="val cen">{{ p.adultosFem }}</td>
        <td colspan="2" class="lbl sm">Lact. Masc</td>
        <td colspan="1" class="val cen">{{ p.lactMasc }}</td>
        <td colspan="2" class="lbl sm">Ad. Masc</td>
        <td colspan="1" class="val cen">{{ p.adultosMasc }}</td>
        <td colspan="2" class="lbl sm">Niños Fem</td>
        <td colspan="1" class="val cen">{{ p.ninosFem }}</td>
        <td colspan="2" class="lbl sm">3era Fem</td>
        <td colspan="1" class="val cen">{{ p.terceraFem }}</td>
        <td colspan="2" class="lbl sm">Niños Mas</td>
        <td colspan="1" class="val cen">{{ p.ninosMasc }}</td>
        <td colspan="2" class="lbl sm">3era Masc</td>
        <td colspan="1" class="val cen">{{ p.terceraMasc }}</td>
      </tr>
      <tr>
        <td colspan="3" class="lbl">Total Personas</td>
        <td colspan="2" class="val cen">{{ p.totalPersonas }}</td>
        <td colspan="3" class="lbl">Nº de Familias</td>
        <td colspan="2" class="val cen">{{ p.nroFamilias }}</td>
        <td colspan="5" class="lbl">Personas con Discapacidad</td>
        <td colspan="9" class="val cen">{{ p.discapacitados }}</td>
      </tr>

      <!-- Pie: requerimientos, firma, observaciones -->
      <tr class="planilla-pie-row">
        <td colspan="8" class="val pie-box">
          <div class="pie-lbl">Requerimientos por afectacion</div>
          <div class="pie-texto">{{ p.requerimientos }}</div>
        </td>
        <td colspan="6" class="val pie-box">
          <div class="pie-line"><span>Nombre del evaluado:</span> {{ p.nombreEvaluado }}</div>
          <div class="pie-line"><span>CI:</span> {{ p.ciEvaluado }}</div>
          <div class="pie-line pie-firma"><span>Firma:</span></div>
        </td>
        <td colspan="10" class="val pie-box">
          <div class="pie-lbl">Observaciones:</div>
          <div class="pie-texto sm">{{ p.observaciones }}</div>
          <div class="pie-line">Perdidas De Enseres Total: {{ p.enseresTotal }}</div>
          <div class="pie-line">Perdidas De Enseres Parcial: {{ p.enseresParcial }}</div>
          <div class="pie-line">Sin Perdidas De Enseres: {{ p.enseresNo }}</div>
          <div class="pie-line">
            Falla de Servicios: Agua <strong>{{ p.fallaAgua || '__' }}</strong>
            Luz <strong>{{ p.fallaLuz || '__' }}</strong>
            Comida <strong>{{ p.fallaComida || '__' }}</strong>
          </div>
        </td>
      </tr>

      <tr>
        <td colspan="24" class="planilla-codigo">F-DGAGR-11 Ultima Revisión: Mayo 2025</td>
      </tr>
      </tbody>
    </table>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { buildPlanillaEdanModel } from '../utils/edanFormulario.js'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  logoPcUrl: { type: String, default: '/imagenes/logo.png' },
})

const p = computed(() => buildPlanillaEdanModel(props.data))
</script>

<style scoped>
.edan-planilla-oficial {
  width: 1123px;
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8px;
  line-height: 1.15;
}

.planilla-grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.planilla-grid td {
  border: 1px solid #000;
  padding: 1px 3px;
  vertical-align: top;
  word-break: break-word;
  overflow: hidden;
}

.lbl {
  font-weight: 700;
  font-size: 7.5px;
  background: #fff;
}
.lbl.sm {
  font-size: 7px;
}
.lbl.cen,
.val.cen {
  text-align: center;
}
.val {
  font-size: 8px;
  min-height: 14px;
}
.planilla-seccion {
  font-weight: 800;
  font-size: 8px;
  text-align: center;
  background: #fff;
  letter-spacing: 0.02em;
}
.planilla-seccion.sm {
  font-size: 7.5px;
  text-align: left;
}

.planilla-head-row td {
  border: 1px solid #000;
  vertical-align: middle;
  padding: 4px;
}
.planilla-head-left {
  width: 12%;
  text-align: center;
}
.planilla-head-center {
  width: 68%;
}
.planilla-head-right {
  width: 20%;
  text-align: center;
}

.justicia-emblema {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.justicia-franja {
  display: block;
  width: 46px;
  height: 5px;
}
.justicia-franja.am { background: #fcd116; }
.justicia-franja.az { background: #00247d; }
.justicia-franja.ro { background: #cf142b; }
.justicia-texto {
  font-weight: 800;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.planilla-titulo-caja {
  border: 2px solid #000;
  border-radius: 14px;
  padding: 6px 10px;
  text-align: center;
  font-weight: 700;
  font-size: 11px;
  line-height: 1.25;
}
.planilla-titulo-edan {
  font-size: 14px;
  font-weight: 900;
  margin: 2px 0;
}

.planilla-logo-pc {
  width: 62px;
  height: 62px;
  object-fit: contain;
}

.resumen-cell {
  vertical-align: top;
  font-size: 7.5px;
  line-height: 1.2;
}

.planilla-pie-row td {
  height: 72px;
}
.pie-box {
  vertical-align: top;
  padding: 3px 4px;
}
.pie-lbl {
  font-weight: 700;
  font-size: 7.5px;
  margin-bottom: 2px;
}
.pie-texto {
  font-size: 7.5px;
  min-height: 42px;
  white-space: pre-wrap;
}
.pie-texto.sm {
  min-height: 24px;
}
.pie-line {
  font-size: 7.5px;
  margin-top: 2px;
}
.pie-line span {
  font-weight: 700;
}
.pie-firma {
  margin-top: 14px;
  min-height: 18px;
  border-top: 1px solid #999;
  padding-top: 2px;
}

.planilla-codigo {
  border: none !important;
  font-size: 7px;
  padding-top: 2px;
}
</style>
