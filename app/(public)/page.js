import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Buscador from '@/components/ui/Buscador'
import SiteHeader from '@/components/ui/SiteHeader'
import Icon from '@/components/ui/Icon'
import { CATEGORIAS_FILTRO, esCategoriaValida, obtenerCategoria } from '@/lib/categorias'
import { conEstado } from '@/lib/horario'
import { resumenEntrega } from '@/lib/pedidos'
import { sinPrueba } from '@/lib/negocios'

export const metadata = {
  title: 'ComidasCiénaga — Encuentra dónde comer en Ciénaga, Magdalena',
  description: 'Busca comida local, descubre negocios de Ciénaga y pide directamente por WhatsApp.',
  keywords: 'comida Ciénaga, restaurantes Ciénaga, comida rápida Ciénaga, dónde comer Ciénaga, Magdalena',
  openGraph: { siteName: 'ComidasCiénaga', title: 'ComidasCiénaga — Encuentra dónde comer en Ciénaga', description: 'Descubre sabores locales y pide directamente por WhatsApp.', type: 'website', locale: 'es_CO' },
}

const MAX_DESTACADOS = 3
const MAX_MOSAICO = 5

export default async function Home({ searchParams }) {
  const { categoria = 'todos' } = await searchParams
  const categoriaActiva = esCategoriaValida(categoria) ? categoria : 'todos'
  const supabase = await createClient()
  let consulta = sinPrueba(supabase.from('negocios').select('*, fotos_comida(url), tags(valor)').order('calificacion_promedio', { ascending: false }))
  if (categoriaActiva !== 'todos') consulta = consulta.eq('categoria', categoriaActiva)
  const { data: negocios } = await consulta
  const listaNegocios = conEstado(negocios)
  const destacados = listaNegocios.filter(negocio => negocio.abierto_ahora && foto(negocio)).slice(0, MAX_DESTACADOS)
  const resto = listaNegocios.filter(negocio => !destacados.includes(negocio))

  // La portada, las categorías y el mosaico siempre usan todos los negocios, aunque haya un filtro activo.
  let todos = listaNegocios
  if (categoriaActiva !== 'todos') {
    const { data } = await sinPrueba(supabase.from('negocios').select('id, nombre, categoria, abierto_ahora, horarios, pausado_hasta, calificacion_promedio, fotos_comida(url), tags(valor)').order('calificacion_promedio', { ascending: false }))
    todos = conEstado(data)
  }
  const sinNegocios = todos.length === 0
  const resumen = resumirCategorias(todos)
  const abiertos = todos.filter(negocio => negocio.abierto_ahora).length
  const mosaico = armarMosaico(todos)

  return (
    <div className="min-h-screen bg-crema text-cafe">
      <Portada abiertos={abiertos} sinNegocios={sinNegocios} />

      <main className="mx-auto max-w-6xl pb-16">
        <Categorias activa={categoriaActiva} resumen={resumen} />

        {sinNegocios ? <div className="px-4 sm:px-8"><EstadoVacio /></div> : (
          <>
            {destacados.length > 0 && (
              <section aria-labelledby="abiertos-title" className="pt-12 sm:pt-14">
                <div className="flex items-end justify-between gap-4 px-4 sm:px-8">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-ok"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-ok-dot" />Abiertos ahora</p>
                    <h2 id="abiertos-title" className="mt-1.5 font-display text-[26px] font-extrabold tracking-[-0.03em] sm:text-[34px]">Listos para tu pedido</h2>
                  </div>
                  <Link href="/buscar?estado=abierto" className="shrink-0 text-sm font-semibold text-brand-dark hover:underline sm:text-[15px]">Ver todos →</Link>
                </div>
                <div className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mt-5 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-8 lg:grid-cols-3">
                  {destacados.map(negocio => <TarjetaPedido key={negocio.id} negocio={negocio} />)}
                </div>
              </section>
            )}

            {mosaico.length >= 3 && <Mosaico platos={mosaico} />}

            <section id="negocios" aria-labelledby="negocios-title" className="px-4 pt-12 sm:px-8 sm:pt-16">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="negocios-title" className="font-display text-[26px] font-extrabold tracking-[-0.03em] sm:text-[34px]">{categoriaActiva === 'todos' ? 'Todos los sabores de Ciénaga' : obtenerCategoria(categoriaActiva).label}</h2>
                  <p className="mt-1 text-sm text-cafe-muted">{listaNegocios.length} {listaNegocios.length === 1 ? 'negocio' : 'negocios'}</p>
                </div>
                <FiltroCategorias activa={categoriaActiva} />
              </div>
              {listaNegocios.length === 0 ? <SinResultados categoria={categoriaActiva} /> : resto.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-[18px] lg:grid-cols-4">{resto.map(negocio => <TarjetaFoto key={negocio.id} negocio={negocio} />)}</div>
              ) : (
                <p className="mt-5 rounded-[18px] border border-dashed border-arena px-5 py-6 text-center text-sm text-cafe-muted">Todos los negocios de esta lista están arriba, listos para tu pedido.</p>
              )}
            </section>

            <CtaNegocios fotoUrl={mosaico[mosaico.length - 1]?.url} />
          </>
        )}
      </main>
    </div>
  )
}

