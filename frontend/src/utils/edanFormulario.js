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
  if (!s) return '—'
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

export function formatearFechaEdan(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function etiquetaEnum(grupo, value) {
  const key = String(value || '').trim().toLowerCase()
  if (!key) return '—'
  return ETIQUETAS_ENUM[grupo]?.[key] || String(value)
}

function valorCampo(value) {
  if (value == null || value === '') return '—'
  return String(value)
}

export function seccionesFormularioEdan(data = {}) {
  const d = data || {}
  const coords =
    d.lat != null && d.lng != null && d.lat !== '' && d.lng !== ''
      ? `${d.lat}, ${d.lng}`
      : '—'

  return [
    {
      titulo: 'Identificación',
      campos: [
        { label: 'N° reporte', value: valorCampo(d.id) },
        { label: 'Fecha registro', value: formatearFechaEdan(d.fecha_reporte) },
        { label: 'Número planilla', value: valorCampo(d.numero_planilla) },
        { label: 'Nro. informe', value: valorCampo(d.nro_informe) },
        { label: 'Propietario o responsable', value: valorCampo(d.propetario) },
        { label: 'Cédula', value: valorCampo(d.p_cedula) },
        { label: 'Edad', value: valorCampo(d.P_edad) },
        { label: 'Teléfono', value: valorCampo(d.P_telefono) },
      ],
    },
    {
      titulo: 'Ubicación',
      campos: [
        { label: 'Municipio', value: valorCampo(d.municipio) },
        { label: 'Parroquia', value: valorCampo(d.parroquia) },
        { label: 'Sector', value: valorCampo(d.sector) },
        { label: 'Nro. casa', value: valorCampo(d.nro_casa) },
        { label: 'Urbanización', value: valorCampo(d.urbanizacion) },
        { label: 'Dirección', value: valorCampo(d.direccion), full: true },
        { label: 'Coordenadas', value: coords },
      ],
    },
    {
      titulo: 'Fechas',
      campos: [
        { label: 'Fecha solicitud', value: formatearFechaEdan(d.fecha_solicitud) },
        { label: 'Fecha afectación', value: formatearFechaEdan(d.fecha_afectacion) },
      ],
    },
    {
      titulo: 'Afectación y vivienda',
      campos: [
        { label: 'Tipo afectación', value: etiquetaEnum('tipo_afectacion', d.tipo_afectacion) },
        { label: 'Afectación otros', value: valorCampo(d.afectacion_otros) },
        { label: 'Condición vivienda', value: etiquetaEnum('condicion_vivienda', d.condicion_vivienda) },
        { label: 'Tipo vivienda', value: etiquetaEnum('tipo_vivienda', d.tipo_vivienda) },
        {
          label: 'Descripción afectación',
          value: truncarTexto(d.descripcion_afectacion, 320),
          full: true,
        },
        {
          label: 'Descripción vivienda',
          value: truncarTexto(d.descripcion_vivienda, 320),
          full: true,
        },
      ],
    },
    {
      titulo: 'Personas afectadas',
      campos: [
        { label: 'Lactantes F / M', value: `${d.lact_Fem ?? 0} / ${d.lact_Masc ?? 0}` },
        { label: 'Niños F / M', value: `${d.ninos_Fem ?? 0} / ${d.ninos_Masc ?? 0}` },
        { label: 'Adultos F / M', value: `${d.adultos_Fem ?? 0} / ${d.adultos_Masc ?? 0}` },
        { label: '3era edad F / M', value: `${d.tercera_edad_Fem ?? 0} / ${d.tercera_edad_Masc ?? 0}` },
        { label: 'Discapacitados', value: valorCampo(d.discapacitados) },
        { label: 'Total personas', value: valorCampo(d.total_personas) },
        { label: 'Nro. familias', value: valorCampo(d.nro_familias) },
      ],
    },
    {
      titulo: 'Requerimientos y enseres',
      campos: [
        {
          label: 'Requerimientos por afectación',
          value: truncarTexto(d.requerimientos_afectacion, 320),
          full: true,
        },
        { label: 'Pérdidas enseres total', value: truncarTexto(d.P_enseres_total, 160) },
        { label: 'Pérdidas enseres parcial', value: truncarTexto(d.P_enseres_parcial, 160) },
        { label: 'Sin pérdidas enseres', value: truncarTexto(d.p_enseres_no, 160) },
        { label: 'Falla de agua', value: etiquetaEnum('si_no', d.necesidades_agua) },
        { label: 'Falla de alimentos', value: etiquetaEnum('si_no', d.necesidades_alimentos) },
        { label: 'Falla de luz', value: etiquetaEnum('si_no', d.necesidades_luz) },
      ],
    },
  ]
}

export function filasDetalleFamiliar(data = {}) {
  const lista = Array.isArray(data?.detalles_familiares) ? data.detalles_familiares : []
  if (!lista.length) {
    return [['—', '—', '—', '—']]
  }
  return lista.map((f) => [
    valorCampo(f?.nombre_completo),
    valorCampo(f?.cedula),
    valorCampo(f?.edad),
    valorCampo(f?.genero),
  ])
}

export function nombreArchivoEdan(data = {}) {
  const id = data?.id != null ? String(data.id) : 'nuevo'
  const planilla = String(data?.numero_planilla || 'edan').replace(/[^a-zA-Z0-9_-]/g, '_')
  const stamp = new Date().toISOString().slice(0, 10)
  return `EDAN_${id}_${planilla}_${stamp}.pdf`
}
