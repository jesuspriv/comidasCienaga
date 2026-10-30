import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import GaleriaFotos from '@/components/ui/GaleriaFotos'
import { obtenerCategoria } from '@/lib/categorias'
import { estadoNegocio, semana, tieneHorario } from '@/lib/horario'
import { etiquetaPago, textoCostoDomicilio, tienePedidos } from '@/lib/pedidos'
import PedirWhatsApp from '@/components/ui/PedirWhatsApp'
import { enlacesRedes } from '@/lib/redes'
import { MOSTRAR_PRUEBA, sinPrueba } from '@/lib/negocios'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: negocio } = await sinPrueba(supabase.from('negocios').select('nombre, categoria, direccion, tags(valor)').eq('id', id)).maybeSingle()
  if (!negocio) return { title: 'Negocio no encontrado' }
  const tags = negocio.tags?.map(tag => tag.valor).join(', ') || 'comida local'
  const categoria = obtenerCategoria(negocio.categoria).label
  return { title: `${negocio.nombre} — ComidasCiénaga`, description: `${negocio.nombre} en Ciénaga, Magdalena. Vende: ${tags}.`, keywords: `${negocio.nombre}, ${tags}, comida Ciénaga, ${categoria} Ciénaga`, openGraph: { title: negocio.nombre, description: `Encuentra ${negocio.nombre} en Ciénaga — ${tags}`, type: 'website', locale: 'es_CO' } }
}

// Colores de las etiquetas de "Lo que venden": se van turnando para que no se vea todo igual.
const TONOS_TAG = ['bg-fuego/15 text-fuego-claro hover:bg-fuego/25', 'bg-mostaza/15 text-mostaza hover:bg-mostaza/25', 'bg-ok-dot/15 text-[#6ee7a0] hover:bg-ok-dot/25']

const minuscula = texto => texto.replace(/^./, letra => letra.toLowerCase())