function foto(negocio) {
  return negocio?.fotos_comida?.[0]?.url || null
}

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto
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
    const url = foto(negocio)
    if (url && (!datos.foto || (negocio.abierto_ahora && !datos.fotoAbierto))) {
      datos.foto = url
      datos.fotoAbierto = Boolean(negocio.abierto_ahora)
    }
  }
  return resumen
}

// Platos para el mosaico oscuro: un plato por negocio.
// Se prefiere la segunda foto (suele ser otro plato) y se nombra con su primer producto.
function armarMosaico(negocios) {
  return negocios
    .filter(negocio => foto(negocio))
    .slice(0, MAX_MOSAICO)
    .map(negocio => ({
      id: negocio.id,
      url: negocio.fotos_comida[1]?.url || foto(negocio),
      plato: capitalizar(negocio.tags?.[0]?.valor) || negocio.nombre,
      negocio: negocio.nombre,
    }))
}

// La portada usa una foto fija de la página (public/inicio/portada.jpg), no la de un negocio,
// para no darle más visibilidad a uno que a otros.
const FOTO_PORTADA = '/inicio/portada.jpg'

function Portada({ abiertos, sinNegocios }) {
  const etiqueta = sinNegocios ? 'Nuevo en Ciénaga, Magdalena' : abiertos > 0 ? `${abiertos} ${abiertos === 1 ? 'negocio abierto' : 'negocios abiertos'} ahora en Ciénaga` : 'Ciénaga, Magdalena'
  return (
    <section className="relative h-[430px] overflow-hidden bg-cafe sm:h-[560px] lg:h-[640px]">
      <img src={FOTO_PORTADA} alt="" className="absolute inset-0 h-full w-full object-cover lg:left-auto lg:right-0 lg:w-[62%]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,21,18,0.55)_0%,rgba(28,21,18,0.1)_30%,rgba(28,21,18,0.88)_80%)] lg:bg-[linear-gradient(90deg,#1C1512_38%,rgba(28,21,18,0.85)_52%,rgba(28,21,18,0)_78%)]" />

      <div className="relative sm:pt-2"><SiteHeader sobreFoto /></div>

      <div className="absolute inset-x-0 bottom-[54px] mx-auto max-w-6xl px-4 sm:bottom-auto sm:top-[120px] sm:px-8 lg:top-[150px]">
        <p className="inline-flex h-8 items-center gap-2 rounded-full bg-white/12 px-3.5 text-[13px] font-medium text-[#FFD9B8] backdrop-blur-sm sm:text-sm">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${abiertos > 0 ? 'bg-[#4ADE80]' : 'bg-fuego'}`} />{etiqueta}
        </p>
        <h1 className="mt-3 max-w-[560px] font-display text-[46px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:mt-5 sm:text-[64px] lg:text-[76px]">¿Qué se te antoja <span className="text-fuego-claro">hoy?</span></h1>
        <p className="mt-4 hidden max-w-[460px] text-lg leading-relaxed text-[#E9DCCF] sm:block lg:text-[19px]">Fritos, mariscos, asados y jugos de tu barrio. Mira las fotos y pídelo directo por WhatsApp.</p>
        <div className="mt-7 hidden max-w-[540px] sm:block"><Buscador hero /></div>
      </div>
    </section>
  )
}

function Categorias({ activa, resumen }) {
  return (
    <>
      <div className="relative -mt-[30px] px-4 sm:hidden"><Buscador hero /></div>
      <section aria-labelledby="categorias-title" className="pt-6 sm:px-8 sm:pt-11">
        <h2 id="categorias-title" className="hidden font-display text-[30px] font-extrabold tracking-[-0.03em] sm:block">Antójate de…</h2>
        <nav aria-label="Categorías" className="no-scrollbar flex gap-3.5 overflow-x-auto px-4 sm:mt-5 sm:justify-between sm:gap-3 sm:overflow-visible sm:px-0">
          {CATEGORIAS_FILTRO.map(categoria => {
            const { foto: url, total } = resumen[categoria.valor]
            const seleccionada = activa === categoria.valor
            return (
              <Link key={categoria.valor} href={seleccionada ? '/#negocios' : `/?categoria=${categoria.valor}#negocios`} aria-current={seleccionada ? 'page' : undefined} className="group flex shrink-0 flex-col items-center gap-2 text-[13px] font-semibold sm:text-[15px]">
                <span className={`flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-full border-[3px] transition group-hover:-translate-y-0.5 sm:h-32 sm:w-32 sm:border-4 ${seleccionada ? 'border-fuego' : 'border-white shadow-[0_6px_18px_rgba(28,21,18,0.12)]'} ${url ? 'bg-arena' : categoria.tono}`}>
                  {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <Icon name={categoria.icono} size={30} strokeWidth={1.6} />}
                </span>
                <span>{categoria.corto}</span>
                <span className="sr-only">{total} {total === 1 ? 'lugar' : 'lugares'}</span>
              </Link>
            )
          })}
        </nav>
      </section>
    </>
  )
}

