import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Buscador from '@/components/ui/Buscador'
import NegocioCard from '@/components/ui/NegocioCard'
import SiteHeader from '@/components/ui/SiteHeader'
import Icon from '@/components/ui/Icon'
import { CATEGORIAS_FILTRO, esCategoriaValida, obtenerCategoria } from '@/lib/categorias'
import { conEstado } from '@/lib/horario'

export const metadata = {
  title: 'ComidasCiénaga — Encuentra dónde comer en Ciénaga, Magdalena',
  description: 'Busca comida local, descubre negocios de Ciénaga y pide directamente por WhatsApp.',
  keywords: 'comida Ciénaga, restaurantes Ciénaga, comida rápida Ciénaga, dónde comer Ciénaga, Magdalena',
  openGraph: { siteName: 'ComidasCiénaga', title: 'ComidasCiénaga — Encuentra dónde comer en Ciénaga', description: 'Descubre sabores locales y pide directamente por WhatsApp.', type: 'website', locale: 'es_CO' },
}

const POPULARES = ['Hamburguesa', 'Almuerzo', 'Jugos', 'Postres']
const MAX_DESTACADOS = 3

export default async function Home({ searchParams }) {
  const { categoria = 'todos' } = await searchParams
  const categoriaActiva = esCategoriaValida(categoria) ? categoria : 'todos'
  const supabase = await createClient()
  let consulta = supabase.from('negocios').select('*, fotos_comida(url), tags(valor)').order('calificacion_promedio', { ascending: false })
  if (categoriaActiva !== 'todos') consulta = consulta.eq('categoria', categoriaActiva)
  const { data: negocios } = await consulta
  const listaNegocios = conEstado(negocios)
  const destacados = listaNegocios.filter(negocio => negocio.abierto_ahora).slice(0, MAX_DESTACADOS)
  const resto = listaNegocios.filter(negocio => !destacados.includes(negocio))
  const sinNegocios = listaNegocios.length === 0 && categoriaActiva === 'todos'

  // Los bloques de categoría siempre resumen todos los negocios, aunque haya un filtro activo.
  let todosLosNegocios = listaNegocios
  if (categoriaActiva !== 'todos') {
    const { data } = await supabase.from('negocios').select('categoria, abierto_ahora, horarios, pausado_hasta, calificacion_promedio, fotos_comida(url)').order('calificacion_promedio', { ascending: false })
    todosLosNegocios = conEstado(data)
  }
  const resumen = resumirCategorias(todosLosNegocios)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <section className="flex flex-col gap-8 pb-10 pt-8 sm:pt-14 lg:flex-row lg:items-center lg:gap-12">
          <div className="min-w-0 lg:flex-[1.15]">
            <p className="inline-flex h-[30px] items-center gap-2 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-muted">
              <span aria-hidden="true" className={`h-[7px] w-[7px] rounded-full ${sinNegocios ? 'bg-brand' : 'bg-ok-dot'}`} />
              {sinNegocios ? 'Nuevo en Ciénaga, Magdalena' : 'Ciénaga, Magdalena'}
            </p>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.02] tracking-[-0.045em] sm:text-6xl">¿Qué se te antoja <span className="text-brand">hoy?</span></h1>
            <p className="mt-4 max-w-[480px] text-base leading-relaxed text-ink-muted sm:text-lg">Descubre negocios locales, mira lo que venden y pídelo directo por WhatsApp.</p>
            <div className="mt-7 max-w-[560px]"><Buscador /></div>
            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-sm text-ink-subtle">
              <span>Populares:</span>
              {POPULARES.map(antojo => <Link key={antojo} href={`/buscar?q=${encodeURIComponent(antojo)}`} className="flex h-8 items-center rounded-full bg-chip px-3 text-ink transition hover:bg-line">{antojo}</Link>)}
            </div>
          </div>
          <CategoriaTiles activa={categoriaActiva} resumen={resumen} />
        </section>

        {sinNegocios ? <EstadoVacio /> : (
          <>
            {destacados.length > 0 && (
              <section aria-labelledby="abiertos-title" className="pt-2">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ok"><span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-ok-dot" />Disponibles ahora</p>
                    <h2 id="abiertos-title" className="mt-1.5 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">Abiertos para ti</h2>
                  </div>
                  <Link href="/buscar?estado=abierto" className="text-sm font-semibold text-brand-dark hover:underline">Ver todos →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{destacados.map(negocio => <NegocioCard key={negocio.id} negocio={negocio} />)}</div>
              </section>
            )}

            <section id="negocios" aria-labelledby="negocios-title" className={destacados.length > 0 ? 'pt-12' : 'pt-2'}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="negocios-title" className="text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">{categoriaActiva === 'todos' ? 'Lo que se cocina en Ciénaga' : obtenerCategoria(categoriaActiva).label}</h2>
                  <p className="mt-1 text-sm text-ink-subtle">{listaNegocios.length} {listaNegocios.length === 1 ? 'negocio' : 'negocios'}</p>
                </div>
                <FiltroCategorias activa={categoriaActiva} />
              </div>
              {listaNegocios.length === 0 ? <SinResultados categoria={categoriaActiva} /> : resto.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">{resto.map(negocio => <NegocioCard key={negocio.id} negocio={negocio} modo="fila" />)}</div>
              ) : (
                <p className="rounded-[18px] border border-dashed border-line-strong px-5 py-6 text-center text-sm text-ink-subtle">Todos los negocios de esta lista están abiertos arriba.</p>
              )}
            </section>

            <CtaNegocios />
          </>
        )}
      </main>
    </>
  )
}

