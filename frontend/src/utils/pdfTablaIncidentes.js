import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLUMNAS_TABLA = [
  'N°',
  'Fecha',
  'Tipo',
  'Municipio',
  'Parroquia',
  'Calle / Avenida',
  'Procedencia',
  'Estado',
  'Resultado',
]

export function textoParaPdf(value) {
  return textoLatin1(value)
}

function textoLatin1(value) {
  if (value == null || value === '') return '-'
  const s = String(value).replace(/\r\n|\n|\r/g, ' ').replace(/\t/g, ' ')
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c === 9) continue
    if (c >= 32 && c <= 126) out += s.charAt(i)
    else if (c >= 160 && c <= 255) out += s.charAt(i)
    else out += '?'
  }
  return out.length > 6000 ? `${out.slice(0, 6000)}...` : out
}

function nombreArchivoSeguro(nombre) {
  const base = (nombre || 'reporte').replace(/\.pdf$/i, '')
  const ascii = base.replace(/[^a-zA-Z0-9._-]/g, '_')
  return ascii.endsWith('.pdf') ? ascii : `${ascii}.pdf`
}

function intentarGuardarPdf(doc, fname) {
  if (typeof window === 'undefined') return false
  try {
    doc.save(fname)
    return true
  } catch (e1) {
    console.warn('[pdf] doc.save:', e1)
  }
  try {
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fname
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 800)
    return true
  } catch (e2) {
    console.warn('[pdf] descarga por blob:', e2)
  }
  try {
    const u = doc.output('bloburl')
    if (u) window.open(u, '_blank', 'noopener')
    return true
  } catch (e3) {
    console.warn('[pdf] abrir bloburl:', e3)
  }
  return false
}

function armarTabla(doc, logoDataUrl, tituloPrincipal, lineasInfo, tablaStartY, filas) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, 9, 16, 16)
    } catch (_) {}
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(textoLatin1(tituloPrincipal), 32, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80)
  lineasInfo.forEach((txt, i) => {
    doc.text(textoLatin1(txt), 32, 22 + i * 5)
  })
  doc.setTextColor(20)

  const body = filas.map((row) => row.map((cell) => textoLatin1(cell)))

  autoTable(doc, {
    startY: tablaStartY,
    head: [COLUMNAS_TABLA.map((h) => textoLatin1(h))],
    body,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 51, 204], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    margin: { left: 10, right: 10, top: 10, bottom: 15 },
    theme: 'striped',
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(90)
      doc.text(textoLatin1('Protección Civil Carabobo'), 10, pageHeight - 6)
    },
  })
}

function armarPdfManual(doc, logoDataUrl, tituloPrincipal, lineasInfo, tablaStartY, filas) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, 9, 16, 16)
    } catch (_) {}
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(textoLatin1(tituloPrincipal), 14, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80)
  let ly = 26
  lineasInfo.forEach((txt) => {
    doc.text(textoLatin1(txt), 14, ly)
    ly += 5
  })
  doc.setTextColor(0)
  ly = Math.max(tablaStartY, ly + 4)
  doc.setFontSize(8)
  filas.forEach((row) => {
    const texto = row.map((c) => textoLatin1(c)).join('  |  ')
    const lineas = doc.splitTextToSize(texto, 270)
    if (ly > 185) {
      doc.addPage()
      ly = 14
    }
    doc.text(lineas, 14, ly)
    ly += lineas.length * 4 + 3
  })
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(90)
  doc.text(textoLatin1('Proteccion Civil Carabobo'), 14, pageHeight - 8)
}

export function descargarPdfTablaIncidentes({
  logoDataUrl,
  tituloPrincipal,
  lineasInfo = [],
  tablaStartY,
  filas,
  nombreArchivo,
}) {
  const fname = nombreArchivoSeguro(nombreArchivo)
  let doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })

  try {
    armarTabla(doc, logoDataUrl, tituloPrincipal, lineasInfo, tablaStartY, filas)
    if (intentarGuardarPdf(doc, fname)) return
  } catch (err) {
    console.warn('[pdf] autoTable fallo, usando modo manual:', err)
  }

  try {
    doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
    armarPdfManual(doc, logoDataUrl, tituloPrincipal, lineasInfo, tablaStartY, filas)
    if (intentarGuardarPdf(doc, fname)) return
  } catch (err2) {
    console.error('[pdf] modo manual fallo:', err2)
  }

  alert(
    'No se pudo descargar el PDF. Pruebe con otro navegador o use el listado en Incidentes (Descargar PDF) o imprima esta pagina desde el menu del navegador.'
  )
}