function Calificacion({ negocio, oscuro = false }) {
  const valor = Number(negocio.calificacion_promedio)
  if (!(valor > 0)) return null
  return <span className={`flex h-7 items-center rounded-full px-2.5 text-xs font-bold sm:h-[30px] sm:px-3 sm:text-[13px] ${oscuro ? 'bg-cafe/75 text-white' : 'bg-white text-cafe'}`}>★ {valor.toFixed(1)}</span>
}

function EstadoChip({ negocio }) {
  const abierto = negocio.abierto_ahora
  return (
    <span className={`flex h-7 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-bold sm:h-[30px] sm:px-3 sm:text-[13px] ${abierto ? 'text-ok' : 'text-cafe-muted'}`}>
      <span aria-hidden="true" className={`h-[7px] w-[7px] rounded-full ${abierto ? 'bg-ok-dot' : 'bg-cafe-muted/50'}`} />
      {abierto ? 'Abierto' : negocio.estado?.texto || 'Cerrado'}
    </span>
  )
}

function TarjetaPedido({ negocio }) {
  const entrega = resumenEntrega(negocio.pedidos)
  const tags = (negocio.tags || []).slice(0, 3).map(tag => tag.valor).join(', ')
  return (
    <Link href={`/negocio/${negocio.id}`} className="group block w-[290px] shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(28,21,18,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(28,21,18,0.14)] sm:w-auto sm:rounded-[28px]">
      <span className="relative block h-[200px] overflow-hidden sm:h-[260px]">
        <img src={foto(negocio)} alt={`Comida de ${negocio.nombre}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 sm:left-3.5 sm:top-3.5"><EstadoChip negocio={negocio} /></span>
        <span className="absolute right-3 top-3 sm:right-3.5 sm:top-3.5"><Calificacion negocio={negocio} oscuro /></span>
      </span>
      <span className="block px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-[18px]">
        <span className="block truncate font-display text-[19px] font-extrabold tracking-[-0.02em] sm:text-[22px]">{negocio.nombre}</span>
        {tags && <span className="mt-1 block truncate text-sm text-cafe-muted sm:text-[15px]">{capitalizar(tags)}</span>}
        <span className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
          <span className="min-w-0 truncate text-[13px] sm:text-sm">
            {entrega ? <><b className="font-semibold">{entrega.principal}</b>{entrega.detalle && <span className="text-cafe-muted"> · {entrega.detalle}</span>}</> : <span className="text-cafe-muted">{negocio.estado?.texto || 'Pide por WhatsApp'}</span>}
          </span>
          <span className="flex h-10 shrink-0 items-center rounded-full bg-fuego px-4 text-sm font-bold text-white transition group-hover:bg-brand">Pedir</span>
        </span>
      </span>
    </Link>
  )
}

function Mosaico({ platos }) {
  const [principal, ...otros] = platos
  return (
    <section aria-labelledby="mosaico-title" className="mt-12 bg-cafe text-white sm:mt-16">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-14">
        <p className="text-[13px] font-semibold text-[#FF9A70] sm:text-sm">Lo que más se pide en Ciénaga</p>
        <h2 id="mosaico-title" className="mt-1 font-display text-[27px] font-extrabold tracking-[-0.03em] sm:mt-1.5 sm:text-[40px]">Platos que dan antojo</h2>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-[1.3fr_1fr_1fr] lg:grid-rows-[230px_230px]">
          <TilePlato plato={principal} className="col-span-2 h-[200px] sm:h-[280px] lg:col-span-1 lg:row-span-2 lg:h-auto" grande />
          {otros.map((plato, indice) => <TilePlato key={plato.id} plato={plato} className={`h-[150px] sm:h-[200px] lg:h-auto ${indice >= 2 ? 'hidden lg:block' : ''}`} />)}
        </div>
      </div>
    </section>
  )
}

function TilePlato({ plato, className, grande = false }) {
  return (
    <Link href={`/negocio/${plato.id}`} className={`group relative block overflow-hidden rounded-[20px] sm:rounded-3xl ${className}`}>
      <img src={plato.url} alt={`${plato.plato} de ${plato.negocio}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.75),rgba(0,0,0,0)_58%)]" />
      <span className={`absolute ${grande ? 'bottom-4 left-4 right-4 sm:bottom-[22px] sm:left-6 sm:right-6' : 'bottom-2.5 left-3 right-3 sm:bottom-4 sm:left-[18px] sm:right-[18px]'}`}>
        <span className={`block truncate font-display font-extrabold ${grande ? 'text-[22px] sm:text-[30px]' : 'text-lg sm:text-[22px]'}`}>{plato.plato}</span>
        <span className={`block truncate text-[#E9DCCF] ${grande ? 'mt-1 text-sm sm:text-[15px]' : 'hidden text-[13px] sm:block'}`}>{plato.negocio}</span>
      </span>
    </Link>
  )
}

