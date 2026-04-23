import { jsPDF } from 'jspdf'

function nombreArchivoSeguro(nombre) {
  const base = (nombre || 'reporte_comparativa').replace(/\.pdf$/i, '')
  const ascii = base.replace(/[^a-zA-Z0-9._-]/g, '_')
  return ascii.endsWith('.pdf') ? ascii : `${ascii}.pdf`
}

function texto(v) {
  if (v == null) return ''
  return String(v)
}

export function descargarPdfComparativaHistorica({
  titulo = 'Comparativa histórica',
  subtitulo = '',
  etiquetas = [],
  valores = [],
  nombreArchivo = 'comparativa_historica.pdf',
}) {
  if (!etiquetas.length || !valores.length || etiquetas.length !== valores.length) {
    throw new Error('No hay datos válidos para generar la comparativa.')
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(texto(titulo), 12, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80)
  if (subtitulo) doc.text(texto(subtitulo), 12, 20)
  doc.text(`Generado: ${new Date().toLocaleString('es-VE')}`, 12, subtitulo ? 25 : 20)
  doc.setTextColor(20)

  const x0 = 18
  const y0 = 34
  const chartW = pageW - 30
  const chartH = 120

  doc.setDrawColor(190)
  doc.line(x0, y0 + chartH, x0 + chartW, y0 + chartH)
  doc.line(x0, y0, x0, y0 + chartH)

  const maxVal = Math.max(...valores, 1)
  const n = valores.length
  const slot = chartW / Math.max(n, 1)
  const barW = Math.max(5, slot * 0.58)

  for (let i = 0; i < n; i++) {
    const v = Number(valores[i]) || 0
    const h = (v / maxVal) * (chartH - 12)
    const x = x0 + i * slot + (slot - barW) / 2
    const y = y0 + chartH - h

    doc.setFillColor(0, 51, 204)
    doc.rect(x, y, barW, h, 'F')

    doc.setFontSize(8)
    doc.setTextColor(35)
    doc.text(String(v), x + barW / 2, y - 1.5, { align: 'center' })

    const label = texto(etiquetas[i]).length > 18 ? `${texto(etiquetas[i]).slice(0, 16)}…` : texto(etiquetas[i])
    doc.text(label, x + barW / 2, y0 + chartH + 5, { align: 'center' })
  }

  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text('Comparativa de reportes', x0, y0 - 2)
  doc.text('Protección Civil Carabobo', 12, pageH - 6)

  doc.save(nombreArchivoSeguro(nombreArchivo))
}
