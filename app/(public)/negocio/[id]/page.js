import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import { Estado } from '@/components/ui/NegocioCard'
import GaleriaFotos from '@/components/ui/GaleriaFotos'
import { obtenerCategoria } from '@/lib/categorias'
import { estadoNegocio, semana, tieneHorario } from '@/lib/horario'
import { etiquetaPago, resumenEntrega, textoCostoDomicilio, tienePedidos } from '@/lib/pedidos'
import PedirWhatsApp from '@/components/ui/PedirWhatsApp'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: negocio } = await supabase.from('negocios').select('nombre, categoria, direccion, tags(valor)').eq('id', id).single()
  if (!negocio) return { title: 'Negocio no encontrado' }
  const tags = negocio.tags?.map(tag => tag.valor).join(', ') || 'comida local'
  const categoria = obtenerCategoria(negocio.categoria).label
  return { title: `${negocio.nombre} — ComidasCiénaga`, description: `${negocio.nombre} en Ciénaga, Magdalena. Vende: ${tags}.`, keywords: `${negocio.nombre}, ${tags}, comida Ciénaga, ${categoria} Ciénaga`, openGraph: { title: negocio.nombre, description: `Encuentra ${negocio.nombre} en Ciénaga — ${tags}`, type: 'website', locale: 'es_CO' } }
}