function TarjetaFoto({ negocio }) {
  const url = foto(negocio)
  const categoria = obtenerCategoria(negocio.categoria)
  const entrega = resumenEntrega(negocio.pedidos)
  const calificacion = Number(negocio.calificacion_promedio)
  return (
    <Link href={`/negocio/${negocio.id}`} className="group block min-w-0">
      <span className="relative block h-[150px] overflow-hidden rounded-[20px] sm:h-[200px] sm:rounded-[22px]">
        {url
          ? <img src={url} alt={`Comida de ${negocio.nombre}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          : <span aria-hidden="true" className={`flex h-full w-full items-center justify-center ${categoria.tono}`}><Icon name={categoria.icono} size={48} strokeWidth={1.4} /></span>}
        <span className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5"><EstadoChip negocio={negocio} /></span>
      </span>
      <span className="mt-2 block truncate text-[15px] font-bold sm:mt-2.5 sm:text-[17px]">{negocio.nombre}</span>
      <span className="block truncate text-[13px] text-cafe-muted sm:text-sm">
        {calificacion > 0 && `★ ${calificacion.toFixed(1)} · `}{entrega ? entrega.principal : categoria.label}
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
        return <Link key={opcion.valor} href={opcion.valor === 'todos' ? '/#negocios' : `/?categoria=${opcion.valor}#negocios`} aria-current={seleccionada ? 'page' : undefined} className={`flex h-10 shrink-0 items-center rounded-full px-4 text-sm transition ${seleccionada ? 'bg-cafe font-semibold text-white' : 'bg-white text-cafe hover:bg-arena'}`}>{opcion.corto}</Link>
      })}
    </div>
  )
}

