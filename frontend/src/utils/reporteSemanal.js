import { grupoExcelDeIncidente } from './clasificacionExcelIncidentes.js'

const MESES_CORTO = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const DIAS_CORTO = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']

/** Lunes como inicio de semana (como el reporte institucional). */
export function inicioSemanaISO(anio, semana) {
  const d = new Date(Date.UTC(anio, 0, 4))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1 + (semana - 1) * 7)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export function finSemanaISO(anio, semana) {
  const ini = inicioSemanaISO(anio, semana)
  const fin = new Date(ini)
  fin.setDate(fin.getDate() + 6)
  fin.setHours(23, 59, 59, 999)
  return fin
}

export function numeroSemanaDeFecha(fecha) {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const semana1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - semana1) / 86400000 - 3 + ((semana1.getDay() + 6) % 7)) / 7)
}

export function anioISODeFecha(fecha) {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return null
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  return d.getFullYear()
}

/** Incidente con cierre registrado en el sistema. */
export function incidenteCerrado(inc) {
  return inc?.cerrado === true || inc?.estado === 'cerrado'
}

export function incidenteEnSemana(inc, anio, semana) {
  const f = inc?.fecha ? new Date(inc.fecha) : null
  if (!f || Number.isNaN(f.getTime())) return false
  const y = anioISODeFecha(f)
  const w = numeroSemanaDeFecha(f)
  return y === anio && w === semana
}

/** Cuenta solo reportes de la semana (fecha de registro) que ya están cerrados. */
export function incidenteEnSemanaCerrado(inc, anio, semana) {
  return incidenteEnSemana(inc, anio, semana) && incidenteCerrado(inc)
}

function fmtDiaCorto(d) {
  return `${DIAS_CORTO[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${MESES_CORTO[d.getMonth()]}${String(d.getFullYear()).slice(-2)}`
}

export function etiquetaSemanaCorta(anio, semana) {
  return `Semana ${semana}`
}

export function etiquetaPortadaSemana(anio, semana) {
  const ini = inicioSemanaISO(anio, semana)
  const fin = finSemanaISO(anio, semana)
  return `SEM_${semana}_${anio}  ( ${fmtDiaCorto(ini)}  AL ${fmtDiaCorto(fin)} )`
}

export function formatoPorcentaje(valor) {
  if (valor == null || Number.isNaN(valor)) return '—'
  const n = Number(valor)
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}

export function calcularPorcentajeCambio(anterior, actual) {
  const a = Number(anterior) || 0
  const b = Number(actual) || 0
  if (a === 0 && b === 0) return 0
  if (a === 0) return b > 0 ? 100 : 0
  return ((b - a) / a) * 100
}

function slugTipo(inc) {
  return String(inc?.tipo || '').trim()
}

function esGrupo(inc, grupo) {
  return grupoExcelDeIncidente(inc) === grupo
}

function coincideTipos(inc, tipos) {
  const s = slugTipo(inc)
  return tipos.length > 0 && tipos.includes(s)
}

function sumaVictimas(lista, campo) {
  let t = 0
  for (const inc of lista) {
    if (!esGrupo(inc, 'hecho_vial')) continue
    const v = Number(inc[campo])
    if (Number.isFinite(v) && v > 0) t += v
  }
  return t
}