export default async function PerfilNegocio({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: negocio } = await supabase.from('negocios').select('*, fotos_comida(url), tags(valor), cartas(url, tipo)').eq('id', id).maybeSingle()
  if (!negocio) return notFound()
  const { data: sesion } = await supabase.auth.getClaims()
  const esDueno = Boolean(sesion?.claims?.sub) && sesion.claims.sub === negocio.usuario_id
  // Un negocio de prueba no se publica, salvo en local con MOSTRAR_NEGOCIOS_PRUEBA o para su propio dueño.
  if (negocio.es_prueba && !MOSTRAR_PRUEBA && !esDueno) return notFound()

  const fotos = negocio.fotos_comida || []
  const cartas = negocio.cartas || []
  const tags = negocio.tags || []
  const categoria = obtenerCategoria(negocio.categoria)
  const whatsapp = negocio.whatsapp?.replace(/\D/g, '')
  const pedidos = tienePedidos(negocio.pedidos) ? negocio.pedidos : null
  const redes = enlacesRedes(negocio.redes)
  const mapaUrl = negocio.direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${negocio.direccion}, Ciénaga, Magdalena`)}` : null
  const calificacion = Number(negocio.calificacion_promedio)
  const perfilVacio = !fotos.length && !tags.length && !cartas.length
  const estado = estadoNegocio(negocio)
  const conHorario = tieneHorario(negocio.horarios)
  const dias = conHorario ? semana(negocio.horarios) : []
  const hoy = dias.find(dia => dia.esHoy)
  const bloques = bloquesParaPedir({ negocio, pedidos, hoy, mapaUrl })

  return (
    <div className="bg-noche bg-[radial-gradient(900px_600px_at_85%_0%,rgba(255,90,54,0.16),transparent_70%)] text-[#f6ede4]">
      <div className="hidden sm:block"><SiteHeader sobreFoto /></div>
      {esDueno && (
        <div className="border-y border-noche-borde bg-noche-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
            <p className="flex items-center gap-2 text-sm"><Icon name="eye" size={16} className="shrink-0 text-peach" /><span>Así ven los clientes <span className="hidden sm:inline">tu negocio</span></span></p>
            <Link href="/dashboard" className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-sm font-semibold transition hover:bg-white/25"><Icon name="arrowLeft" size={15} /> Volver a mi panel</Link>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl pb-44 sm:px-8 sm:pb-16 lg:pt-2">
        <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div aria-label="Fotos" className="relative sm:pt-4 lg:order-2 lg:pt-0">
            <BackButton className="absolute left-4 top-4 z-10 sm:hidden" />
            {fotos.length
              ? <GaleriaFotos fotos={fotos} nombre={negocio.nombre} collage />
              : <div aria-hidden="true" className={`flex h-64 items-center justify-center sm:h-80 sm:rounded-[32px] lg:h-[26rem] lg:-rotate-2 ${categoria.tono}`}><Icon name={categoria.icono} size={96} strokeWidth={1.2} /></div>}
          </div>

          <div className="min-w-0 px-4 sm:px-0 lg:order-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-8 items-center rounded-full bg-fuego px-3.5 text-[13px] font-bold text-white">{categoria.label}</span>
              <span className={`flex h-8 items-center gap-2 rounded-full px-3.5 text-[13px] font-bold ${estado.abierto ? 'bg-ok-dot/15 text-[#6ee7a0]' : 'bg-white/10 text-noche-texto'}`}>
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${estado.abierto ? 'bg-[#4ade80]' : 'bg-noche-texto/60'}`} />
                {estado.abierto ? 'Abierto' : 'Cerrado'}{estado.texto && ` · ${minuscula(estado.texto)}`}
              </span>
            </div>
            <h1 className="mt-4 font-display text-[44px] font-extrabold leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-[76px]">{negocio.nombre}</h1>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-base text-noche-texto">
              {calificacion > 0
                ? <span><b className="text-mostaza">★ {calificacion.toFixed(1)}</b>{Number(negocio.total_calificaciones) > 0 && ` · ${negocio.total_calificaciones} reseñas`}</span>
                : <span>Sin calificaciones aún</span>}
              <span className="flex items-center gap-1.5"><Icon name="pin" size={16} />{negocio.direccion || 'Ciénaga, Magdalena'}</span>
            </p>
            {(whatsapp || redes.length > 0) && (
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {whatsapp && <div className="hidden lg:block"><PedirWhatsApp nombre={negocio.nombre} whatsapp={negocio.whatsapp} pedidos={pedidos} direccion={negocio.direccion} variante="hero" /></div>}
                {redes.length > 0 && (
                  <ul aria-label="Redes sociales" className="flex gap-2.5">
                    {redes.map(red => (
                      <li key={red.clave}>
                        <a href={red.url} target="_blank" rel="noopener noreferrer" aria-label={`${red.label} de ${negocio.nombre} (@${red.usuario})`} className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-white/25 transition hover:-translate-y-px hover:opacity-90 lg:h-14 lg:w-14 ${red.estilo}`}>
                          <Icon name={red.clave} size={21} strokeWidth={2.2} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="px-4 sm:px-0">
          {bloques.length > 0 && (
            <section aria-labelledby="pedir-title" className="mt-9 sm:mt-12 lg:mt-14">
              <h2 id="pedir-title" className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-white sm:text-[34px]">{pedidos ? 'Cómo pedir' : 'Datos del negocio'}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
                {bloques.map(bloque => (
                  <div key={bloque.clave} className={`rounded-3xl p-4 sm:rounded-[28px] sm:p-[22px] ${bloque.tono}`}>
                    <Icon name={bloque.icono} size={26} strokeWidth={2} className={bloque.tonoIcono} />
                    <p className="mt-3 font-display text-lg font-extrabold leading-tight sm:mt-4 sm:text-[26px]">{bloque.titulo}</p>
                    <p className={`mt-1 text-[13px] leading-snug sm:text-sm ${bloque.tonoDetalle}`}>
                      {bloque.detalle}
                      {bloque.enlace && <> · <a href={bloque.enlace.href} {...(bloque.enlace.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`font-bold underline-offset-2 hover:underline ${bloque.tonoEnlace}`}>{bloque.enlace.texto}</a></>}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className={`mt-10 grid gap-5 lg:mt-11 ${conHorario ? 'lg:grid-cols-[minmax(0,1fr)_380px]' : ''}`}>
            <div className="min-w-0 space-y-5">
              {tags.length > 0 && (
                <section aria-labelledby="venden-title" className="rounded-[32px] border border-noche-borde bg-noche-card p-6 sm:p-7">
                  <h2 id="venden-title" className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-white sm:text-3xl">Lo que venden</h2>
                  <p className="mt-1 text-sm text-noche-texto">Toca un producto para ver quién más lo vende.</p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {tags.map((tag, indice) => <Link key={tag.valor} href={`/buscar?q=${encodeURIComponent(tag.valor)}`} className={`flex h-11 items-center rounded-full px-5 text-[15px] font-bold transition ${TONOS_TAG[indice % TONOS_TAG.length]}`}>{tag.valor}</Link>)}
                  </div>
                </section>
              )}

              {cartas.length > 0 && (
                <section aria-labelledby="carta-title" className="rounded-[32px] border border-noche-borde bg-noche-card p-6 sm:p-7">
                  <h2 id="carta-title" className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-white sm:text-3xl">Carta del menú</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {cartas.map((carta, indice) => (
                      <a key={carta.url} href={carta.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-[20px] bg-white/5 p-4 transition hover:bg-white/10">
                        <span className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuego/15 text-fuego-claro"><Icon name="menu" /></span>
                          <span><span className="block text-sm font-semibold text-white">{carta.tipo === 'pdf' ? 'Ver menú en PDF' : 'Ver carta en foto'}</span><span className="mt-0.5 block text-xs text-noche-texto">Carta {cartas.length > 1 ? indice + 1 : 'disponible'}</span></span>
                        </span>
                        <Icon name="chevronRight" size={18} className="text-noche-texto" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {perfilVacio && (
                <section className="rounded-[32px] border border-dashed border-noche-borde px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-white">Este negocio aún está completando su perfil.</p>
                  <p className="mt-1 text-sm text-noche-texto">Puedes escribirle para conocer sus productos y horarios.</p>
                </section>
              )}
            </div>

            {conHorario && (
              <section id="horario" aria-labelledby="horario-title" className="h-fit scroll-mt-24 rounded-[32px] border border-noche-borde bg-noche-card p-6 sm:p-7">
                <h2 id="horario-title" className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-white sm:text-3xl">Horario</h2>
                <dl className="mt-4 text-[15px]">
                  {dias.map(dia => (
                    <div key={dia.clave} className={`flex items-center justify-between gap-4 ${dia.esHoy ? '-mx-3 rounded-xl bg-fuego px-3 py-2.5 font-bold text-white' : 'border-b border-noche-borde py-2.5 last:border-0'}`}>
                      <dt className={!dia.esHoy && !dia.abierto ? 'text-[#8c7e72]' : ''}>{dia.label}{dia.esHoy && ' · hoy'}</dt>
                      <dd className={!dia.esHoy && !dia.abierto ? 'text-[#8c7e72]' : ''}>{dia.texto}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>
      </main>

      {(whatsapp || mapaUrl) && (
        <div className="fixed inset-x-0 bottom-[4.6rem] z-40 border-t border-noche-borde bg-noche/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl gap-2">
            {mapaUrl && <a href={mapaUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir ubicación en Google Maps" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"><Icon name="pin" /></a>}
            {whatsapp && <PedirWhatsApp nombre={negocio.nombre} whatsapp={negocio.whatsapp} pedidos={pedidos} direccion={negocio.direccion} variante="barra" />}
          </div>
        </div>
      )}
    </div>
  )
}

// Los bloques de colores de "Cómo pedir": domicilio, horario de hoy, pagos y dónde recoger.
// Solo salen los que el negocio tiene configurados.
function bloquesParaPedir({ negocio, pedidos, hoy, mapaUrl }) {
  const bloques = []
  if (pedidos?.domicilio) {
    bloques.push({ clave: 'domicilio', icono: 'delivery', titulo: textoCostoDomicilio(pedidos), detalle: `Llega en ${pedidos.tiempo}`, tono: 'bg-fuego text-white', tonoDetalle: 'text-[#ffe1d5]' })
  }
  if (hoy) {
    bloques.push({ clave: 'horario', icono: 'clock', titulo: `Hoy ${minuscula(hoy.label)}`, detalle: hoy.texto, enlace: { href: '#horario', texto: 'Ver semana' }, tono: 'bg-mostaza text-[#3d2a00]', tonoDetalle: 'text-[#6b4e00]', tonoEnlace: 'text-[#3d2a00]' })
  } else if (negocio.horario) {
    bloques.push({ clave: 'horario', icono: 'clock', titulo: 'Horario', detalle: negocio.horario, tono: 'bg-mostaza text-[#3d2a00]', tonoDetalle: 'text-[#6b4e00]' })
  }
  if (pedidos?.pagos?.length) {
    const [primero, ...resto] = pedidos.pagos.map(etiquetaPago)
    bloques.push({ clave: 'pagos', icono: 'wallet', titulo: resto.length ? `${primero} y más` : primero, detalle: resto.length ? resto.join(', ') : 'Forma de pago', tono: 'bg-ok-dot text-white', tonoDetalle: 'text-[#d6f5e1]' })
  }
  if (pedidos?.recoger || negocio.direccion) {
    bloques.push({
      clave: 'local', icono: 'pin', titulo: pedidos?.recoger ? 'Recoger' : 'Ubicación',
      detalle: negocio.direccion || 'Pregunta la dirección por WhatsApp',
      enlace: mapaUrl && { href: mapaUrl, texto: 'Cómo llegar', externo: true },
      tono: 'border border-noche-borde bg-[#2a201b] text-white', tonoIcono: 'text-fuego-claro', tonoDetalle: 'text-noche-texto', tonoEnlace: 'text-fuego-claro',
    })
  }
  return bloques
}
