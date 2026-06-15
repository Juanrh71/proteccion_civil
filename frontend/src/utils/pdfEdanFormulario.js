import { createApp, h, nextTick } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import EdanPlanillaOficial from '../components/EdanPlanillaOficial.vue'
import { nombreArchivoEdan } from './edanFormulario.js'

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

function esperarImagenes(root) {
  const imgs = root.querySelectorAll('img')
  const promesas = Array.from(imgs).map(
    (img) =>
      new Promise((resolve) => {
        if (img.complete) {
          resolve()
          return
        }
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })
  )
  return Promise.all(promesas)
}

async function renderPlanillaElemento(data, logoDataUrl) {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-10000px'
  host.style.top = '0'
  host.style.width = '1123px'
  host.style.background = '#fff'
  host.style.zIndex = '-1'
  document.body.appendChild(host)

  const app = createApp({
    render: () =>
      h(EdanPlanillaOficial, {
        data,
        logoPcUrl: logoDataUrl || '/imagenes/logo.png',
      }),
  })
  app.mount(host)
  await nextTick()
  await esperarImagenes(host)
  await new Promise((r) => setTimeout(r, 80))

  const sheet = host.querySelector('.edan-planilla-oficial')
  if (!sheet) {
    app.unmount()
    host.remove()
    throw new Error('No se pudo renderizar la planilla EDAN.')
  }
  return { sheet, cleanup: () => { app.unmount(); host.remove() } }
}

async function capturarPlanillaCanvas(element) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  })
}

export async function descargarPdfEdanFormulario({ data, logoDataUrl, nombreArchivo, element }) {
  let sheet = element?.querySelector?.('.edan-planilla-oficial') || element
  let cleanup = null

  if (!sheet) {
    const rendered = await renderPlanillaElemento(data, logoDataUrl)
    sheet = rendered.sheet
    cleanup = rendered.cleanup
  }

  try {
    const canvas = await capturarPlanillaCanvas(sheet)
    const imgData = canvas.toDataURL('image/png', 1.0)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    doc.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST')
    const fname = (nombreArchivo || nombreArchivoEdan(data)).replace(/[^a-zA-Z0-9._-]/g, '_')
    if (!intentarGuardarPdf(doc, fname)) {
      throw new Error('No se pudo descargar el PDF.')
    }
  } finally {
    if (cleanup) cleanup()
  }
}