export default async function PerfilNegocio({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: negocio } = await supabase.from('negocios').select('*, fotos_comida(url), tags(valor), cartas(url, tipo)').eq('id', id).single()
  if (!negocio) return notFound()
  const { data: sesion } = await supabase.auth.getClaims()
  const esDueno = Boolean(sesion?.claims?.sub) && sesion.claims.sub === negocio.usuario_id

  const fotos = negocio.fotos_comida || []
  const cartas = negocio.cartas || []
  const tags = negocio.tags || []
  const categoria = obtenerCategoria(negocio.categoria)
  const whatsapp = negocio.whatsapp?.replace(/\D/g, '')
  const pedidos = tienePedidos(negocio.pedidos) ? negocio.pedidos : null
  const entrega = resumenEntrega(pedidos)
  const mapaUrl = negocio.direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${negocio.direccion}, Ciénaga, Magdalena`)}` : null
  const calificacion = Number(negocio.calificacion_promedio)
  const perfilVacio = !fotos.length && !tags.length && !cartas.length
  const estado = estadoNegocio(negocio)
  const conHorario = tieneHorario(negocio.horarios)

  return (
    <>
      <div className="hidden sm:block"><SiteHeader /></div>
      {esDueno && (
        <div className="bg-ink text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
            <p className="flex items-center gap-2 text-sm"><Icon name="eye" size={16} className="shrink-0 text-peach" /><span>Así ven los clientes <span className="hidden sm:inline">tu negocio</span></span></p>
            <Link href="/dashboard" className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-sm font-semibold transition hover:bg-white/25"><Icon name="arrowLeft" size={15} /> Volver a mi panel</Link>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl pb-44 sm:px-8 sm:pb-16 lg:pb-16">
        <section aria-label="Fotos" className="relative sm:pt-6">
          <BackButton className="absolute left-4 top-4 z-10 sm:hidden" />
          <Galeria fotos={fotos} nombre={negocio.nombre} categoria={categoria} />
        </section>

        <div className="mt-6 grid gap-10 px-4 sm:px-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex h-7 items-center rounded-full px-3 text-xs font-semibold ${categoria.tono}`}>{categoria.label}</span>
              <span className="flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-3"><Estado abierto={estado.abierto} pequeno />{estado.texto && <span className="text-xs text-ink-subtle">· {estado.texto}</span>}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-[40px] sm:leading-[1.05]">{negocio.nombre}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-subtle"><Icon name="pin" size={16} /> Ciénaga, Magdalena</p>
              </div>
              {calificacion > 0
                ? <div className="rounded-xl bg-mango-soft px-3 py-2 text-right"><span className="text-sm font-bold text-mango">★ {calificacion.toFixed(1)}</span>{Number(negocio.total_calificaciones) > 0 && <span className="mt-0.5 block text-[11px] text-mango">{negocio.total_calificaciones} reseñas</span>}</div>
                : <span className="rounded-xl bg-chip px-3 py-2 text-xs font-medium text-ink-subtle">Sin calificaciones aún</span>}
            </div>

            {(conHorario || negocio.horario || negocio.direccion) && (
              <section aria-label="Información del negocio" className="mt-7 grid gap-3 sm:grid-cols-2">
                {conHorario
                  ? <InfoCard icon="clock" label={estado.abierto ? 'Abierto ahora' : 'Cerrado ahora'} value={estado.texto} />
                  : negocio.horario && <InfoCard icon="clock" label="Horario" value={negocio.horario} />}
                {negocio.direccion && <InfoCard icon="pin" label="Ubicación" value={negocio.direccion} href={mapaUrl} />}
              </section>
            )}

            {conHorario && (
              <section aria-labelledby="horario-title" className="mt-10">
                <h2 id="horario-title" className="text-xl font-bold tracking-[-0.02em]">Horario</h2>
                <dl className="card mt-4 divide-y divide-line">
                  {semana(negocio.horarios).map(dia => (
                    <div key={dia.clave} className={`flex items-center justify-between gap-4 px-4 py-3 text-[15px] ${dia.esHoy ? 'font-semibold' : ''}`}>
                      <dt className="flex items-center gap-2">{dia.label}{dia.esHoy && <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-ink-muted">Hoy</span>}</dt>
                      <dd className={dia.abierto ? '' : 'text-ink-subtle'}>{dia.texto}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {pedidos && (
              <section aria-labelledby="pedir-title" className="mt-10">
                <h2 id="pedir-title" className="text-xl font-bold tracking-[-0.02em]">Cómo pedir</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {pedidos.domicilio && (
                    <div className="card p-4">
                      <p className="flex items-center gap-2.5 text-base font-semibold"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-dark"><Icon name="delivery" /></span>Domicilio</p>
                      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                        <dt className="text-ink-subtle">Costo</dt><dd className="font-semibold">{textoCostoDomicilio(pedidos).replace('Domicilio ', '').replace(/^./, letra => letra.toUpperCase())}</dd>
                        <dt className="text-ink-subtle">Tiempo</dt><dd>{pedidos.tiempo}</dd>
                        <dt className="text-ink-subtle">Llega a</dt><dd>{pedidos.barrios?.length ? pedidos.barrios.join(', ') : 'Pregunta si llega a tu barrio'}</dd>
                      </dl>
                    </div>
                  )}
                  {pedidos.recoger && (
                    <div className="card p-4">
                      <p className="flex items-center gap-2.5 text-base font-semibold"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-chip text-ink"><Icon name="store" /></span>Recoger en el local</p>
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{negocio.direccion ? `Pide por WhatsApp y recógelo listo en ${negocio.direccion}.` : 'Pide por WhatsApp y pregunta dónde recogerlo.'}</p>
                    </div>
                  )}
                </div>
                {pedidos.pagos?.length > 0 && (
                  <div className="card mt-3 p-4">
                    <p className="flex items-center gap-2.5 text-base font-semibold"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ok-soft text-ok"><Icon name="wallet" /></span>Formas de pago</p>
                    <div className="mt-3 flex flex-wrap gap-2">{pedidos.pagos.map(pago => <span key={pago} className="flex h-9 items-center gap-1.5 rounded-full bg-chip px-3 text-sm"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-ok-dot" />{etiquetaPago(pago)}</span>)}</div>
                  </div>
                )}
              </section>
            )}

            {tags.length > 0 && (
              <section aria-labelledby="venden-title" className="mt-10">
                <h2 id="venden-title" className="text-xl font-bold tracking-[-0.02em]">Lo que venden</h2>
                <p className="mt-1 text-sm text-ink-subtle">Toca un producto para ver quién más lo vende.</p>
                <div className="mt-4 flex flex-wrap gap-2">{tags.map(tag => <Link key={tag.valor} href={`/buscar?q=${encodeURIComponent(tag.valor)}`} className="flex h-10 items-center rounded-full bg-chip px-4 text-sm font-medium text-ink transition hover:bg-line">{tag.valor}</Link>)}</div>
              </section>
            )}

            {cartas.length > 0 && (
              <section aria-labelledby="carta-title" className="mt-10">
                <h2 id="carta-title" className="text-xl font-bold tracking-[-0.02em]">Carta del menú</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {cartas.map((carta, indice) => (
                    <a key={carta.url} href={carta.url} target="_blank" rel="noopener noreferrer" className="card flex items-center justify-between gap-3 p-4 transition hover:border-line-strong">
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-dark"><Icon name="menu" /></span>
                        <span><span className="block text-sm font-semibold">{carta.tipo === 'pdf' ? 'Ver menú en PDF' : 'Ver carta en foto'}</span><span className="mt-0.5 block text-xs text-ink-subtle">Carta {cartas.length > 1 ? indice + 1 : 'disponible'}</span></span>
                      </span>
                      <Icon name="chevronRight" size={18} className="text-ink-subtle" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {perfilVacio && (
              <section className="mt-10 rounded-[20px] border border-dashed border-line-strong bg-white px-5 py-8 text-center">
                <p className="text-sm font-semibold">Este negocio aún está completando su perfil.</p>
                <p className="mt-1 text-sm text-ink-subtle">Puedes escribirle para conocer sus productos y horarios.</p>
              </section>
            )}
          </div>

          {(whatsapp || mapaUrl) && (
            <aside aria-label="Contacto" className="hidden lg:block">
              <div className="card sticky top-24 p-5">
                <p className="text-sm font-semibold">¿Se te antojó?</p>
                <p className="mt-1 text-sm text-ink-subtle">{estado.abierto || !estado.texto ? 'Escríbele directo y haz tu pedido.' : `Ahora está cerrado · ${estado.texto}`}</p>
                {entrega && <p className="mt-2 text-sm">{entrega.principal}{pedidos.pagos?.length > 0 && <span className="text-ink-subtle"> · {pedidos.pagos.map(etiquetaPago).join(', ')}</span>}</p>}
                {whatsapp && <div className="mt-4"><PedirWhatsApp nombre={negocio.nombre} whatsapp={negocio.whatsapp} pedidos={pedidos} direccion={negocio.direccion} variante="tarjeta" /></div>}
                {mapaUrl && <a href={mapaUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-2 w-full"><Icon name="pin" size={18} /> Cómo llegar</a>}
              </div>
            </aside>
          )}
        </div>
      </main>

      {(whatsapp || mapaUrl) && (
        <div className="fixed inset-x-0 bottom-[4.6rem] z-40 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl gap-2">
            {mapaUrl && <a href={mapaUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir ubicación en Google Maps" className="btn-secondary w-12 shrink-0 px-0"><Icon name="pin" /></a>}
            {whatsapp && <PedirWhatsApp nombre={negocio.nombre} whatsapp={negocio.whatsapp} pedidos={pedidos} direccion={negocio.direccion} variante="barra" />}
          </div>
        </div>
      )}
    </>
  )
}

function Galeria({ fotos, nombre, categoria }) {
  if (!fotos.length) {
    return (
      <div aria-hidden="true" className={`flex h-64 items-center justify-center sm:h-80 sm:rounded-3xl ${categoria.tono}`}>
        <Icon name={categoria.icono} size={88} strokeWidth={1.2} />
      </div>
    )
  }
  return <GaleriaFotos fotos={fotos} nombre={nombre} />
}

function InfoCard({ icon, label, value, href }) {
  const contenido = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chip text-ink"><Icon name={icon} /></span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink-subtle">{label}</span>
        <span className="mt-0.5 block text-[15px] leading-snug">{value}</span>
        {href && <span className="mt-1 block text-xs font-semibold text-brand-dark">Abrir en Maps</span>}
      </span>
    </>
  )
  const clases = 'card flex items-center gap-3 p-4'
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={`${clases} transition hover:border-line-strong`}>{contenido}</a>
    : <div className={clases}>{contenido}</div>
}
