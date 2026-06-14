import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  filasDetalleFamiliar,
  formatearFechaEdan,
  nombreArchivoEdan,
  seccionesFormularioEdan,
} from './edanFormulario.js'

function textoLatin1(value) {
  if (value == null || value === '') return '-'
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

function intentarGuardarPdf(doc, fname) {
  if (typeof window === 'undefined') return false
  try {
    doc.save(fname)
    return true
  } catch (_) {}
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
  } catch (_) {}
  return false
}

function dibujarEncabezado(doc, logoDataUrl, data) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 10, 6, 14, 14)
    } catch (_) {}
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(0, 51, 120)
  doc.text('FORMULARIO EDAN', logoDataUrl ? 27 : 10, 11)
  doc.setFontSize(8)
  doc.setTextColor(60)
  const idTxt = data?.id != null ? `N° ${data.id}` : 'Registro'
  doc.text(
    textoLatin1(`${idTxt}  |  Planilla: ${data?.numero_planilla || '-'}  |  ${formatearFechaEdan(data?.fecha_reporte || new Date())}`),
    logoDataUrl ? 27 : 10,
    16
  )
  doc.setDrawColor(0, 51, 204)
  doc.setLineWidth(0.4)
  doc.line(10, 19, 200, 19)
  doc.setTextColor(20)
  return 22
}

function dibujarCampo(doc, x, y, ancho, label, value) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.6)
  doc.text(textoLatin1(`${label}:`), x, y)
  doc.setFont('helvetica', 'normal')
  const lines = doc.splitTextToSize(textoLatin1(value), ancho)
  doc.text(lines.slice(0, 3), x, y + 2.1)
  const alto = 2.1 + Math.min(lines.length, 3) * 2.05
  return y + alto + 0.6
}

function dibujarSeccion(doc, y, titulo, campos) {
  if (y > 268) return y
  doc.setFillColor(238, 244, 255)
  doc.rect(10, y - 3.2, 190, 4.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(0, 51, 120)
  doc.text(textoLatin1(titulo), 10, y)
  doc.setTextColor(20)
  y += 3.5

  const izq = campos.filter((c) => !c.full)
  const full = campos.filter((c) => c.full)
  let yIzq = y
  let yDer = y
  const mitad = Math.ceil(izq.length / 2)
  const col1 = izq.slice(0, mitad)
  const col2 = izq.slice(mitad)

  for (const c of col1) {
    yIzq = dibujarCampo(doc, 10, yIzq, 88, c.label, c.value)
  }
  for (const c of col2) {
    yDer = dibujarCampo(doc, 105, yDer, 88, c.label, c.value)
  }
  y = Math.max(yIzq, yDer)

  for (const c of full) {
    y = dibujarCampo(doc, 10, y, 183, c.label, c.value)
  }
  return y + 1
}

export function descargarPdfEdanFormulario({ data, logoDataUrl, nombreArchivo }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  let y = dibujarEncabezado(doc, logoDataUrl, data)

  for (const sec of seccionesFormularioEdan(data)) {
    y = dibujarSeccion(doc, y, sec.titulo, sec.campos)
    if (y > 255) break
  }

  const filasFam = filasDetalleFamiliar(data).map((row) => row.map((cell) => textoLatin1(cell)))
  const startFam = Math.min(Math.max(y, 22), 235)
  const maxFilasFam = Math.max(2, Math.min(filasFam.length, Math.floor((278 - startFam) / 4.5)))

  autoTable(doc, {
    startY: startFam,
    margin: { left: 10, right: 10, bottom: 14 },
    tableWidth: 190,
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    head: [['Nombre y apellido', 'Cédula', 'Edad', 'Sexo'].map((h) => textoLatin1(h))],
    body: filasFam.slice(0, maxFilasFam),
    theme: 'grid',
    styles: { fontSize: 5.5, cellPadding: 0.8, overflow: 'linebreak' },
    headStyles: { fillColor: [0, 51, 204], textColor: 255, fontStyle: 'bold', fontSize: 6 },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 28 },
      2: { cellWidth: 14 },
      3: { cellWidth: 22 },
    },
    didDrawPage: (hook) => {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(5.5)
      doc.setTextColor(100)
      doc.text(
        textoLatin1(`IASIEDAGREC - Protección Civil Carabobo | Generado ${formatearFechaEdan(new Date())}`),
        10,
        292
      )
      if (filasFam.length > maxFilasFam && hook.pageNumber === 1) {
        doc.text(
          textoLatin1(`(+${filasFam.length - maxFilasFam} afectados adicionales; use la vista previa completa en pantalla)`),
          10,
          287
        )
      }
    },
  })

  const fname = nombreArchivo || nombreArchivoEdan(data)
  if (!intentarGuardarPdf(doc, fname.replace(/[^a-zA-Z0-9._-]/g, '_'))) {
    throw new Error('No se pudo descargar el PDF.')
  }
}
