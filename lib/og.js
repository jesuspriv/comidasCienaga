// Utilidades para las imágenes de vista previa (WhatsApp, Facebook, etc.) hechas con next/og.
import sharp from 'sharp'

export const TAMANO_OG = { width: 1200, height: 630 }

// next/og genera PNG de 700–900 KB con foto, y WhatsApp suele no mostrar la vista previa
// si la imagen pasa de ~300 KB. Se convierte a JPEG, que queda muy por debajo.
export async function comoJpeg(respuestaPng) {
  const png = Buffer.from(await respuestaPng.arrayBuffer())
  const jpeg = await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toBuffer()
  return new Response(jpeg, { headers: { 'Content-Type': 'image/jpeg' } })
}

// Fuentes del sitio en TTF (next/og no acepta woff2). Google Fonts entrega TTF cuando la
// petición no viene de un navegador. Si algo falla, next/og usa su fuente por defecto.
const FUENTES = [
  { name: 'Bricolage', familia: 'Bricolage+Grotesque', peso: 800 },
  { name: 'Geist', familia: 'Geist', peso: 400 },
  { name: 'Geist', familia: 'Geist', peso: 600 },
]

let fuentesEnMemoria = null

export async function fuentesOg() {
  if (fuentesEnMemoria) return fuentesEnMemoria
  try {
    fuentesEnMemoria = await Promise.all(FUENTES.map(async ({ name, familia, peso }) => {
      const css = await fetch(`https://fonts.googleapis.com/css2?family=${familia}:wght@${peso}`, { signal: AbortSignal.timeout(5000) }).then(r => r.text())
      const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1]
      if (!url) throw new Error(`Sin TTF para ${familia}`)
      const data = await fetch(url, { signal: AbortSignal.timeout(5000) }).then(r => r.arrayBuffer())
      return { name, data, weight: peso, style: 'normal' }
    }))
  } catch {
    fuentesEnMemoria = null
    return []
  }
  return fuentesEnMemoria
}

// El ícono de la marca (la hamburguesa) dentro de su cuadro rojo.
export function LogoOg({ lado = 40 }) {
  return (
    <div style={{ width: lado, height: lado, borderRadius: lado * 0.28, background: '#E5482D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={lado * 0.55} height={lado * 0.55} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11h16M6 11a6 6 0 0 1 12 0M5 15h14l-1 3H6l-1-3Z" /></svg>
    </div>
  )
}

// next/og solo dibuja JPG y PNG. Descarga la foto y la devuelve como data URL, o null si no
// se puede usar (formato WebP/AVIF, muy pesada, caída del servidor…) para mostrar un fondo de color.
export async function fotoParaOg(url) {
  if (!url) return null
  try {
    const respuesta = await fetch(url, { headers: { Accept: 'image/jpeg,image/png' }, signal: AbortSignal.timeout(5000) })
    const tipo = respuesta.headers.get('content-type')?.split(';')[0]
    if (!respuesta.ok || !['image/jpeg', 'image/png'].includes(tipo)) return null
    const datos = await respuesta.arrayBuffer()
    if (datos.byteLength > 3_000_000) return null
    return `data:${tipo};base64,${Buffer.from(datos).toString('base64')}`
  } catch {
    return null
  }
}
