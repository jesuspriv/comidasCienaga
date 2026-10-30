import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { obtenerCategoria } from '@/lib/categorias'
import { etiquetaPago, resumenEntrega, tienePedidos } from '@/lib/pedidos'
import { MOSTRAR_PRUEBA } from '@/lib/negocios'
import { LogoOg, TAMANO_OG, comoJpeg, fotoParaOg, fuentesOg } from '@/lib/og'

// Imagen que aparece al compartir el perfil de un negocio por WhatsApp, Facebook, etc.
export const alt = 'Perfil de un negocio de comida en ComidasCiénaga'
export const size = TAMANO_OG
export const contentType = 'image/jpeg'
// Se regenera cada hora para reflejar cambios de foto, nombre o productos.
export const revalidate = 3600

// Colores de fondo por categoría cuando el negocio no tiene foto utilizable.
const FONDOS = { comida_rapida: '#FBE3DC', bebidas: '#E3F2F0', postres: '#FDEBF1', tipica: '#FDF3D8', parrilla: '#2E2E33', otros: '#F1EFE9' }

// Nota: next/og exige display:flex en todo div con más de un hijo, y no acepta fragmentos <>.
export default async function Image({ params }) {
  const { id } = await params
  // Datos públicos: basta el cliente anónimo, sin cookies de sesión.
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  const [{ data: negocio }, fonts] = await Promise.all([
    supabase.from('negocios').select('nombre, categoria, es_prueba, pedidos, fotos_comida(url), tags(valor)').eq('id', id).maybeSingle(),
    fuentesOg(),
  ])
  const visible = negocio && (!negocio.es_prueba || MOSTRAR_PRUEBA)

  const categoria = obtenerCategoria(visible ? negocio.categoria : 'otros')
  const foto = visible ? await fotoParaOg(negocio.fotos_comida?.[0]?.url) : null
  const productos = visible ? (negocio.tags || []).slice(0, 3).map(tag => tag.valor) : []
  const pedidos = visible && tienePedidos(negocio.pedidos) ? negocio.pedidos : null
  const entrega = resumenEntrega(pedidos)
  const pagos = pedidos?.pagos?.slice(0, 3).map(etiquetaPago) || []

  return comoJpeg(new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#FAFAF7', fontFamily: 'Geist' }}>
        <div style={{ width: 500, height: 630, display: 'flex', alignItems: 'center', justifyContent: 'center', background: FONDOS[categoria.valor] || '#F1EFE9' }}>
          {foto
            ? <img src={foto} alt="" width={500} height={630} style={{ width: 500, height: 630, objectFit: 'cover' }} />
            : <LogoOg lado={150} />}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogoOg lado={40} />
            <div style={{ fontSize: 26, fontWeight: 600, color: '#18181B' }}>ComidasCiénaga</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {visible ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#C93A1F', background: '#FBE3DC', padding: '8px 18px', borderRadius: 999 }}>{categoria.label}</div>
                <div style={{ marginTop: 20, fontFamily: 'Bricolage', fontSize: negocio.nombre.length > 18 ? 58 : 72, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, color: '#18181B' }}>{negocio.nombre}</div>
                {productos.length > 0 && <div style={{ marginTop: 16, fontSize: 28, color: '#57534C' }}>{productos.join(' · ')}</div>}
                {entrega && <div style={{ marginTop: 24, fontSize: 28, fontWeight: 600, color: '#18181B' }}>{`${entrega.principal}${entrega.detalle ? ` · ${entrega.detalle}` : ''}`}</div>}
                {pagos.length > 0 && <div style={{ marginTop: 6, fontSize: 24, color: '#6B675F' }}>{`Pagos: ${pagos.join(', ')}`}</div>}
              </div>
            ) : (
              <div style={{ fontFamily: 'Bricolage', fontSize: 62, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: '#18181B' }}>Encuentra dónde comer en Ciénaga</div>
            )}
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#FFFFFF', background: '#E5482D', padding: '14px 26px', borderRadius: 16 }}>Pídelo por WhatsApp</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  ))
}