/** Filas alineadas al PowerPoint institucional. */
export const SECCIONES_REPORTE_SEMANAL = [
  {
    id: 'ambulancia',
    titulo: 'SERVICIOS DE AMBULANCIA',
    filas: [
      {
        nombre: 'Traslados Emergentes',
        contar: (lista) =>
          lista.filter(
            (i) =>
              esGrupo(i, 'solicitud_traslado') &&
              /emergent/i.test(String(i.resultado_cierre || i.tipo_nombre || ''))
          ).length,
      },
      {
        nombre: 'Traslados no Emergentes',
        contar: (lista) =>
          lista.filter(
            (i) =>
              esGrupo(i, 'solicitud_traslado') &&
              !/emergent/i.test(String(i.resultado_cierre || i.tipo_nombre || ''))
          ).length,
      },
      {
        nombre: 'Estabilizados en el sitio',
        contar: (lista) =>
          lista.filter((i) => /estabilizad/i.test(String(i.resultado_cierre || ''))).length,
      },
      {
        nombre: 'Traslados sin efecto',
        contar: (lista) => lista.filter((i) => /sin efecto/i.test(String(i.resultado_cierre || ''))).length,
      },
      {
        nombre: 'Se negó al servicio',
        contar: (lista) => lista.filter((i) => /neg[oó]/i.test(String(i.resultado_cierre || ''))).length,
      },
    ],
  },
  {
    id: 'hechos_viales',
    titulo: 'HECHOS VIALES',
    filas: [
      { nombre: 'Colisión Moto - Vehículo', tipos: ['colision_moto_vehiculo'] },
      { nombre: 'Colisión Moto – Moto', tipos: ['colision_moto_moto'] },
      { nombre: 'Derrape de Moto', tipos: ['derrape_de_moto'] },
      { nombre: 'Choque contra objeto fijo', tipos: ['choque_contra_objeto_fijo'] },
      { nombre: 'Arrollado', tipos: ['arrollado_peaton', 'colision_vehiculo_moto_arrollado'] },
      { nombre: 'Volcamiento de Vehículo', tipos: ['volcamiento_de_vehiculo', 'volcamiento_de_vehiculo_de_carga', 'volcamiento_de_unidad_colectiva', 'volcamiento_de_carga'] },
    ],
    grupoExtra: 'hecho_vial',
  },
  {
    id: 'victimas',
    titulo: 'LESIONADOS Y FALLECIDOS EN HECHOS VIALES',
    filas: [
      { nombre: 'Lesionados', contar: (lista) => sumaVictimas(lista, 'heridos_cierre') },
      { nombre: 'Fallecidos', contar: (lista) => sumaVictimas(lista, 'fallecidos_cierre') },
    ],
  },
  {
    id: 'incendios',
    titulo: 'INCENDIOS',
    filas: [
      { nombre: 'Incendio de Vegetación', tipos: ['vegetacion'] },
      { nombre: 'Incendio de Estructura', tipos: ['estructura'] },
      { nombre: 'Incendio de Vehículo', tipos: ['vehiculo_incendio'] },
      { nombre: 'Incendio de Desechos Sólidos', tipos: ['desechos_solidos', 'vertedero_de_basura'] },
      { nombre: 'Incendio de Equipo Eléctrico', tipos: ['equipos_electricos'] },
    ],
    grupoExtra: 'incendio',
  },
  {
    id: 'servicios',
    titulo: 'SERVICIOS',
    filas: [
      {
        nombre: 'Servicios de Gestión de Riesgos',
        contar: (lista) =>
          lista.filter((i) => ['guardia_seguridad_prevencion', 'eliminacion_peligro'].includes(grupoExcelDeIncidente(i))).length,
      },
      {
        nombre: 'Servicios de la Brigada Motorizada (GRUMAE)',
        contar: (lista) => lista.filter((i) => /grumae|motorizada/i.test(String(i.tipo_nombre || i.observacion || ''))).length,
      },
      {
        nombre: 'Servicios de Enfermería',
        contar: (lista) =>
          lista.filter((i) => coincideTipos(i, ['atencion_paramedica', 'atencion_medica', 'puesto_de_atencion'])).length,
      },
      {
        nombre: 'Servicios de Trauma Shock (CHET)',
        contar: (lista) => lista.filter((i) => /chet|trauma/i.test(String(i.tipo_nombre || i.observacion || ''))).length,
      },
      {
        nombre: 'Servicios del Terminal Terrestre (Big Low)',
        contar: (lista) => lista.filter((i) => /terminal|big\s*low/i.test(String(i.tipo_nombre || i.observacion || ''))).length,
      },
      {
        nombre: 'Servicios de Psicotrauma',
        contar: (lista) => lista.filter((i) => /psicotrauma|psico/i.test(String(i.tipo_nombre || i.observacion || ''))).length,
      },
    ],
  },
]

function contarFila(lista, fila) {
  if (typeof fila.contar === 'function') return fila.contar(lista)
  if (fila.tipos?.length) return lista.filter((i) => coincideTipos(i, fila.tipos)).length
  return 0
}

