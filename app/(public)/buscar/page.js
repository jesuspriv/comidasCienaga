import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NegocioCard from '@/components/ui/NegocioCard'
import Buscador from '@/components/ui/Buscador'
import SiteHeader from '@/components/ui/SiteHeader'
import Icon from '@/components/ui/Icon'
import { CATEGORIAS_FILTRO, esCategoriaValida, obtenerCategoria } from '@/lib/categorias'

export const metadata = {
  title: 'Buscar comida — ComidasCiénaga',
  description: 'Busca platos y negocios de comida en Ciénaga, Magdalena.',
}

const ANTOJOS = ['Hamburguesa', 'Almuerzo', 'Jugos', 'Postres', 'Sancocho', 'Arepa']

export default async function BuscarPage({ searchParams }) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const categoria = esCategoriaValida(params.categoria) ? params.categoria : 'todos'
  const soloAbiertos = params.estado === 'abierto'
  const supabase = await createClient()
  const hayFiltros = Boolean(q) || categoria !== 'todos' || soloAbiertos
  let negocios = []

  if (hayFiltros) {
    let consulta = supabase.from('negocios').select('*, fotos_comida(url), tags(valor)').order('calificacion_promedio', { ascending: false })
    if (q) {
      // La búsqueda por producto devuelve solo ids; luego se traen las fotos y productos de esos negocios.
      const { data: coincidencias } = await supabase.rpc('buscar_por_tag', { termino: q.toLowerCase() })
      const ids = (coincidencias || []).map(negocio => negocio.negocio_id)
      consulta = consulta.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    }
    if (categoria !== 'todos') consulta = consulta.eq('categoria', categoria)
    if (soloAbiertos) consulta = consulta.eq('abierto_ahora', true)
    const { data } = await consulta
    negocios = data || []
  }

  function hrefConFiltros({ nuevaCategoria = categoria, nuevosAbiertos = soloAbiertos }) {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (nuevaCategoria !== 'todos') next.set('categoria', nuevaCategoria)
    if (nuevosAbiertos) next.set('estado', 'abierto')
    const query = next.toString()
    return query ? `/buscar?${query}` : '/buscar'
  }

  const opciones = [{ valor: 'todos', corto: 'Todo' }, ...CATEGORIAS_FILTRO]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <section className="pb-6 pt-8 sm:pt-10">
          <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{q ? <>Resultados para <span className="text-brand">“{q}”</span></> : 'Buscar comida'}</h1>
          <div className="mt-5 max-w-2xl"><Buscador key={q} valorInicial={q} /></div>
          <div className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {opciones.map(opcion => {
              const activa = opcion.valor === categoria
              return <Link key={opcion.valor} href={hrefConFiltros({ nuevaCategoria: opcion.valor })} aria-current={activa ? 'page' : undefined} className={`flex h-10 shrink-0 items-center rounded-[10px] px-3.5 text-sm transition ${activa ? 'bg-ink font-medium text-white' : 'border border-line bg-white text-ink-muted hover:border-line-strong'}`}>{opcion.corto}</Link>
            })}
            <Link href={hrefConFiltros({ nuevosAbiertos: !soloAbiertos })} aria-pressed={soloAbiertos} className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3.5 text-sm font-medium transition ${soloAbiertos ? 'bg-ok-soft text-ok ring-1 ring-ok/30' : 'border border-line bg-white text-ink-muted hover:border-line-strong'}`}>
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${soloAbiertos ? 'bg-ok-dot' : 'bg-ink-subtle/50'}`} />Abiertos ahora
            </Link>
          </div>
        </section>

        <section aria-label="Resultados">
          {hayFiltros ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-ink-subtle">{negocios.length} {negocios.length === 1 ? 'negocio' : 'negocios'}{categoria !== 'todos' && ` · ${obtenerCategoria(categoria).label}`}{soloAbiertos && ' · abiertos ahora'}</p>
                <Link href="/buscar" className="text-sm font-semibold text-brand-dark hover:underline">Limpiar filtros</Link>
              </div>
              {negocios.length > 0
                ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{negocios.map(negocio => <NegocioCard key={negocio.id} negocio={negocio} />)}</div>
                : <SinResultados q={q} />}
            </>
          ) : <EmpezarBusqueda />}
        </section>
      </main>
    </>
  )
}

function EmpezarBusqueda() {
  return (
    <div className="card p-6 sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><Icon name="search" size={21} /></span>
      <h2 className="mt-5 text-xl font-bold tracking-[-0.02em]">Empieza por un antojo</h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-muted">Escribe un plato o elige una idea y te mostramos los negocios de Ciénaga que lo venden.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {ANTOJOS.map(antojo => <Link key={antojo} href={`/buscar?q=${encodeURIComponent(antojo)}`} className="flex h-10 items-center rounded-full bg-chip px-4 text-sm font-medium text-ink transition hover:bg-line">{antojo}</Link>)}
      </div>
    </div>
  )
}

function SinResultados({ q }) {
  return (
    <div className="rounded-[20px] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><Icon name="search" size={22} /></span>
      <h2 className="mt-5 text-lg font-semibold">Aún no encontramos esa opción</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-subtle">{q ? `No vemos negocios que vendan “${q}” con estos filtros.` : 'Prueba quitando filtros o busca otro plato.'}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/buscar" className="btn-secondary">Limpiar búsqueda</Link>
        <Link href="/registro" className="btn-primary">¿Vendes esto? Publícalo</Link>
      </div>
    </div>
  )
}
