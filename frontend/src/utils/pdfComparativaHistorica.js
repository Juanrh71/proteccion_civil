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

function hexToRgb(hex) {
  const v = String(hex || '').trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  }
}

export function descargarPdfComparativaHistorica({
  titulo = 'Comparativa histórica',
  subtitulo = '',
  etiquetas = [],
  valores = [],
  categoriasResumen = [],
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

  if (Array.isArray(categoriasResumen) && categoriasResumen.length > 0) {
    const legendX = 12
    let legendY = y0 + chartH + 12
    const legendEndY = pageH - 10
    const colW = (pageW - 24) / 2
    const rowH = 5.2
    const colCount = 2
    const maxRowsPerCol = Math.max(1, Math.floor((legendEndY - (legendY + 6)) / rowH))
    const maxItemsPage = maxRowsPerCol * colCount
    let index = 0
    let firstPageLegend = true

    while (index < categoriasResumen.length) {
      if (!firstPageLegend) {
        doc.addPage()
        legendY = 18
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(20)
      doc.text(firstPageLegend ? 'Incidentes por categoría' : 'Incidentes por categoría (continuación)', legendX, legendY)
      legendY += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const slice = categoriasResumen.slice(index, index + maxItemsPage)

      slice.forEach((item, localIdx) => {
        const col = Math.floor(localIdx / maxRowsPerCol)
        const row = localIdx % maxRowsPerCol
        const x = legendX + col * colW
        const y = legendY + row * rowH
        const rgb = hexToRgb(item?.color)
        if (rgb) {
          doc.setFillColor(rgb.r, rgb.g, rgb.b)
        } else {
          doc.setFillColor(71, 85, 105)
        }
        doc.circle(x + 1.8, y - 1.2, 1.4, 'F')
        doc.setTextColor(35)
        doc.text(`${texto(item?.nombre) || 'Sin categoría'} (${Number(item?.total) || 0})`, x + 5, y)
      })

      index += slice.length
      firstPageLegend = false
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text('Protección Civil Carabobo', 12, pageH - 6)

  doc.save(nombreArchivoSeguro(nombreArchivo))
}