function filasDinamicasGrupo(lista, grupo, usados) {
  const map = new Map()
  for (const inc of lista) {
    if (grupoExcelDeIncidente(inc) !== grupo) continue
    const slug = slugTipo(inc)
    if (!slug || usados.has(slug)) continue
    const nombre = String(inc.tipo_nombre || inc.tipo || slug).split('|')[0].trim()
    map.set(slug, { nombre, tipos: [slug] })
  }
  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export function construirDatosReporteSemanal(incidentes, anio, semanasSeleccionadas) {
  const semanas = [...semanasSeleccionadas]
    .filter((w) => w >= 1 && w <= 53)
    .sort((a, b) => a - b)

  if (semanas.length === 0) {
    return { semanas: [], portada: null, secciones: [] }
  }

  const porSemana = semanas.map((semana) => {
    const enSemana = incidentes.filter((inc) => incidenteEnSemana(inc, anio, semana))
    const cerrados = enSemana.filter((inc) => incidenteCerrado(inc))
    return {
      anio,
      semana,
      etiqueta: etiquetaSemanaCorta(anio, semana),
      etiquetaPortada: etiquetaPortadaSemana(anio, semana),
      incidentes: cerrados,
      totalRegistrados: enSemana.length,
      totalCerrados: cerrados.length,
      totalPendientes: enSemana.length - cerrados.length,
    }
  })

  const semanaPortada = semanas[semanas.length - 1]
  const portada = {
    titulo: 'INCIDENCIAS EN EL TERRITORIO CARABOBEÑO',
    subtitulo: etiquetaPortadaSemana(anio, semanaPortada),
    institucion: 'SISTEMA INTEGRADO DE PROTECCION CIVIL Y BOMBEROS',
  }

  const secciones = SECCIONES_REPORTE_SEMANAL.map((sec) => {
    const usados = new Set()
    for (const fila of sec.filas) {
      if (fila.tipos) fila.tipos.forEach((t) => usados.add(t))
    }

    const filasBase = sec.filas.map((filaDef) => {
      const valores = porSemana.map((s) => contarFila(s.incidentes, filaDef))
      const pct =
        semanas.length >= 2
          ? calcularPorcentajeCambio(valores[0], valores[valores.length - 1])
          : null
      return {
        nombre: filaDef.nombre,
        valores,
        pct,
        tendencia: tendenciaDePct(pct, valores[0], valores[valores.length - 1]),
      }
    })

    let filasExtra = []
    if (sec.grupoExtra) {
      const todas = porSemana.flatMap((s) => s.incidentes)
      filasExtra = filasDinamicasGrupo(todas, sec.grupoExtra, usados).map((filaDef) => {
        const valores = porSemana.map((s) => contarFila(s.incidentes, filaDef))
        const pct =
          semanas.length >= 2
            ? calcularPorcentajeCambio(valores[0], valores[valores.length - 1])
            : null
        return {
          nombre: filaDef.nombre,
          valores,
          pct,
          tendencia: tendenciaDePct(pct, valores[0], valores[valores.length - 1]),
        }
      })
    }

    return {
      id: sec.id,
      titulo: sec.titulo,
      filas: [...filasBase, ...filasExtra],
    }
  })

  return { semanas: porSemana, portada, secciones }
}

export function tendenciaDePct(pct, anterior, actual) {
  const a = Number(anterior) || 0
  const b = Number(actual) || 0
  if (a === b) return 'igual'
  if (pct == null) return b > a ? 'sube' : b < a ? 'baja' : 'igual'
  if (pct > 0) return 'sube'
  if (pct < 0) return 'baja'
  return 'igual'
}

export function semanasConDatos(incidentes, anio, soloCerrados = true) {
  const set = new Set()
  for (const inc of incidentes) {
    if (soloCerrados && !incidenteCerrado(inc)) continue
    const f = inc?.fecha ? new Date(inc.fecha) : null
    if (!f || Number.isNaN(f.getTime())) continue
    if (anioISODeFecha(f) !== anio) continue
    const w = numeroSemanaDeFecha(f)
    if (w) set.add(w)
  }
  return Array.from(set).sort((a, b) => a - b)
}
