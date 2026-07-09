import { createClient } from '@/lib/supabase/server'
import NegocioCard from '@/components/ui/NegocioCard'
import Buscador from '@/components/ui/Buscador'
import Link from 'next/link'

export default async function BuscarPage({ searchParams }) {
  const { q, categoria } = await searchParams
  const supabase = await createClient()

  let negocios = []

  if (q) {
    // Búsqueda por tag usando la función RPC que creamos en Supabase
    const { data } = await supabase.rpc('buscar_por_tag', { termino: q.toLowerCase() })
    negocios = data || []

    // Filtrar por categoría si viene el parámetro
    if (categoria && categoria !== 'todos') {
      negocios = negocios.filter(n => n.categoria === categoria)
    }
  } else if (categoria && categoria !== 'todos') {
    // Solo filtro por categoría sin búsqueda
    const { data } = await supabase
      .from('negocios')
      .select(`*, fotos_comida(url), tags(valor)`)
      .eq('categoria', categoria)
      .order('calificacion_promedio', { ascending: false })
    negocios = data || []
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">

      {/* Header */}
      <header className="bg-[#FAFAF8] px-4 pt-6 pb-3 flex items-center gap-3">
        <Link href="/" className="text-[#5F5E5A] text-lg">←</Link>
        <div className="flex-1">
          <Buscador valorInicial={q || ''} />
        </div>
      </header>

      {/* Resultado */}
      <div className="px-4 pt-2 pb-2">
        {q && (
          <p className="text-xs text-[#888780]">
            {negocios.length > 0
              ? `${negocios.length} local${negocios.length > 1 ? 'es' : ''} encontrado${negocios.length > 1 ? 's' : ''} para "${q}"`
              : `Sin resultados para "${q}"`
            }
          </p>
        )}
      </div>

      {/* Resultados */}
      <div className="px-4 pb-10">
        {negocios.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {negocios.map(negocio => (
              <NegocioCard
                key={negocio.negocio_id || negocio.id}
                negocio={{ ...negocio, id: negocio.negocio_id || negocio.id }}
                modo="grid"
              />
            ))}
          </div>
        ) : q ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm text-[#888780] mb-2">No encontramos locales que vendan <strong>"{q}"</strong></p>
            <p className="text-xs text-[#B4B2A9]">Intenta con otra palabra</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm text-[#888780]">Escribe lo que quieres comer</p>
          </div>
        )}
      </div>

    </main>
  )
}