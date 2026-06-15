const ETIQUETAS_ENUM = {
  tipo_afectacion: {
    anegacion: 'Anegación',
    inundacion: 'Inundación',
    deslizamiento: 'Deslizamiento',
    otros: 'Otros',
  },
  condicion_vivienda: {
    afectada: 'Afectada',
    alto_riesgo: 'Alto riesgo',
    destruida: 'Destruida',
  },
  tipo_vivienda: {
    anarquica: 'Anárquica',
    improvisada: 'Improvisada',
    'casa convencional': 'Casa convencional',
  },
  si_no: {
    si: 'Sí',
    no: 'No',
  },
}

export function truncarTexto(value, max = 180) {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

function fmtFecha(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtHora(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

function fmtFechaHora(value) {
  const f = fmtFecha(value)
  const h = fmtHora(value)
  if (f && h) return `${f} ${h}`
  return f || h
}

export function formatearFechaEdan(value) {
  return fmtFechaHora(value) || '—'
}

function valorCampo(value) {
  if (value == null || value === '') return ''
  return String(value)
}

function marcar(cond) {
  return cond ? 'X' : ''
}

/** Modelo de la planilla oficial F-DGAGR-11 para vista previa e impresión PDF. */
export function buildPlanillaEdanModel(data = {}) {
  const d = data || {}
  const fechaReg = d.fecha_reporte || new Date().toISOString()
  const tipo = String(d.tipo_afectacion || '').trim().toLowerCase()
  const cond = String(d.condicion_vivienda || '').trim().toLowerCase()
  const tv = String(d.tipo_vivienda || '').trim().toLowerCase()
  const detalles = Array.isArray(d.detalles_familiares) ? d.detalles_familiares : []

  const filasAfectados = []
  for (let i = 0; i < 8; i++) {
    const f = detalles[i]
    filasAfectados.push({
      n: i + 1,
      nombre: valorCampo(f?.nombre_completo),
      ci: valorCampo(f?.cedula),
      sexo: valorCampo(f?.genero),
      edad: f?.edad != null && f?.edad !== '' ? String(f.edad) : '',
    })
  }

  return {
    evaluador: valorCampo(d.evaluador_nombre),
    evaluadorCi: valorCampo(d.evaluador_cedula),
    hora: fmtHora(fechaReg),
    fecha: fmtFecha(fechaReg),
    nroPlanilla: valorCampo(d.numero_planilla),
    propietario: valorCampo(d.propetario),
    edad: d.P_edad != null && d.P_edad !== '' ? String(d.P_edad) : '',
    ci: valorCampo(d.p_cedula),
    telefonos: valorCampo(d.P_telefono),
    municipio: valorCampo(d.municipio),
    parroquia: valorCampo(d.parroquia),
    sector: valorCampo(d.sector),
    casaN: valorCampo(d.nro_casa),
    urbanizacion: valorCampo(d.urbanizacion),
    direccion: valorCampo(d.direccion),
    norte: d.lat != null && d.lat !== '' ? String(d.lat) : '',
    este: d.lng != null && d.lng !== '' ? String(d.lng) : '',
    elevacion: '',
    nroInforme: valorCampo(d.nro_informe),
    fechaSolicitud: fmtFechaHora(d.fecha_solicitud),
    fechaAfectacion: fmtFechaHora(d.fecha_afectacion),
    descripcionAfectacion: valorCampo(d.descripcion_afectacion),
    anegacion: marcar(tipo === 'anegacion'),
    inundacion: marcar(tipo === 'inundacion'),
    deslizamiento: marcar(tipo === 'deslizamiento'),
    otros: marcar(tipo === 'otros'),
    afectacionOtros: valorCampo(d.afectacion_otros),
    condAfectada: marcar(cond === 'afectada'),
    condAltoRiesgo: marcar(cond === 'alto_riesgo'),
    condDestruida: marcar(cond === 'destruida'),
    tipoAnarquica: marcar(tv === 'anarquica' || tv === 'improvisada'),
    tipoConvencional: marcar(tv === 'casa convencional'),
    filasAfectados,
    resumenAfectacion: truncarTexto(d.descripcion_vivienda, 420),
    lactFem: d.lact_Fem ?? '',
    lactMasc: d.lact_Masc ?? '',
    ninosFem: d.ninos_Fem ?? '',
    ninosMasc: d.ninos_Masc ?? '',
    adultosFem: d.adultos_Fem ?? '',
    adultosMasc: d.adultos_Masc ?? '',
    terceraFem: d.tercera_edad_Fem ?? '',
    terceraMasc: d.tercera_edad_Masc ?? '',
    totalPersonas: d.total_personas ?? '',
    nroFamilias: d.nro_familias ?? '',
    discapacitados: d.discapacitados ?? '',
    requerimientos: truncarTexto(d.requerimientos_afectacion, 520),
    nombreEvaluado: valorCampo(d.propetario),
    ciEvaluado: valorCampo(d.p_cedula),
    observaciones: truncarTexto(d.descripcion_vivienda, 320),
    enseresTotal: truncarTexto(d.P_enseres_total, 120),
    enseresParcial: truncarTexto(d.P_enseres_parcial, 120),
    enseresNo: truncarTexto(d.p_enseres_no, 120),
    fallaAgua: marcar(String(d.necesidades_agua || '').toLowerCase() === 'si'),
    fallaLuz: marcar(String(d.necesidades_luz || '').toLowerCase() === 'si'),
    fallaComida: marcar(String(d.necesidades_alimentos || '').toLowerCase() === 'si'),
    idReporte: d.id != null ? String(d.id) : '',
  }
}

/** @deprecated Mantener compatibilidad si algo importa seccionesFormularioEdan */
export function seccionesFormularioEdan(data = {}) {
  const p = buildPlanillaEdanModel(data)
  return [{ titulo: 'Planilla EDAN', campos: [{ label: 'Planilla', value: p.nroPlanilla, full: true }] }]
}

export function filasDetalleFamiliar(data = {}) {
  const lista = Array.isArray(data?.detalles_familiares) ? data.detalles_familiares : []
  if (!lista.length) return [['', '', '', '']]
  return lista.map((f) => [
    valorCampo(f?.nombre_completo),
    valorCampo(f?.cedula),
    f?.edad != null ? String(f.edad) : '',
    valorCampo(f?.genero),
  ])
}

export function nombreArchivoEdan(data = {}) {
  const id = data?.id != null ? String(data.id) : 'nuevo'
  const planilla = String(data?.numero_planilla || 'edan').replace(/[^a-zA-Z0-9_-]/g, '_')
  const stamp = new Date().toISOString().slice(0, 10)
  return `EDAN_${id}_${planilla}_${stamp}.pdf`
}
