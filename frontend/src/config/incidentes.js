export const CLASIFICACION_EMERGENTE = 'emergente'
export const CLASIFICACION_NO_EMERGENTE = 'no_emergente'

export const TIPOS_INCIDENTE = [
  // Hecho Vial
  { id: 'arrollado_peaton', nombre: 'Arrollado (Peatón)', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_vehiculo_moto_arrollado', nombre: 'Colisión Vehículo - Moto (Arrollado)', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'caida_de_nivel', nombre: 'Caída de Nivel', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'derrape_de_moto', nombre: 'Derrape de Moto', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'caida_de_vehiculo_en_marcha', nombre: 'Caída de Vehículo en Marcha', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'embarrancamiento', nombre: 'Embarrancamiento', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'choque_contra_objeto_fijo', nombre: 'Choque contra Objeto Fijo', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'encunetamiento', nombre: 'Encunetamiento', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_con_unidad_colectiva_involucrada', nombre: 'Colisión con Unidad Colectiva involucrada', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'perdida_de_carga', nombre: 'Perdida de Carga', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_con_vehiculo_de_carga_involucrado', nombre: 'Colisión con Vehículo de Carga involucrado', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_de_carga', nombre: 'Volcamiento de Carga', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_entre_vehiculos', nombre: 'Colisión entre Vehículos', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_de_unidad_colectiva', nombre: 'Volcamiento de Unidad Colectiva', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_moto_moto', nombre: 'Colisión Moto - Moto', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_de_vehiculo_de_carga', nombre: 'Volcamiento de Vehículo de Carga', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_moto_bicicleta', nombre: 'Colisión Moto - Bicicleta', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_de_vehiculo', nombre: 'Volcamiento de Vehículo', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_moto_vehiculo', nombre: 'Colisión Moto - Vehículo', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'vehiculo_caido_en_cuerpo_de_agua', nombre: 'Vehículo caído en cuerpo de Agua (Caño, Rio, Canal)', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_vehiculo_animal', nombre: 'Colisión Vehículo - Animal', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },

  // Incendio
  { id: 'vegetacion', nombre: 'Vegetacion', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'estructura', nombre: 'Estructura', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'vehiculo_incendio', nombre: 'Vehiculo', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'equipos_electricos', nombre: 'Equipos electricos', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'desechos_solidos', nombre: 'Desechos solidos', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'vertedero_de_basura', nombre: 'Vertedero de basura', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'deflagracion', nombre: 'Deflagracion', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'embarcacion_incendio', nombre: 'Embarcacion', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'mat_pel', nombre: 'Mat-Pel', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'pirotecnico', nombre: 'Pirotecnico', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },

  // Búsqueda y Rescate
  { id: 'persona_desaparecida_en_montana', nombre: 'Persona desaparecida en montaña', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'persona_desaparecida_en_agua', nombre: 'Persona desaparecida en agua', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'busqueda_y_rescate_en_areas_confinadas', nombre: 'Busqueda y Rescate en areas confinadas', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'rescate_en_ascensor', nombre: 'Rescate en ascensor', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'rescate_de_persona_en_agua', nombre: 'Rescate de persona en agua', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'rescate_animal', nombre: 'Rescate animal', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'recuperacion_de_cadaver', nombre: 'Recuperacion de cadaver', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },

  // Guardia de Seguridad y Prevención
  { id: 'guardia_de_seguridad_y_prevencion', nombre: 'Guardia de Seguridad y Prevencion', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'atencion_paramedica', nombre: 'Atencion paramedica', categoria: 'medico', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'atencion_medica', nombre: 'Atencion medica', categoria: 'medico', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'puesto_de_atencion', nombre: 'Puesto de Atencion', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'punto_de_control', nombre: 'Punto de Control', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },

  // Condición Arbórea
  { id: 'arbol_caido_en_via_publica', nombre: 'Arbol caido en via publica', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'arbol_caido_sobre_estructura', nombre: 'Arbol caido sobre estructura', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'arbol_caido_sobre_tendido_electrico', nombre: 'Arbol caido sobre tendido electrico', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'arbol_caido_sobre_vehiculo', nombre: 'Arbol caido sobre vehiculo', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'poda_de_arbol', nombre: 'Poda de arbol', categoria: 'socio_natural', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'arbol_en_condicion_de_riesgo', nombre: 'Arbol en condicion de riesgo', categoria: 'socio_natural', clasificacion: CLASIFICACION_NO_EMERGENTE },

  // Solicitud de Traslado
  { id: 'lesionado_por_caido_de_altura', nombre: 'Lesionado por caido de altura', categoria: 'medico', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'lesionado_por_arma_blanca', nombre: 'Lesionado por arma blanca', categoria: 'medico', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'lesionado_por_arma_de_fuego', nombre: 'Lesionado por arma de fuego', categoria: 'medico', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'lesionado_por_descarga_electrica', nombre: 'Lesionado por descarga electrica', categoria: 'medico', clasificacion: CLASIFICACION_EMERGENTE },

  // Hidrometeorológico
  { id: 'anegacion', nombre: 'Anegacion', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'inhundacion', nombre: 'Inhundacion', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'desbordamiento_cano_rio_canal', nombre: 'Desbordamiento (caño, rio, canal)', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },

  // Colapso de Estructura
  { id: 'colapso_de_estructura', nombre: 'Colapso de estructura', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colapso_de_puente', nombre: 'Colapso de puente', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },

  // Inspección y Reubicación Animal
  { id: 'enjambre_de_abejas', nombre: 'Enajmbre de abejas', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'enjambre_de_avispa', nombre: 'Enajmbre de avispa', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'serpiente', nombre: 'Serpiente', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'alacran', nombre: 'Alacran', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'animal_agreste', nombre: 'Animal agreste', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },

  // Eliminación de Peligro
  { id: 'fuga_de_glp', nombre: 'Fuga de GLP', categoria: 'riesgo_quimico', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'derrame_de_hidrocarburo', nombre: 'Derrame de hidrocarburo', categoria: 'riesgo_quimico', clasificacion: CLASIFICACION_EMERGENTE },

  { id: 'otro', nombre: 'Otro', categoria: 'otro', clasificacion: null },
]

export const MAPA_CENTRO_CARABOBO = { lat: 10.1801, lng: -68.0039 }
export const MAPA_ZOOM_DEFAULT = 10

/** Esquina SO y NE del estado Carabobo (aprox.) para encuadrar todo el estado en el mapa */
export const MAPA_BOUNDS_CARABOBO = [
  [9.95, -68.55],
  [10.48, -67.32],
]

export const MUNICIPIOS_CARABOBO = [
  'Valencia', 'Naguanagua', 'San Diego', 'Guacara', 'Mariara', 'Diego Ibarra',
  'Puerto Cabello', 'Juan José Mora', 'Bejuma', 'Miranda', 'Montalbán', 'Carlos Arvelo',
]

export const PARROQUIAS_POR_MUNICIPIO = {
  Valencia: [
    'Candelaria', 'Catedral', 'El Socorro', 'Miguel Peña', 'Negro Primero',
    'Rafael Urdaneta', 'San Blas', 'San José', 'Santa Rosa',
  ],
  Naguanagua: ['Naguanagua'],
  'San Diego': ['San Diego'],
  Guacara: ['Ciudad Alianza', 'Guacara', 'Yagua'],
  Mariara: ['Aguas Calientes', 'Mariara'],
  'Diego Ibarra': ['Aguas Calientes', 'Mariara'],
  'Puerto Cabello': ['Bartolomé Salom', 'Borburata', 'Democracia', 'Fraternidad', 'Goaigoaza', 'Juan José Flores', 'Unión'],
  'Juan José Mora': ['Morón', 'Urama'],
  Bejuma: ['Bejuma', 'Canoabo', 'Simón Bolívar'],
  Miranda: ['Miranda'],
  Montalbán: ['Montalbán'],
  'Carlos Arvelo': ['Belén', 'Güigüe', 'Tacarigua'],
}

export const RANGO_ANO_INICIO = 2025
export const RANGO_ANO_FIN = 2035

export function añoSugeridoParaIncidentes() {
  const hoy = new Date().getFullYear()
  if (hoy < RANGO_ANO_INICIO) return RANGO_ANO_INICIO
  if (hoy > RANGO_ANO_FIN) return RANGO_ANO_FIN
  return hoy
}
