/** Para modales «ver resultado»: texto oficial de cierre o registro antiguo en observacion. */
export function textoResultadoModalLeer(inc) {
  const res = String(inc?.resultado_cierre || '').trim()
  const obs = String(inc?.observacion_cierre_abierto || '').trim()
  return res || obs || ''
}

/** Celda corta en la tabla del PDF: indica si hay texto en el anexo. */
export function etiquetaResultadoPdf(inc) {
  return textoResultadoModalLeer(inc) ? 'Resultado' : '—'
}
