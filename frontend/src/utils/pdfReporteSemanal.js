import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatoPorcentaje } from './reporteSemanal.js'

function textoLatin1(value) {
  if (value == null || value === '') return ''
  const s = String(value).replace(/\r\n|\n|\r/g, ' ').replace(/\t/g, ' ')
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c >= 32 && c <= 126) out += s.charAt(i)
    else if (c >= 160 && c <= 255) out += s.charAt(i)
    else out += '?'
  }
  return out
}

function nombreArchivoSeguro(nombre) {
  const base = (nombre || 'reporte_semanal').replace(/\.pdf$/i, '')
  const ascii = base.replace(/[^a-zA-Z0-9._-]/g, '_')
  return ascii.endsWith('.pdf') ? ascii : `${ascii}.pdf`
}

function encabezadoInstitucional(doc, logoDataUrl, y = 8) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, y, 14, 14)
    } catch (_) {}
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(0, 51, 120)
  doc.rect(0, y - 2, doc.internal.pageSize.getWidth(), 16, 'F')
  doc.text(textoLatin1('SISTEMA INTEGRADO DE PROTECCION CIVIL Y BOMBEROS'), 30, y + 7)
  doc.setTextColor(20)
}

function paginaPortada(doc, portada, logoDataUrl) {
  encabezadoInstitucional(doc, logoDataUrl, 10)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const cx = pageW / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(180, 0, 0)
  doc.text(textoLatin1(portada.titulo), cx, pageH * 0.38, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(30, 30, 30)
  doc.text(textoLatin1(portada.subtitulo), cx, pageH * 0.48, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80)
  doc.text(`Generado: ${new Date().toLocaleString('es-VE')}`, cx, pageH * 0.58, { align: 'center' })
}

function dibujarTablaSeccion(doc, seccion, semanas, startY, logoDataUrl) {
  const head = [
    'Incidencia',
    ...semanas.map((s) => textoLatin1(s.etiqueta)),
    ...(semanas.length >= 2 ? ['%'] : []),
  ]

  const body = seccion.filas.map((fila) => {
    const row = [textoLatin1(fila.nombre), ...fila.valores.map((v) => String(v).padStart(2, '0'))]
    if (semanas.length >= 2) row.push(formatoPorcentaje(fila.pct))
    return row
  })

  const tituloFila = [
    {
      content: textoLatin1(seccion.titulo),
      colSpan: head.length,
      styles: {
        fillColor: [255, 230, 0],
        textColor: [180, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 11,
      },
    },
  ]

  autoTable(doc, {
    startY,
    head: [head],
    body: [tituloFila, ...body],
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 2.2,
      lineColor: [200, 210, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [0, 51, 120],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 72, halign: 'left' },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.row.index > 0) {
        data.cell.styles.fillColor = data.row.index % 2 === 0 ? [220, 235, 250] : [235, 245, 255]
        data.cell.styles.textColor = [20, 20, 20]
        if (data.column.index > 0 && data.column.index < head.length - (semanas.length >= 2 ? 1 : 0)) {
          data.cell.styles.halign = 'center'
        }
        if (semanas.length >= 2 && data.column.index === head.length - 1) {
          const pct = seccion.filas[data.row.index - 1]?.pct
          if (pct > 0) data.cell.styles.textColor = [0, 120, 60]
          else if (pct < 0) data.cell.styles.textColor = [180, 0, 0]
        }
      }
    },
    margin: { left: 12, right: 12 },
  })

  const finalY = doc.lastAutoTable.finalY + 4
  doc.setFontSize(8)
  doc.setTextColor(60)
  doc.text(
    textoLatin1('Incremento     Disminuyo     Se mantuvo'),
    12,
    finalY + 4
  )
  return finalY + 10
}

export function descargarPdfReporteSemanal({
  datos,
  logoDataUrl = null,
  nombreArchivo = 'reporte_semanal.pdf',
}) {
  if (!datos?.secciones?.length || !datos.semanas?.length) {
    throw new Error('No hay datos para generar el reporte semanal.')
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const semanas = datos.semanas

  if (datos.portada) {
    paginaPortada(doc, datos.portada, logoDataUrl)
  }

  for (const seccion of datos.secciones) {
    doc.addPage()
    encabezadoInstitucional(doc, logoDataUrl, 8)
    dibujarTablaSeccion(doc, seccion, semanas, 28, logoDataUrl)
  }

  doc.save(nombreArchivoSeguro(nombreArchivo))
}
