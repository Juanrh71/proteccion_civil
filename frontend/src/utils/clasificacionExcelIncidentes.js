export const GRUPOS_EXCEL = {
  hecho_vial: { nombre: 'Hecho Vial', color: '#6d28d9' },
  incendio: { nombre: 'Incendio', color: '#a21caf' },
  busqueda_rescate: { nombre: 'Búsqueda y Rescate', color: '#4338ca' },
  guardia_seguridad_prevencion: { nombre: 'Guardia de Seguridad y Prevención', color: '#7c2d12' },
  condicion_arborea: { nombre: 'Condición Arbórea', color: '#14532d' },
  solicitud_traslado: { nombre: 'Solicitud de Traslado', color: '#9f1239' },
  clima: { nombre: 'Clima', color: '#3b82f6' },
  hidrometeorologico: { nombre: 'Hidrometeorológico', color: '#0f766e' },
  colapso_estructura: { nombre: 'Colapso de Estructura', color: '#374151' },
  inspeccion_reubicacion_animal: { nombre: 'Inspección y Reubicación Animal', color: '#854d0e' },
  eliminacion_peligro: { nombre: 'Eliminación de Peligro', color: '#4c1d95' },
  otro: { nombre: 'Otro', color: '#334155' },
}

// Clasificación tal como está en el Excel (mapeada por id de tipo).
const GRUPO_POR_TIPO = {
  arrollado_peaton: 'hecho_vial',
  colision_vehiculo_moto_arrollado: 'hecho_vial',
  caida_de_nivel: 'hecho_vial',
  derrape_de_moto: 'hecho_vial',
  caida_de_vehiculo_en_marcha: 'hecho_vial',
  embarrancamiento: 'hecho_vial',
  choque_contra_objeto_fijo: 'hecho_vial',
  encunetamiento: 'hecho_vial',
  colision_con_unidad_colectiva_involucrada: 'hecho_vial',
  perdida_de_carga: 'hecho_vial',
  colision_con_vehiculo_de_carga_involucrado: 'hecho_vial',
  volcamiento_de_carga: 'hecho_vial',
  colision_entre_vehiculos: 'hecho_vial',
  volcamiento_de_unidad_colectiva: 'hecho_vial',
  colision_moto_moto: 'hecho_vial',
  volcamiento_de_vehiculo_de_carga: 'hecho_vial',
  colision_moto_bicicleta: 'hecho_vial',
  volcamiento_de_vehiculo: 'hecho_vial',
  colision_moto_vehiculo: 'hecho_vial',
  vehiculo_caido_en_cuerpo_de_agua: 'hecho_vial',
  colision_vehiculo_animal: 'hecho_vial',

  vegetacion: 'incendio',
  estructura: 'incendio',
  vehiculo_incendio: 'incendio',
  equipos_electricos: 'incendio',
  desechos_solidos: 'incendio',
  vertedero_de_basura: 'incendio',
  deflagracion: 'incendio',
  embarcacion_incendio: 'incendio',
  mat_pel: 'incendio',
  pirotecnico: 'incendio',

  persona_desaparecida_en_montana: 'busqueda_rescate',
  persona_desaparecida_en_agua: 'busqueda_rescate',
  busqueda_y_rescate_en_areas_confinadas: 'busqueda_rescate',
  rescate_en_ascensor: 'busqueda_rescate',
  rescate_de_persona_en_agua: 'busqueda_rescate',
  rescate_animal: 'busqueda_rescate',
  recuperacion_de_cadaver: 'busqueda_rescate',

  guardia_de_seguridad_y_prevencion: 'guardia_seguridad_prevencion',
  atencion_paramedica: 'guardia_seguridad_prevencion',
  atencion_medica: 'guardia_seguridad_prevencion',
  puesto_de_atencion: 'guardia_seguridad_prevencion',
  punto_de_control: 'guardia_seguridad_prevencion',

  arbol_caido_en_via_publica: 'condicion_arborea',
  arbol_caido_sobre_estructura: 'condicion_arborea',
  arbol_caido_sobre_tendido_electrico: 'condicion_arborea',
  arbol_caido_sobre_vehiculo: 'condicion_arborea',
  poda_de_arbol: 'condicion_arborea',
  arbol_en_condicion_de_riesgo: 'condicion_arborea',

  lesionado_por_caido_de_altura: 'solicitud_traslado',
  lesionado_por_arma_blanca: 'solicitud_traslado',
  lesionado_por_arma_de_fuego: 'solicitud_traslado',
  lesionado_por_descarga_electrica: 'solicitud_traslado',

  despejado: 'clima',
  nublado: 'clima',
  precipitaciones_leves: 'clima',
  precipitaciones_moderadas: 'clima',
  precipitaciones_fuertes: 'clima',
  precipitaciones_severas: 'clima',
  precipitaciones_torrenciales: 'clima',

  anegacion: 'hidrometeorologico',
  inhundacion: 'hidrometeorologico',
  desbordamiento_cano_rio_canal: 'hidrometeorologico',

  colapso_de_estructura: 'colapso_estructura',
  colapso_de_puente: 'colapso_estructura',

  enjambre_de_abejas: 'inspeccion_reubicacion_animal',
  enjambre_de_avispa: 'inspeccion_reubicacion_animal',
  serpiente: 'inspeccion_reubicacion_animal',
  alacran: 'inspeccion_reubicacion_animal',
  animal_agreste: 'inspeccion_reubicacion_animal',

  fuga_de_glp: 'eliminacion_peligro',
  derrame_de_hidrocarburo: 'eliminacion_peligro',
}

