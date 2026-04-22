export const CLASIFICACION_EMERGENTE = 'emergente'
export const CLASIFICACION_NO_EMERGENTE = 'no_emergente'

export const TIPOS_INCIDENTE = [
  { id: 'arrollado_peaton', nombre: 'Arrollado (Peatón)', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_vehiculo_moto_arrollado', nombre: 'Colisión Vehículo - Moto (Arrollado)', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'caida_nivel', nombre: 'Caída de Nivel', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'derrape_moto', nombre: 'Derrape de Moto', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'caida_vehiculo_marcha', nombre: 'Caída de Vehículo en Marcha', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'embarrancamiento', nombre: 'Embarrancamiento', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'choque_objeto_fijo', nombre: 'Choque contra Objeto Fijo', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'encunetamiento', nombre: 'Encunetamiento', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_unidad_colectiva', nombre: 'Colisión con Unidad Colectiva involucrada', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'perdida_carga', nombre: 'Pérdida de Carga', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_vehiculo_carga', nombre: 'Colisión con Vehículo de Carga involucrado', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_carga', nombre: 'Volcamiento de Carga', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_entre_vehiculos', nombre: 'Colisión entre Vehículos', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_unidad_colectiva', nombre: 'Volcamiento de Unidad Colectiva', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_moto_moto', nombre: 'Colisión Moto - Moto', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_vehiculo_carga', nombre: 'Volcamiento de Vehículo de Carga', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_moto_bicicleta', nombre: 'Colisión Moto - Bicicleta', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'volcamiento_vehiculo', nombre: 'Volcamiento de Vehículo', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_moto_vehiculo', nombre: 'Colisión Moto - Vehículo', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'vehiculo_caido_agua', nombre: 'Vehículo caído en cuerpo de Agua (Caño, Río, Canal)', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'colision_vehiculo_animal', nombre: 'Colisión Vehículo - Animal', categoria: 'vial', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'traumas_graves', nombre: 'Traumas Graves (caídas de altura, heridas por armas, accidentes laborales)', categoria: 'medico', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'incendio_estructura', nombre: 'Incendio de Estructura (vivienda, comercio, industria, institución)', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'incendio_vegetacion', nombre: 'Incendio de Vegetación (forestal o interfaz urbana)', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'incendio_vehiculo', nombre: 'Incendio de Vehículo (hecho vial con fuego)', categoria: 'incendio', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'explosion_glp_materiales_peligrosos', nombre: 'Explosión / Fuga GLP / Materiales Peligrosos (MatPel)', categoria: 'riesgo_quimico', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'rescate_estructuras_colapsadas', nombre: 'Rescate en Estructuras Colapsadas (sismo, falla estructural)', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'rescate_acuatico', nombre: 'Rescate Acuático (inundación, ríos, costas)', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'rescate_montana', nombre: 'Rescate en Montaña (extraviados, zonas de difícil acceso)', categoria: 'rescate', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'inundacion_desbordamiento', nombre: 'Inundación y Desbordamiento (crecidas, colapso de drenajes)', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'deslizamiento_tierra', nombre: 'Deslizamiento de Tierra (remoción en vías o viviendas)', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'arbol_caido', nombre: 'Árbol Caído (tendido eléctrico, vehículos, viviendas, tráfico)', categoria: 'socio_natural', clasificacion: CLASIFICACION_EMERGENTE },
  { id: 'inspeccion_riesgo', nombre: 'Inspección de Riesgo (estructuras, locales, taludes)', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'talas_podas_preventivas', nombre: 'Talas y Podas Preventivas', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'guardias_prevencion', nombre: 'Guardias de Prevención (eventos masivos)', categoria: 'prevencion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'traslado_interhospitalario', nombre: 'Traslado Inter-hospitalario (pacientes estables)', categoria: 'medico', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'alta_medica', nombre: 'Alta Médica (apoyo a personas con movilidad reducida)', categoria: 'medico', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'simulacro_ejercicio', nombre: 'Simulacro y Ejercicio de Evacuación', categoria: 'educacion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'charla_autoproteccion', nombre: 'Charla de Autoprotección (primeros auxilios, extintores)', categoria: 'educacion', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'mantenimiento_unidades', nombre: 'Mantenimiento de Unidades (salida/entrada a taller)', categoria: 'administrativo', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'suministro_agua', nombre: 'Suministro de Agua (tanques, centros asistenciales, contingencia)', categoria: 'administrativo', clasificacion: CLASIFICACION_NO_EMERGENTE },
  { id: 'otro', nombre: 'Otro', categoria: 'otro', clasificacion: null },
]

export const MAPA_CENTRO_CARABOBO = { lat: 10.1801, lng: -68.0039 }
export const MAPA_ZOOM_DEFAULT = 10

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
