/** Bloque de víctimas al cierre (solo incidentes que pasaron por en proceso). */
export function textoVictimasCierre(inc) {
  if (!inc || inc.heridos_cierre == null || inc.fallecidos_cierre == null) return ''
  const h = Number(inc.heridos_cierre)
  const f = Number(inc.fallecidos_cierre)
  if (!Number.isFinite(h) || !Number.isFinite(f)) return ''
  const partes = []
  if (h > 0 && f > 0) partes.push(`${h} herido(s) y ${f} fallecido(s)`)
  else if (h > 0) partes.push(`${h} herido(s), sin fallecidos`)
  else if (f > 0) partes.push(`${f} fallecido(s), sin heridos`)
  else partes.push('Sin heridos ni fallecidos registrados (0 / 0)')
  return partes[0]
}

export function tieneRegistroVictimasCierre(inc) {
  return !!(inc && inc.heridos_cierre != null && inc.fallecidos_cierre != null)
}

/** Para modales «ver resultado»: texto oficial de cierre o registro antiguo en observacion. */
export function textoResultadoModalLeer(inc) {
  const res = String(inc?.resultado_cierre || '').trim()
  const obs = String(inc?.observacion_cierre_abierto || '').trim()
  return res || obs || ''
}

/** Celda corta en la tabla del PDF: indica si hay texto o registro de víctimas al cierre. */
export function etiquetaResultadoPdf(inc) {
  if (textoResultadoModalLeer(inc) || tieneRegistroVictimasCierre(inc)) return 'Resultado'
  return '—'
}