const COLOR_TIPO_FIJO = {
  despejado: '#ffffff',
  nublado: '#9ca3af',
  precipitaciones_leves: '#3b82f6',
  precipitaciones_moderadas: '#84cc16',
  precipitaciones_fuertes: '#facc15',
  precipitaciones_severas: '#d97706',
  precipitaciones_torrenciales: '#dc2626',
}

/** Id de categoría Excel (columna / agrupación del libro) para un id de tipo */
export function grupoExcelDeTipoId(tipoId) {
  const tipo = String(tipoId || '').trim()
  return GRUPO_POR_TIPO[tipo] || 'otro'
}

/** Rellena useCatalogoIncidentes tras cargar /api/catalogo/registro (slug -> color) */
let coloresCategoriasDinamicos = null
export function setColoresCategoriasDinamicos(map) {
  coloresCategoriasDinamicos =
    map && typeof map === 'object' ? { ...map } : null
}

let coloresTiposDinamicos = null
export function setColoresTiposDinamicos(map) {
  coloresTiposDinamicos =
    map && typeof map === 'object' ? { ...map } : null
}

function categoriaDinamicaConocida(slug) {
  const c = String(slug || '').trim()
  if (!c) return false
  return !!(coloresCategoriasDinamicos && Object.prototype.hasOwnProperty.call(coloresCategoriasDinamicos, c))
}

export function grupoExcelDeIncidente(inc) {
  if (!inc) return 'otro'
  const c = inc.categoria != null ? String(inc.categoria).trim() : ''
  if (c && Object.prototype.hasOwnProperty.call(GRUPOS_EXCEL, c)) {
    return c
  }
  if (c && categoriaDinamicaConocida(c)) {
    return c
  }
  return grupoExcelDeTipoId(inc.tipo)
}

export function colorGrupoExcel(inc) {
  const tipo = inc?.tipo != null ? String(inc.tipo).trim() : ''
  if (tipo) {
    const dinTipo = coloresTiposDinamicos && coloresTiposDinamicos[tipo]
    if (dinTipo) return dinTipo
    if (Object.prototype.hasOwnProperty.call(COLOR_TIPO_FIJO, tipo)) {
      return COLOR_TIPO_FIJO[tipo]
    }
  }
  const g = grupoExcelDeIncidente(inc)
  const din = coloresCategoriasDinamicos && coloresCategoriasDinamicos[g]
  if (din) return din
  return GRUPOS_EXCEL[g]?.color || GRUPOS_EXCEL.otro.color
}

let nombresCategoriasDinamicos = null
export function setNombresCategoriasDinamicos(map) {
  nombresCategoriasDinamicos = map && typeof map === 'object' ? { ...map } : null
}

export function nombreGrupoExcel(inc) {
  const g = grupoExcelDeIncidente(inc)
  const n = nombresCategoriasDinamicos && nombresCategoriasDinamicos[g]
  if (n) return n
  return GRUPOS_EXCEL[g]?.nombre || GRUPOS_EXCEL.otro.nombre
}

export const LEYENDA_GRUPOS_EXCEL = Object.entries(GRUPOS_EXCEL).map(([id, meta]) => ({
  id,
  nombre: meta.nombre,
  color: meta.color,
}))

/** Orden de categorías tal como en el catálogo Excel / leyenda */
export const CATEGORIAS_EXCEL_REGISTRO = LEYENDA_GRUPOS_EXCEL.map((e) => e.id)
