import { createClient } from '@/lib/supabase/server'
import Buscador from '@/components/ui/Buscador'
import NegocioCard from '@/components/ui/NegocioCard'

export const metadata = {
  title: 'ComidasCiénaga — Encuentra dónde comer en Ciénaga, Magdalena',
  description: 'Directorio gastronómico de Ciénaga. Busca hamburguesas, fritanga, jugos, comida típica y más. Descubre todos los locales de comida de Ciénaga, Magdalena.',
  keywords: 'comida Ciénaga, restaurantes Ciénaga, comida rápida Ciénaga, donde comer Ciénaga, Magdalena, fritanga Ciénaga, hamburguesa Ciénaga',
  openGraph: {
    title: 'ComidasCiénaga — Encuentra dónde comer en Ciénaga',
    description: 'Descubre todos los locales de comida de Ciénaga, Magdalena en un solo lugar.',
    type: 'website',
    locale: 'es_CO',
  }
}

export default async function Home() {
  const supabase = await createClient()

  // Traer todos los negocios ordenados por calificación
  const { data: negocios } = await supabase
    .from('negocios')
    .select(`*, fotos_comida(url), tags(valor)`)
    .order('calificacion_promedio', { ascending: false })

  // Negocios abiertos ahora
  const abiertos = negocios?.filter(n => n.abierto_ahora) || []

  // Categorías
  const categorias = [
    { valor: 'todos',        emoji: '🍽️', label: 'Todos' },
    { valor: 'comida_rapida', emoji: '🍔', label: 'Comida rápida' },
    { valor: 'bebidas',      emoji: '🥤', label: 'Bebidas' },
    { valor: 'postres',      emoji: '🍓', label: 'Postres' },
    { valor: 'tipica',       emoji: '🍲', label: 'Típica' },
    { valor: 'parrilla',     emoji: '🥩', label: 'Parrilla' },
    { valor: 'otros',        emoji: '📦', label: 'Otros' },
  ]

  return (
    <main className="min-h-screen bg-[#FAFAF8]">

      {/* Header */}
      <header className="bg-[#FAFAF8] px-4 pt-6 pb-3 flex items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-semibold text-[#2C2C2A] truncate">
          Comidas<span className="text-[#E8593C]">Ciénaga</span>
        </h1>
        <div className="flex items-center gap-1.5 flex-shrink-0">
            <a href="/login" className="text-sm text-[#5F5E5A] font-medium border border-[#D3D1C7] px-3 py-1 rounded-full hover:border-[#E8593C] hover:text-[#E8593C] transition-colors">
                Entrar
            </a>
            <a href="/registro" className="text-sm text-white font-medium bg-[#E8593C] px-3 py-1 rounded-full hover:bg-[#D14E34] transition-colors">
                Registra tu negocio
            </a>
            </div>
      </header>

      {/* Buscador */}
      <div className="px-4 pb-4">
        <Buscador />
      </div>

      {/* Categorías */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {categorias.map(cat => (
          <a
            key={cat.valor}
            href={cat.valor === 'todos' ? '/' : `/?categoria=${cat.valor}`}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-[#D3D1C7] bg-white text-[#5F5E5A] whitespace-nowrap hover:border-[#E8593C] hover:text-[#E8593C] transition-colors"
          >
            {cat.emoji} {cat.label}
          </a>
        ))}
      </div>

      {/* Abiertos ahora */}
      {abiertos.length > 0 && (
        <section className="px-4 pb-6">
          <h2 className="text-sm font-medium text-[#2C2C2A] mb-3">Abiertos ahora</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {abiertos.map(negocio => (
              <NegocioCard key={negocio.id} negocio={negocio} modo="horizontal" />
            ))}
          </div>
        </section>
      )}

      {/* Todos los negocios */}
      <section className="px-4 pb-10">
        <h2 className="text-sm font-medium text-[#2C2C2A] mb-3">
          {negocios?.length > 0 ? ` Lo que se cocina en Cienaga` : 'Todos los negocios'}
        </h2>
        {negocios?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {negocios.map(negocio => (
              <NegocioCard key={negocio.id} negocio={negocio} modo="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#888780]">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm">Aún no hay negocios registrados.</p>
            <a href="/registro" className="text-[#E8593C] text-sm font-medium mt-2 inline-block">
              ¡Sé el primero!
            </a>
          </div>
        )}
      </section>

    </main>
  )
}