// Por categoría: cuántos negocios hay, cuántos están abiertos y una foto representativa
// (la del negocio mejor calificado con foto, prefiriendo uno abierto). Llega ordenado por calificación.
function resumirCategorias(negocios) {
  const resumen = Object.fromEntries(CATEGORIAS_FILTRO.map(categoria => [categoria.valor, { total: 0, abiertos: 0, foto: null, fotoAbierto: false }]))
  for (const negocio of negocios) {
    const datos = resumen[negocio.categoria]
    if (!datos) continue
    datos.total++
    if (negocio.abierto_ahora) datos.abiertos++
    const foto = negocio.fotos_comida?.[0]?.url
    if (foto && (!datos.foto || (negocio.abierto_ahora && !datos.fotoAbierto))) {
      datos.foto = foto
      datos.fotoAbierto = Boolean(negocio.abierto_ahora)
    }
  }
  return resumen
}

function CategoriaTiles({ activa, resumen }) {
  // La categoría con más negocios ocupa el bloque grande; el resto mantiene su orden.
  const ordenadas = [...CATEGORIAS_FILTRO].sort((a, b) => resumen[b.valor].total - resumen[a.valor].total)
  return (
    <nav aria-label="Categorías" className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3 lg:flex-1 lg:grid-cols-2">
      {ordenadas.map((categoria, indice) => <CategoriaTile key={categoria.valor} categoria={categoria} datos={resumen[categoria.valor]} grande={indice === 0} activa={activa === categoria.valor} />)}
      <Link href="/buscar" className="flex h-[104px] flex-col justify-between rounded-2xl bg-chip p-3 text-ink transition hover:bg-line sm:h-32 sm:p-4 lg:hidden">
        <Icon name="arrowRight" size={22} />
        <span className="text-[13px] font-semibold sm:text-base">Ver todo</span>
      </Link>
    </nav>
  )
}

function CategoriaTile({ categoria, datos, grande, activa }) {
  const { total, abiertos, foto } = datos
  const tamano = grande ? 'lg:row-span-2 lg:h-auto lg:min-h-[280px] lg:p-5' : 'lg:h-[134px]'
  const anillo = activa ? 'ring-2 ring-brand ring-offset-2 ring-offset-paper' : ''
  const nombre = <><span className="lg:hidden">{categoria.corto}</span><span className="hidden lg:inline">{categoria.label}</span></>
  const detalle = total === 0
    ? 'Sin locales aún'
    : <>{total} {total === 1 ? 'lugar' : 'lugares'}{abiertos > 0 && <span className="hidden sm:inline"> · {abiertos} {abiertos === 1 ? 'abierto' : 'abiertos'}</span>}</>

  if (foto) {
    return (
      <Link href={`/?categoria=${categoria.valor}#negocios`} aria-current={activa ? 'page' : undefined} className={`group relative flex h-[104px] flex-col justify-end overflow-hidden rounded-2xl bg-ink p-3 text-white sm:h-32 sm:p-4 lg:rounded-[22px] ${tamano} ${anillo}`}>
        <img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />
        {abiertos > 0 && <span className="absolute right-2.5 top-2.5 hidden h-6 items-center gap-1.5 rounded-full bg-white/90 px-2 text-[11px] font-semibold text-ok sm:flex"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok-dot" />{abiertos} {abiertos === 1 ? 'abierto' : 'abiertos'}</span>}
        <span className="relative">
          <span className={`block font-semibold leading-tight ${grande ? 'text-sm sm:text-base lg:text-[26px] lg:font-bold lg:tracking-[-0.02em]' : 'text-sm sm:text-base'}`}>{nombre}</span>
          <span className="mt-0.5 block text-xs text-white/80 sm:text-[13px]">{total} {total === 1 ? 'lugar' : 'lugares'}</span>
        </span>
      </Link>
    )
  }

  const vacia = total === 0
  return (
    <Link href={`/?categoria=${categoria.valor}#negocios`} aria-current={activa ? 'page' : undefined} className={`flex h-[104px] flex-col justify-between rounded-2xl border p-3 transition sm:h-32 sm:p-4 lg:rounded-[22px] ${tamano} ${anillo} ${vacia ? 'border-dashed border-line-strong bg-transparent text-ink-muted hover:border-ink' : 'border-line bg-white text-ink hover:border-line-strong'}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] sm:h-10 sm:w-10 sm:rounded-xl ${categoria.tono}`}>
        <Icon name={categoria.icono} size={18} />
      </span>
      <span>
        <span className="block text-sm font-semibold leading-tight sm:text-base">{nombre}</span>
        <span className="mt-0.5 block text-xs text-ink-subtle sm:text-[13px]">{detalle}</span>
      </span>
    </Link>
  )
}

function FiltroCategorias({ activa }) {
  const opciones = [{ valor: 'todos', corto: 'Todo' }, ...CATEGORIAS_FILTRO]
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {opciones.map(opcion => {
        const seleccionada = opcion.valor === activa
        return <Link key={opcion.valor} href={opcion.valor === 'todos' ? '/#negocios' : `/?categoria=${opcion.valor}#negocios`} aria-current={seleccionada ? 'page' : undefined} className={`flex h-9 shrink-0 items-center rounded-[10px] px-3.5 text-sm transition ${seleccionada ? 'bg-ink font-medium text-white' : 'text-ink-muted hover:bg-chip'}`}>{opcion.corto}</Link>
      })}
    </div>
  )
}

