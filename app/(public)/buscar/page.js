import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NegocioCard from '@/components/ui/NegocioCard'
import Buscador from '@/components/ui/Buscador'
import SiteHeader from '@/components/ui/SiteHeader'
import Icon from '@/components/ui/Icon'
import { CATEGORIAS_FILTRO, esCategoriaValida, obtenerCategoria } from '@/lib/categorias'
import { conEstado } from '@/lib/horario'
import { hacePedidosADomicilio } from '@/lib/pedidos'

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
  const conDomicilio = params.entrega === 'domicilio'
  const supabase = await createClient()
  const hayFiltros = Boolean(q) || categoria !== 'todos' || soloAbiertos || conDomicilio

  // Sin búsqueda ni filtros se muestran todos los negocios, abiertos y cerrados.
  let consulta = supabase.from('negocios').select('*, fotos_comida(url), tags(valor)').order('calificacion_promedio', { ascending: false })
  if (q) {
    const ids = await buscarIds(supabase, q)
    consulta = consulta.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
  }
  if (categoria !== 'todos') consulta = consulta.eq('categoria', categoria)
  const [{ data }, { data: todos }] = await Promise.all([
    consulta,
    // Resumen general para el panel lateral: siempre sobre todos los negocios.
    supabase.from('negocios').select('id, nombre, abierto_ahora, horarios, pausado_hasta, fotos_comida(url), tags(valor)').order('calificacion_promedio', { ascending: false }),
  ])
  // Abierto/cerrado se calcula con el horario, así que ese filtro se aplica aquí y no en la consulta.
  const negocios = conEstado(data).filter(negocio => (!soloAbiertos || negocio.abierto_ahora) && (!conDomicilio || hacePedidosADomicilio(negocio)))
  const abiertos = conEstado(todos).filter(negocio => negocio.abierto_ahora)
  const masVendidos = productosMasVendidos(todos || [])
  const ideas = masVendidos.length ? masVendidos : ANTOJOS

  function hrefConFiltros({ nuevaCategoria = categoria, nuevosAbiertos = soloAbiertos, nuevoDomicilio = conDomicilio }) {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (nuevaCategoria !== 'todos') next.set('categoria', nuevaCategoria)
    if (nuevosAbiertos) next.set('estado', 'abierto')
    if (nuevoDomicilio) next.set('entrega', 'domicilio')
    const query = next.toString()
    return query ? `/buscar?${query}` : '/buscar'
  }

  const opciones = [{ valor: 'todos', corto: 'Todo' }, ...CATEGORIAS_FILTRO]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-10 px-4 pb-16 sm:px-8">
        <div className="min-w-0 flex-1">
          <section className="pb-6 pt-8 sm:pt-10">
            <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{q ? <>Resultados para <span className="text-brand">“{q}”</span></> : 'Buscar comida o negocio'}</h1>
            <div className="mt-5 max-w-2xl"><Buscador key={q} valorInicial={q} /></div>
            <div className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {opciones.map(opcion => {
                // "Todo" quita la categoría y también "Abiertos ahora" y "Con domicilio": muestra todos los negocios.
                const esTodo = opcion.valor === 'todos'
                const activa = esTodo ? categoria === 'todos' && !soloAbiertos && !conDomicilio : opcion.valor === categoria
                return <Link key={opcion.valor} href={hrefConFiltros(esTodo ? { nuevaCategoria: 'todos', nuevosAbiertos: false, nuevoDomicilio: false } : { nuevaCategoria: opcion.valor })} aria-current={activa ? 'page' : undefined} className={`flex h-10 shrink-0 items-center rounded-[10px] px-3.5 text-sm transition ${activa ? 'bg-ink font-medium text-white' : 'border border-line bg-white text-ink-muted hover:border-line-strong'}`}>{opcion.corto}</Link>
              })}
              <Link href={hrefConFiltros({ nuevosAbiertos: !soloAbiertos })} aria-pressed={soloAbiertos} className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3.5 text-sm font-medium transition ${soloAbiertos ? 'bg-ok-soft text-ok ring-1 ring-ok/30' : 'border border-line bg-white text-ink-muted hover:border-line-strong'}`}>
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${soloAbiertos ? 'bg-ok-dot' : 'bg-ink-subtle/50'}`} />Abiertos ahora
              </Link>
              <Link href={hrefConFiltros({ nuevoDomicilio: !conDomicilio })} aria-pressed={conDomicilio} className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3.5 text-sm font-medium transition ${conDomicilio ? 'bg-brand-soft text-brand-dark ring-1 ring-brand/30' : 'border border-line bg-white text-ink-muted hover:border-line-strong'}`}>
                <Icon name="delivery" size={16} />Con domicilio
              </Link>
            </div>
            {!q && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-subtle lg:hidden">
                <span>Ideas:</span>
                {ideas.slice(0, 6).map(antojo => <Link key={antojo} href={`/buscar?q=${encodeURIComponent(antojo)}`} className="flex h-8 items-center rounded-full bg-chip px-3 text-ink transition hover:bg-line">{antojo}</Link>)}
              </div>
            )}
          </section>

          <section aria-label="Resultados">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm text-ink-subtle">{negocios.length} {negocios.length === 1 ? 'negocio' : 'negocios'}{categoria !== 'todos' && ` · ${obtenerCategoria(categoria).label}`}{soloAbiertos && ' · abiertos ahora'}{conDomicilio && ' · con domicilio'}</p>
              {hayFiltros && <Link href="/buscar" className="text-sm font-semibold text-brand-dark hover:underline">Limpiar filtros</Link>}
            </div>
            {negocios.length > 0
              ? <div className="grid gap-4 sm:grid-cols-2">{negocios.map(negocio => <NegocioCard key={negocio.id} negocio={negocio} />)}</div>
              : hayFiltros ? <SinResultados q={q} /> : <SinNegocios />}
          </section>
        </div>
        <PanelResumen abiertos={abiertos} ideas={ideas} soloAbiertos={soloAbiertos} hrefAbiertos={hrefConFiltros({ nuevosAbiertos: !soloAbiertos })} />
      </main>
    </>
  )
}

// Ids de los negocios cuyo nombre contiene el texto o que venden un producto que coincide.
async function buscarIds(supabase, q) {
  const patron = `%${q.replace(/[\\%_]/g, caracter => `\\${caracter}`)}%`
  const [{ data: porProducto }, { data: porNombre }] = await Promise.all([
    supabase.rpc('buscar_por_tag', { termino: q.toLowerCase() }),
    supabase.from('negocios').select('id').ilike('nombre', patron),
  ])
  return [...new Set([...(porProducto || []).map(negocio => negocio.negocio_id), ...(porNombre || []).map(negocio => negocio.id)])]
}

// Los productos que más negocios venden, para sugerir búsquedas.
function productosMasVendidos(negocios, limite = 8) {
  const conteo = new Map()
  for (const negocio of negocios) {
    for (const tag of new Set((negocio.tags || []).map(tag => tag.valor))) conteo.set(tag, (conteo.get(tag) || 0) + 1)
  }
  return [...conteo.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limite).map(([valor]) => valor)
}

// Panel de escritorio junto al buscador: quién está abierto y qué es lo que más se vende.
function PanelResumen({ abiertos, ideas, soloAbiertos, hrefAbiertos }) {
  const conFoto = abiertos.filter(negocio => negocio.fotos_comida?.[0]?.url)
  const caras = conFoto.slice(0, 4)
  const restantes = abiertos.length - caras.length
  return (
    <aside aria-label="Resumen" className="card sticky top-24 mt-10 hidden w-[320px] shrink-0 self-start p-5 lg:block">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ok"><span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-ok-dot" />Abiertos ahora</p>
      {abiertos.length > 0 ? (
        <>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-3xl font-bold tracking-[-0.03em]">{abiertos.length} <span className="text-base font-medium text-ink-subtle">{abiertos.length === 1 ? 'negocio' : 'negocios'}</span></p>
            <div className="flex -space-x-2.5">
              {caras.map(negocio => (
                <Link key={negocio.id} href={`/negocio/${negocio.id}`} title={negocio.nombre} className="relative h-10 w-10 overflow-hidden rounded-full bg-chip ring-2 ring-white transition hover:z-10 hover:scale-110">
                  <img src={negocio.fotos_comida[0].url} alt={negocio.nombre} className="h-full w-full object-cover" />
                </Link>
              ))}
              {restantes > 0 && <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-chip text-xs font-semibold text-ink-muted ring-2 ring-white">+{restantes}</span>}
            </div>
          </div>
          <Link href={hrefAbiertos} className={`mt-4 w-full ${soloAbiertos ? 'btn-secondary' : 'btn-dark'} h-11`}>{soloAbiertos ? 'Ver abiertos y cerrados' : 'Ver solo los abiertos'}</Link>
        </>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-subtle">Ahora mismo no hay negocios abiertos. Vuelve más tarde o mira sus horarios.</p>
      )}

      <div className="mt-5 border-t border-line pt-5">
        <p className="text-sm font-semibold">Lo que más venden en Ciénaga</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ideas.map(idea => <Link key={idea} href={`/buscar?q=${encodeURIComponent(idea)}`} className="flex h-8 items-center rounded-full bg-chip px-3 text-sm text-ink transition hover:bg-line">{idea}</Link>)}
        </div>
      </div>
    </aside>
  )
}

function SinNegocios() {
  return (
    <div className="rounded-[20px] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <h2 className="text-lg font-semibold">Aún no hay negocios publicados</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-subtle">Muy pronto encontrarás aquí los sabores de Ciénaga.</p>
      <Link href="/registro" className="btn-primary mt-5">Registrar mi negocio</Link>
    </div>
  )
}

function SinResultados({ q }) {
  return (
    <div className="rounded-[20px] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><Icon name="search" size={22} /></span>
      <h2 className="mt-5 text-lg font-semibold">Aún no encontramos esa opción</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-subtle">{q ? `No vemos negocios llamados o que vendan “${q}” con estos filtros.` : 'Prueba quitando filtros o busca otro plato.'}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/buscar" className="btn-secondary">Limpiar búsqueda</Link>
        <Link href="/registro" className="btn-primary">¿Vendes esto? Publícalo</Link>
      </div>
    </div>
  )
}