function SinResultados({ categoria }) {
  const etiqueta = obtenerCategoria(categoria).label.toLowerCase()
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-arena bg-white px-6 py-12 text-center">
      <p className="font-display text-xl font-extrabold">Aún no hay negocios de {etiqueta}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-cafe-muted">Prueba con otra categoría o publica el tuyo y sé el primero.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/#negocios" className="btn-secondary rounded-full">Ver todo</Link>
        <Link href="/registro" className="btn-primary rounded-full bg-fuego">Registrar mi negocio</Link>
      </div>
    </div>
  )
}

function EstadoVacio() {
  return (
    <section aria-labelledby="vacio-title" className="mt-12 rounded-[32px] bg-cafe px-6 py-9 text-white sm:px-10 sm:py-12">
      <p className="text-sm font-semibold text-[#FF9A70]">Los primeros negocios están por llegar</p>
      <h2 id="vacio-title" className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px]">Publica tu negocio en tres pasos</h2>
      <ol className="mt-7 grid gap-4 md:grid-cols-3">
        {[
          ['Crea tu cuenta', 'Con tu correo y tu WhatsApp. Toma un minuto.'],
          ['Sube tus mejores fotos', 'Que tu comida dé antojo desde la primera mirada.'],
          ['Recibe pedidos', 'Los clientes te escriben directo por WhatsApp.'],
        ].map(([titulo, texto], indice) => (
          <li key={titulo} className="rounded-[22px] bg-white/8 p-5">
            <span className="font-display text-lg font-extrabold text-fuego-claro">0{indice + 1}</span>
            <p className="mt-2 text-lg font-semibold">{titulo}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/65">{texto}</p>
          </li>
        ))}
      </ol>
      <Link href="/registro" className="mt-7 inline-flex h-[52px] items-center rounded-full bg-fuego px-7 text-base font-bold text-white transition hover:bg-brand">Publicar mi negocio gratis</Link>
    </section>
  )
}

function CtaNegocios({ fotoUrl }) {
  return (
    <section className="mx-4 mt-14 flex overflow-hidden rounded-[28px] bg-fuego sm:mx-8 sm:mt-16 sm:min-h-[280px] sm:rounded-[32px]">
      <div className="flex-1 px-6 py-8 text-white sm:px-12 sm:py-11">
        <p className="text-sm font-semibold text-[#FFE1D5] sm:text-[15px]">¿Vendes comida en Ciénaga?</p>
        <h2 className="mt-2 font-display text-[30px] font-extrabold leading-none tracking-[-0.03em] sm:text-[42px]">Que tu comida también dé antojo aquí.</h2>
        <p className="mt-3.5 max-w-[420px] text-base text-[#FFE1D5] sm:text-[17px]">Sube tus mejores fotos, tu horario y tu WhatsApp. Es gratis.</p>
        <Link href="/registro" className="mt-6 inline-flex h-[52px] items-center rounded-full bg-cafe px-7 text-base font-bold text-white transition hover:bg-black">Publicar mi negocio</Link>
      </div>
      {fotoUrl && <img src={fotoUrl} alt="" className="hidden w-[42%] object-cover md:block" />}
    </section>
  )
}
