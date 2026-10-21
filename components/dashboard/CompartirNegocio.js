'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Icon from '@/components/ui/Icon'
import { SITE_NAME, SITE_URL } from '@/lib/sitio'

const TINTA = '#18181B'
const MARCA = '#E5482D'

// Tarjeta del panel para compartir el perfil: enlace, código QR y un cartel listo para imprimir.
// El QR siempre apunta al sitio publicado, aunque se genere desde el entorno local.
export default function CompartirNegocio({ negocioId, nombre }) {
  const enlace = `${SITE_URL}/negocio/${negocioId}`
  const [qr, setQr] = useState(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    let activo = true
    QRCode.toDataURL(enlace, { width: 640, margin: 1, color: { dark: TINTA, light: '#FFFFFF' } }).then(url => activo && setQr(url))
    return () => { activo = false }
  }, [enlace])

  async function copiar() {
    await navigator.clipboard.writeText(enlace)
    setCopiado(true)
    window.setTimeout(() => setCopiado(false), 2000)
  }

  // En celulares abre el menú de compartir; donde no existe (muchos computadores), copia el enlace.
  async function compartir() {
    if (typeof navigator.share !== 'function') return copiar()
    try {
      await navigator.share({ title: nombre, text: `Pide en ${nombre} por WhatsApp`, url: enlace })
    } catch {
      // La persona cerró el menú de compartir: no hay nada que hacer.
    }
  }

  async function descargarCartel() {
    descargar(await dibujarCartel(nombre, enlace), `cartel-${slug(nombre)}.png`)
  }

  return (
    <section className="card mt-10 p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Comparte tu negocio</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-subtle">Pega el cartel en tu mostrador o pon el enlace en tu Instagram y tu estado de WhatsApp. Quien lo abra verá tu perfil y podrá pedirte.</p>

          <label htmlFor="enlace-perfil" className="label mt-5">Enlace de tu perfil</label>
          <div className="flex gap-2">
            <input id="enlace-perfil" readOnly value={enlace} onFocus={event => event.target.select()} className="input min-w-0 flex-1 bg-paper text-sm text-ink-muted" />
            <button type="button" onClick={copiar} className="btn-dark h-12 shrink-0 px-4">{copiado ? <><Icon name="check" size={16} /> Copiado</> : 'Copiar'}</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={descargarCartel} className="btn-primary h-11"><Icon name="menu" size={18} /> Descargar cartel para imprimir</button>
            {qr && <a href={qr} download={`qr-${slug(nombre)}.png`} className="btn-secondary h-11">Descargar solo el QR</a>}
            <button type="button" onClick={compartir} className="btn-secondary h-11"><Icon name="share" size={18} /> Compartir</button>
          </div>
        </div>

        <div className="mx-auto w-44 shrink-0 rounded-2xl border border-line bg-white p-3 text-center sm:mx-0">
          {qr ? <img src={qr} alt={`Código QR del perfil de ${nombre}`} className="h-auto w-full" /> : <div className="aspect-square animate-pulse rounded-lg bg-chip" />}
          <p className="mt-2 text-xs text-ink-subtle">Escanéalo con la cámara</p>
        </div>
      </div>
    </section>
  )
}

function slug(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'negocio'
}

function descargar(url, nombreArchivo) {
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.click()
}

// Cartel vertical de 1080 × 1350 px con el nombre del negocio, el QR y la marca.
async function dibujarCartel(nombre, enlace) {
  const ancho = 1080
  const alto = 1350
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  const fuente = getComputedStyle(document.body).fontFamily

  ctx.fillStyle = '#FAFAF7'
  ctx.fillRect(0, 0, ancho, alto)
  ctx.fillStyle = MARCA
  ctx.fillRect(0, 0, ancho, 230)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `600 44px ${fuente}`
  ctx.fillText('¿Se te antojó?', ancho / 2, 105)
  ctx.font = `700 64px ${fuente}`
  ctx.fillText('Pídenos por WhatsApp', ancho / 2, 185)

  ctx.fillStyle = TINTA
  ctx.font = `700 76px ${fuente}`
  ajustarTexto(ctx, nombre, ancho - 160)
  ctx.fillText(nombre, ancho / 2, 350)

  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, enlace, { width: 620, margin: 2, color: { dark: TINTA, light: '#FFFFFF' } })
  const lado = 620
  const x = (ancho - lado) / 2
  ctx.fillStyle = '#FFFFFF'
  redondeado(ctx, x - 30, 410, lado + 60, lado + 60, 40)
  ctx.fill()
  ctx.drawImage(qrCanvas, x, 440, lado, lado)

  ctx.fillStyle = '#57534C'
  ctx.font = `500 40px ${fuente}`
  ctx.fillText('Escanea con la cámara de tu celular', ancho / 2, 1185)
  ctx.fillStyle = MARCA
  ctx.font = `700 44px ${fuente}`
  ctx.fillText(SITE_NAME, ancho / 2, 1270)

  return canvas.toDataURL('image/png')
}

// Reduce la letra hasta que el texto quepa en el ancho dado.
function ajustarTexto(ctx, texto, anchoMaximo) {
  let tamano = parseInt(ctx.font.match(/(\d+)px/)[1], 10)
  while (ctx.measureText(texto).width > anchoMaximo && tamano > 36) {
    tamano -= 4
    ctx.font = ctx.font.replace(/\d+px/, `${tamano}px`)
  }
}

function redondeado(ctx, x, y, ancho, alto, radio) {
  ctx.beginPath()
  ctx.moveTo(x + radio, y)
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio)
  ctx.arcTo(x + ancho, y + alto, x, y + alto, radio)
  ctx.arcTo(x, y + alto, x, y, radio)
  ctx.arcTo(x, y, x + ancho, y, radio)
  ctx.closePath()
}
