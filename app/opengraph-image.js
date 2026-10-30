import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { LogoOg, TAMANO_OG, comoJpeg, fuentesOg } from '@/lib/og'

// Imagen que aparece al compartir cualquier enlace del sitio (WhatsApp, Facebook…),
// salvo los perfiles de negocio, que tienen la suya.
export const alt = 'ComidasCiénaga — ¿Qué se te antoja hoy? El directorio de comida de Ciénaga, Magdalena'
export const size = TAMANO_OG
export const contentType = 'image/jpeg'

export default async function Image() {
  const [portada, fonts] = await Promise.all([readFile(join(process.cwd(), 'public/inicio/portada.jpg')), fuentesOg()])
  const foto = `data:image/jpeg;base64,${portada.toString('base64')}`

  return comoJpeg(new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#1B1410', fontFamily: 'Geist' }}>
        <img src={foto} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', background: 'linear-gradient(90deg, rgba(20,14,10,0.95) 0%, rgba(20,14,10,0.8) 48%, rgba(20,14,10,0.1) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', width: 780 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LogoOg lado={56} />
            <div style={{ fontSize: 34, fontWeight: 600, color: '#FFFFFF' }}>ComidasCiénaga</div>
          </div>
          <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', fontFamily: 'Bricolage', fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: '#FFFFFF' }}>
            <div>¿Qué se te antoja</div>
            <div style={{ color: '#FF7A52' }}>hoy?</div>
          </div>
          <div style={{ marginTop: 30, fontSize: 32, lineHeight: 1.35, color: '#E9DCCF' }}>Encuentra dónde comer en Ciénaga y pídelo directo por WhatsApp.</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  ))
}