function SinResultados({ categoria }) {
  const etiqueta = obtenerCategoria(categoria).label.toLowerCase()
  return (
    <div className="rounded-[20px] border border-dashed border-line-strong bg-white px-6 py-12 text-center">
      <p className="text-lg font-semibold">Aún no hay negocios de {etiqueta}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-subtle">Prueba con otra categoría o publica el tuyo y sé el primero.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/#negocios" className="btn-secondary">Ver todo</Link>
        <Link href="/registro" className="btn-primary">Registrar mi negocio</Link>
      </div>
    </div>
  )
}

function EstadoVacio() {
  return (
    <>
      <section aria-labelledby="vacio-title" className="pt-2">
        <h2 id="vacio-title" className="mb-4 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">Lo que se cocina en Ciénaga</h2>
        <div className="relative flex min-h-[400px] flex-col sm:min-h-[340px]">
          <div aria-hidden="true" className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map(indice => (
              <div key={indice} className={`card overflow-hidden ${indice > 0 ? 'hidden sm:block' : ''} ${indice > 1 ? 'sm:hidden lg:block' : ''}`}>
                <div className="h-36 bg-chip" />
                <div className="p-4">
                  <div className="h-3.5 w-3/5 rounded-md bg-line" />
                  <div className="mt-2.5 h-3 w-2/5 rounded-md bg-chip" />
                  <div className="mt-3.5 flex gap-1.5"><div className="h-6 w-20 rounded-lg bg-chip-soft" /><div className="h-6 w-16 rounded-lg bg-chip-soft" /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
            <div className="max-w-[460px] rounded-3xl border border-line-strong bg-white px-6 pb-6 pt-7 text-center">
              <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><Icon name="store" size={26} strokeWidth={1.8} /></span>
              <p className="mt-3.5 text-xl font-bold tracking-[-0.02em] sm:text-[22px]">Los primeros negocios están por llegar</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">¿Vendes comida en Ciénaga? Publica tu negocio gratis y sé de los primeros que verán los clientes.</p>
              <div className="mt-[18px] flex flex-wrap justify-center gap-2">
                <Link href="/registro" className="btn-primary">Registrar mi negocio</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pasos-title" className="mt-12 rounded-3xl bg-ink px-6 py-8 text-white sm:px-10 sm:py-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[13px] font-semibold text-peach">¿Vendes comida?</p>
            <h2 id="pasos-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Publica tu negocio en tres pasos</h2>
          </div>
          <Link href="/registro" className="btn-primary">Empezar gratis</Link>
        </div>
        <ol className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            ['Crea tu cuenta', 'Con tu correo y tu WhatsApp. Toma un minuto.'],
            ['Sube lo que vendes', 'Tus productos, fotos de la comida y tu carta.'],
            ['Recibe pedidos', 'Los clientes te escriben directo por WhatsApp.'],
          ].map(([titulo, texto], indice) => (
            <li key={titulo} className="rounded-[18px] bg-ink-soft p-5">
              <span className="text-sm font-semibold text-peach">0{indice + 1}</span>
              <p className="mt-2.5 text-lg font-semibold">{titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">{texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

function CtaNegocios() {
  return (
    <section className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-ink px-6 py-8 sm:px-10 sm:py-9">
      <div className="max-w-[560px]">
        <p className="text-[13px] font-semibold text-peach">¿Vendes comida?</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">Haz que te encuentren en Ciénaga.</h2>
        <p className="mt-2 text-base leading-relaxed text-white/65">Crea tu perfil gratis y recibe pedidos directamente por WhatsApp.</p>
      </div>
      <Link href="/registro" className="btn-primary">Registrar mi negocio</Link>
    </section>
  )
}
