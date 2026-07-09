import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: negocio } = await supabase
    .from('negocios')
    .select('nombre, categoria, direccion, tags(valor)')
    .eq('id', id)
    .single()

  if (!negocio) return { title: 'Negocio no encontrado' }

  const tags = negocio.tags?.map(t => t.valor).join(', ')

  return {
    title: `${negocio.nombre} — ComidasCiénaga`,
    description: `${negocio.nombre} en Ciénaga, Magdalena. Vende: ${tags}. Encuéntralo en ComidasCiénaga.`,
    keywords: `${negocio.nombre}, ${tags}, comida Ciénaga, ${negocio.categoria} Ciénaga`,
    openGraph: {
      title: negocio.nombre,
      description: `Encuentra ${negocio.nombre} en Ciénaga — ${tags}`,
      type: 'website',
      locale: 'es_CO',
    }
  }
}

export default async function PerfilNegocio({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: negocio } = await supabase
    .from('negocios')
    .select(`*, fotos_comida(url), tags(valor), cartas(url, tipo)`)
    .eq('id', id)
    .single()

  if (!negocio) return notFound()

  const CATEGORIAS = {
    comida_rapida: '🍔 Comida rápida',
    bebidas:       '🥤 Bebidas y café',
    postres:       '🍓 Dulces y postres',
    tipica:        '🍲 Comida típica',
    parrilla:      '🥩 Parrilla',
    otros:         '📦 Otros',
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">

      {/* Hero */}
      <div className="h-48 bg-[#FAEEDA] flex items-center justify-center text-7xl relative">
        {negocio.fotos_comida?.[0]?.url
          ? <img src={negocio.fotos_comida[0].url} alt={negocio.nombre} className="w-full h-full object-cover" />
          : '🍽️'
        }
            <BackButton />
      </div>

      <div className="px-4 pt-4">

        {/* Nombre y badge */}
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-xl font-semibold text-[#2C2C2A]">{negocio.nombre}</h1>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            negocio.abierto_ahora ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#F1EFE8] text-[#888780]'
          }`}>
            {negocio.abierto_ahora ? 'Abierto ahora' : 'Cerrado'}
          </span>
        </div>

        {/* Categoría */}
        <p className="text-sm text-[#888780] mb-3">
          {CATEGORIAS[negocio.categoria]} · Ciénaga, Magdalena
        </p>

        {/* Calificación */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#BA7517]">⭐</span>
          <span className="text-sm font-medium text-[#2C2C2A]">
            {negocio.calificacion_promedio > 0 ? negocio.calificacion_promedio : 'Sin calificaciones aún'}
          </span>
          {negocio.total_calificaciones > 0 && (
            <span className="text-sm text-[#888780]">({negocio.total_calificaciones} reseñas)</span>
          )}
        </div>

        <hr className="border-[#E8E6E0] mb-4" />

        {/* Info */}
        {negocio.horario && (
          <div className="flex items-center gap-3 text-sm text-[#5F5E5A] mb-3">
            <span>🕐</span> {negocio.horario}
          </div>
        )}
        {negocio.direccion && (
          <div className="flex items-center gap-3 text-sm text-[#5F5E5A] mb-4">
            <span>📍</span> {negocio.direccion}
          </div>
        )}

        <hr className="border-[#E8E6E0] mb-4" />

        {/* Fotos */}
        {negocio.fotos_comida?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[#2C2C2A] mb-3">Fotos del local</h2>
            <div className="grid grid-cols-3 gap-2">
              {negocio.fotos_comida.map((foto, i) => (
                <div key={i} className="h-24 rounded-xl overflow-hidden bg-[#F1EFE8]">
                  <img src={foto.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {negocio.tags?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[#2C2C2A] mb-3">Lo que venden</h2>
            <div className="flex flex-wrap gap-2">
              {negocio.tags.map(tag => (
                <span key={tag.valor} className="text-xs px-3 py-1.5 rounded-full bg-[#FAECE7] text-[#993C1D] border border-[#F0997B]">
                  {tag.valor}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr className="border-[#E8E6E0] mb-4" />

        {/* Botones */}
        <a
          href={`https://wa.me/${negocio.whatsapp?.replace(/\D/g, '')}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full bg-[#E8593C] text-white rounded-xl py-3 text-sm font-medium mb-3"
        >
          💬 Contactar por WhatsApp
        </a>

        {negocio.cartas?.[0] && (
          <a
            href={negocio.cartas[0].url}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full bg-white border border-[#D3D1C7] text-[#2C2C2A] rounded-xl py-3 text-sm mb-6"
          >
            📄 Ver carta del menú
          </a>
        )}

      </div>
    </main>
  )
}