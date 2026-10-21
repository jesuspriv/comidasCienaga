'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Aviso, Cargando, PanelHeader } from '@/components/dashboard/PanelUI'
import Icon from '@/components/ui/Icon'
import { obtenerCategoria } from '@/lib/categorias'
import { estadoNegocio, finDeJornada, horarioInicial, resumenHorario, tieneHorario, validarHorario } from '@/lib/horario'
import EditorHorario from '@/components/forms/EditorHorario'
import EditorPedidos from '@/components/forms/EditorPedidos'
import CompartirNegocio from '@/components/dashboard/CompartirNegocio'
import { REDES, normalizarRedes, redInvalida } from '@/lib/redes'
import { normalizarPedidos, pedidosIniciales, validarPedidos } from '@/lib/pedidos'

export default function DashboardPage() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  // Horario en edición; null mientras un negocio sin horario no decida configurarlo.
  const [horarios, setHorarios] = useState(null)
  const [pedidos, setPedidos] = useState(pedidosIniciales)
  // Usuarios de redes tal como los escribe el dueño; al guardar se limpian.
  const [redes, setRedes] = useState({})
  const [guardandoPedidos, setGuardandoPedidos] = useState(false)
  // Se actualiza cada minuto para que el estado (abierto/cerrado) siga al reloj.
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(new Date()), 60_000)
    return () => window.clearInterval(intervalo)
  }, [])

  useEffect(() => {
    let activo = true
    async function cargarNegocio() {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) return router.replace('/login')
      const { data, error } = await supabase.from('negocios').select('*, tags(valor), fotos_comida(url), cartas(url, tipo)').eq('usuario_id', authData.user.id).single()
      if (!activo) return
      if (error || !data) return router.replace('/registro')
      setNegocio(data)
      setHorarios(tieneHorario(data.horarios) ? data.horarios : null)
      if (data.pedidos) setPedidos({ ...pedidosIniciales(), ...data.pedidos })
      setRedes(data.redes || {})
      setCargando(false)
    }
    cargarNegocio()
    return () => { activo = false }
  }, [router, supabase])

  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto })
    window.setTimeout(() => setMensaje(null), 3500)
  }

  async function toggleAbierto() {
    if (!negocio || cambiandoEstado) return
    const abiertoAnterior = negocio.abierto_ahora
    const nuevoEstado = !abiertoAnterior
    setCambiandoEstado(true)
    setNegocio(actual => ({ ...actual, abierto_ahora: nuevoEstado }))
    const { error } = await supabase.from('negocios').update({ abierto_ahora: nuevoEstado }).eq('id', negocio.id)
    if (error) {
      setNegocio(actual => ({ ...actual, abierto_ahora: abiertoAnterior }))
      mostrarMensaje('error', 'No pudimos actualizar tu disponibilidad. Inténtalo de nuevo.')
    } else {
      mostrarMensaje('success', nuevoEstado ? 'Tu negocio ahora aparece como abierto.' : 'Tu negocio ahora aparece como cerrado.')
    }
    setCambiandoEstado(false)
  }

  // "Cerrar por hoy" pausa el horario hasta mañana a las 5 a. m.; `null` lo reanuda.
  async function pausar(hasta) {
    if (!negocio || cambiandoEstado) return
    setCambiandoEstado(true)
    const pausado_hasta = hasta ? hasta.toISOString() : null
    const { error } = await supabase.from('negocios').update({ pausado_hasta }).eq('id', negocio.id)
    if (error) {
      mostrarMensaje('error', 'No pudimos actualizar tu disponibilidad. Inténtalo de nuevo.')
    } else {
      setNegocio(actual => ({ ...actual, pausado_hasta }))
      mostrarMensaje('success', hasta ? 'Listo, hoy apareces como cerrado. Mañana vuelves a tu horario.' : 'Volviste a tu horario normal.')
    }
    setCambiandoEstado(false)
  }

  async function guardarCambios(event) {
    event.preventDefault()
    if (horarios) {
      const errorHorario = validarHorario(horarios)
      if (errorHorario) return mostrarMensaje('error', errorHorario)
    }
    const redMala = redInvalida(redes)
    if (redMala) return mostrarMensaje('error', `No reconocemos tu usuario de ${redMala.label}. Escribe solo el usuario, por ejemplo @tunegocio, o pega el enlace de tu perfil.`)
    setGuardando(true)
    const cambios = { nombre: negocio.nombre.trim(), direccion: negocio.direccion?.trim() || null, whatsapp: negocio.whatsapp?.trim() || null, redes: normalizarRedes(redes) }
    if (horarios) Object.assign(cambios, { horarios, horario: resumenHorario(horarios) })
    const { error } = await supabase.from('negocios').update(cambios).eq('id', negocio.id)
    setGuardando(false)
    if (!error) {
      setNegocio(actual => ({ ...actual, ...cambios }))
      setRedes(cambios.redes || {})
    }
    mostrarMensaje(error ? 'error' : 'success', error ? 'No pudimos guardar los cambios. Inténtalo de nuevo.' : 'Información guardada correctamente.')
  }

  async function guardarPedidos(event) {
    event.preventDefault()
    const limpio = normalizarPedidos(pedidos)
    const errorPedidos = validarPedidos(limpio)
    if (errorPedidos) return mostrarMensaje('error', errorPedidos)
    setGuardandoPedidos(true)
    const { error } = await supabase.from('negocios').update({ pedidos: limpio }).eq('id', negocio.id)
    setGuardandoPedidos(false)
    if (!error) {
      setNegocio(actual => ({ ...actual, pedidos: limpio }))
      setPedidos(limpio)
    }
    mostrarMensaje(error ? 'error' : 'success', error ? 'No pudimos guardar cómo te piden. Inténtalo de nuevo.' : 'Listo, tu perfil ya muestra cómo pedirte.')
  }

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()
    if (error) return mostrarMensaje('error', 'No pudimos cerrar tu sesión. Inténtalo de nuevo.')
    router.push('/')
  }

  async function eliminarNegocio() {
    if (!negocio) return
    setEliminando(true)
    try {
      const fotos = (negocio.fotos_comida || []).map(foto => foto.url.split('fotos-comida/')[1]).filter(Boolean)
      const cartas = (negocio.cartas || []).map(carta => carta.url.split('cartas-menu/')[1]).filter(Boolean)
      if (fotos.length) { const { error } = await supabase.storage.from('fotos-comida').remove(fotos); if (error) throw error }
      if (cartas.length) { const { error } = await supabase.storage.from('cartas-menu').remove(cartas); if (error) throw error }
      const { error } = await supabase.from('negocios').delete().eq('id', negocio.id)
      if (error) throw error
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      mostrarMensaje('error', 'No pudimos eliminar tu negocio por completo. Inténtalo de nuevo.')
      setEliminando(false)
    }
  }

  if (cargando || !negocio) return <Cargando texto="Cargando tu negocio…" />

  const perfil = calcularPerfil(negocio)
  const categoria = obtenerCategoria(negocio.categoria)
  const acciones = [
    { href: '/dashboard/editar', title: 'Productos y fotos', description: `${negocio.tags?.length || 0} productos · ${negocio.fotos_comida?.length || 0} fotos`, icon: 'camera', tono: 'bg-brand-soft text-brand-dark' },
    { href: '/dashboard/editar', title: 'Carta del menú', description: negocio.cartas?.length ? `${negocio.cartas.length} carta${negocio.cartas.length > 1 ? 's' : ''} publicada${negocio.cartas.length > 1 ? 's' : ''}` : 'Agrega una foto o PDF', icon: 'menu', tono: 'bg-mango-soft text-mango' },
  ]

  return (
    <>
      <PanelHeader onCerrarSesion={cerrarSesion} />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Panel de tu negocio</p>
            <h1 className="mt-1 text-[28px] font-bold tracking-[-0.04em] sm:text-3xl">Hola, {negocio.nombre}</h1>
          </div>
          <Link href={`/negocio/${negocio.id}`} className="btn-secondary h-11"><Icon name="eye" size={18} /> Ver mi perfil público</Link>
        </div>

        {mensaje && <Aviso mensaje={mensaje} />}

        <Disponibilidad negocio={negocio} estado={estadoNegocio(negocio, ahora)} ocupado={cambiandoEstado} onToggleManual={toggleAbierto} onCerrarHoy={() => pausar(finDeJornada())} onReanudar={() => pausar(null)} />

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-ink-subtle">Perfil público</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.02em]">{perfil.porcentaje}% completado</h2>
              </div>
              <span className="text-sm font-medium text-ink-subtle">{perfil.completos}/{perfil.total}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-chip"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${perfil.porcentaje}%` }} /></div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{perfil.faltantes.length ? `Te falta ${perfil.faltantes.join(', ')} para mostrar un perfil más completo.` : 'Tu perfil está completo y listo para que más personas te encuentren.'}</p>
            {perfil.faltantes.length > 0 && <Link href="/dashboard/editar" className="mt-4 inline-flex text-sm font-semibold text-brand-dark hover:underline">Mejorar mi perfil →</Link>}
          </div>
          <Link href={`/negocio/${negocio.id}`} className="card group flex flex-col justify-between p-5 transition hover:border-line-strong sm:p-6">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${categoria.tono}`}><Icon name={categoria.icono} /></span>
            <span className="mt-5 block">
              <span className="block text-[13px] font-medium text-ink-subtle">Tu vitrina</span>
              <span className="mt-1 block text-xl font-bold tracking-[-0.02em]">Así te ven los clientes</span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">Ver perfil <Icon name="chevronRight" size={16} /></span>
            </span>
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Mantén tu negocio al día</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {acciones.map(({ href, title, description, icon, tono }) => (
              <Link key={title} href={href} className="card flex items-center gap-4 p-4 transition hover:border-line-strong">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tono}`}><Icon name={icon} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{title}</span><span className="mt-0.5 block truncate text-sm text-ink-subtle">{description}</span></span>
                <Icon name="chevronRight" size={18} className="text-ink-subtle" />
              </Link>
            ))}
          </div>
        </section>

        <CompartirNegocio negocioId={negocio.id} nombre={negocio.nombre} />

        <section className="card mt-10 p-5 sm:p-6">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Cómo te piden</h2>
          <p className="mt-1 text-sm text-ink-subtle">Aparece en tu tarjeta, en tu perfil y en el mensaje de WhatsApp que te envían.</p>
          {!negocio.pedidos && <p className="mt-3 rounded-xl bg-mango-soft px-3.5 py-2.5 text-sm text-mango">Aún no lo configuras. Los clientes no saben si haces domicilio ni cómo pagarte.</p>}
          <form onSubmit={guardarPedidos} className="mt-5">
            <EditorPedidos valor={pedidos} onChange={setPedidos} direccion={negocio.direccion} />
            <button type="submit" disabled={guardandoPedidos} className="btn-primary mt-5 w-full sm:w-auto">{guardandoPedidos ? 'Guardando…' : 'Guardar cómo te piden'}</button>
          </form>
        </section>

        <section className="card mt-10 p-5 sm:p-6">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Información principal</h2>
          <p className="mt-1 text-sm text-ink-subtle">Lo que aparece en tu perfil. Guarda los cambios cuando termines.</p>
          <form onSubmit={guardarCambios} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Campo id="campo-nombre" label="Nombre del negocio" value={negocio.nombre} onChange={valor => setNegocio(actual => ({ ...actual, nombre: valor }))} />
            <Campo id="campo-whatsapp" label="WhatsApp del negocio" value={negocio.whatsapp || ''} onChange={valor => setNegocio(actual => ({ ...actual, whatsapp: valor }))} placeholder="+57 300 000 0000" />
            <Campo id="campo-direccion" label="Dirección o punto de referencia" value={negocio.direccion || ''} onChange={valor => setNegocio(actual => ({ ...actual, direccion: valor }))} placeholder="Frente al parque principal" />
            <fieldset className="sm:col-span-2">
              <legend className="label">Redes sociales <span className="font-normal text-ink-subtle">(opcional)</span></legend>
              <p className="mb-3 text-xs text-ink-subtle">Escribe tu usuario o pega el enlace de tu perfil. Aparecerán como botones en tu perfil.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {REDES.map(red => (
                  <div key={red.clave}>
                    <label htmlFor={`red-${red.clave}`} className="mb-1.5 flex items-center gap-2 text-sm font-medium"><span className={`flex h-6 w-6 items-center justify-center rounded-md ${red.estilo}`}><Icon name={red.clave} size={14} strokeWidth={2.2} /></span>{red.label}</label>
                    <div className="flex h-12 items-center rounded-xl border border-line-strong bg-white px-3 focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10">
                      <span className="text-ink-subtle">@</span>
                      <input id={`red-${red.clave}`} value={(redes[red.clave] || '').replace(/^@/, '')} onChange={event => setRedes(actual => ({ ...actual, [red.clave]: event.target.value }))} placeholder="tunegocio" autoCapitalize="none" autoCorrect="off" className="min-w-0 flex-1 bg-transparent pl-1 text-base outline-none placeholder:text-ink-subtle/80" />
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
            <fieldset className="sm:col-span-2">
              <legend className="label">Horario de atención</legend>
              {horarios ? (
                <>
                  <p className="mb-3 text-xs text-ink-subtle">Tu negocio aparece abierto o cerrado automáticamente según este horario.</p>
                  <EditorHorario valor={horarios} onChange={setHorarios} />
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-line-strong bg-paper p-4">
                  {negocio.horario && <p className="text-sm">Horario actual: <span className="text-ink-muted">{negocio.horario}</span></p>}
                  <p className="mt-1 text-sm text-ink-subtle">Configura tu horario por días para que tu negocio se abra y cierre solo en la página.</p>
                  <button type="button" onClick={() => setHorarios(horarioInicial())} className="btn-dark mt-3 h-11">Configurar horario</button>
                </div>
              )}
            </fieldset>
            <div className="sm:col-span-2"><button type="submit" disabled={guardando} className="btn-primary w-full sm:w-auto">{guardando ? 'Guardando…' : 'Guardar cambios'}</button></div>
          </form>
        </section>

        <section className="mt-10 rounded-[20px] border border-danger/25 bg-danger-soft/50 p-5 sm:p-6">
          <h2 className="text-base font-bold text-danger">Zona de peligro</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">Al eliminar el negocio se borrarán fotos, carta y productos. Esta acción no se puede deshacer.</p>
          {!confirmarEliminar ? (
            <button type="button" onClick={() => setConfirmarEliminar(true)} className="mt-4 h-11 rounded-xl border border-danger/30 bg-white px-4 text-sm font-semibold text-danger transition hover:bg-danger-soft">Eliminar mi negocio</button>
          ) : (
            <div className="mt-4 rounded-2xl border border-danger/25 bg-white p-4">
              <p className="text-sm font-semibold text-danger">¿Seguro que deseas eliminarlo?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setConfirmarEliminar(false)} className="btn-secondary h-11">Cancelar</button>
                <button type="button" onClick={eliminarNegocio} disabled={eliminando} className="h-11 rounded-xl bg-danger px-4 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-60">{eliminando ? 'Eliminando…' : 'Sí, eliminar negocio'}</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function calcularPerfil(negocio) {
  const secciones = [{ completa: Boolean(negocio.nombre), nombre: 'nombre' }, { completa: Boolean(negocio.whatsapp), nombre: 'WhatsApp' }, { completa: Boolean(negocio.direccion), nombre: 'ubicación' }, { completa: tieneHorario(negocio.horarios), nombre: 'horario' }, { completa: Boolean(negocio.tags?.length), nombre: 'productos' }, { completa: Boolean(negocio.fotos_comida?.length), nombre: 'fotos' }, { completa: Boolean(negocio.cartas?.length), nombre: 'carta' }]
  const completos = secciones.filter(seccion => seccion.completa).length
  return { completos, total: secciones.length, porcentaje: Math.round((completos / secciones.length) * 100), faltantes: secciones.filter(seccion => !seccion.completa).map(seccion => seccion.nombre) }
}

// Tarjeta de disponibilidad. Con horario, el estado es automático y solo se puede cerrar por hoy;
// sin horario, se mantiene el interruptor manual de antes.
function Disponibilidad({ negocio, estado, ocupado, onToggleManual, onCerrarHoy, onReanudar }) {
  const { abierto } = estado
  let titulo = abierto ? 'Tu negocio está abierto' : 'Tu negocio está cerrado'
  let detalle = abierto ? 'Los clientes te ven en "Abiertos para ti" y en el filtro "Abiertos ahora".' : 'Actívalo cuando estés listo para recibir pedidos.'
  let accion = null

  if (estado.automatico) {
    if (estado.pausado) {
      titulo = 'Cerrado por hoy'
      detalle = 'Mañana vuelves a abrir según tu horario.'
      accion = <button type="button" onClick={onReanudar} disabled={ocupado} className="h-12 self-start rounded-2xl bg-white px-5 text-sm font-semibold text-ink transition hover:bg-white/90 disabled:opacity-60 sm:self-auto">{ocupado ? 'Guardando…' : 'Volver a mi horario'}</button>
    } else {
      detalle = `${estado.texto} · Se actualiza solo según tu horario.`
      const abreMasTardeHoy = !abierto && estado.texto?.startsWith('Abre hoy')
      if (abierto || abreMasTardeHoy) {
        accion = <button type="button" onClick={onCerrarHoy} disabled={ocupado} className="h-12 self-start rounded-2xl bg-white/15 px-5 text-sm font-semibold transition hover:bg-white/25 disabled:opacity-60 sm:self-auto">{ocupado ? 'Guardando…' : abierto ? 'Cerrar por hoy' : 'Hoy no voy a abrir'}</button>
      }
    }
  } else {
    accion = (
      <button type="button" role="switch" aria-checked={abierto} onClick={onToggleManual} disabled={ocupado} className="flex h-12 items-center gap-3 self-start rounded-2xl bg-white/15 px-4 text-sm font-semibold transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-60 sm:self-auto">
        <span className={`relative h-7 w-12 rounded-full transition ${abierto ? 'bg-white' : 'bg-white/30'}`}><span className={`absolute top-1 h-5 w-5 rounded-full shadow transition-all ${abierto ? 'left-6 bg-ok' : 'left-1 bg-white'}`} /></span>
        {ocupado ? 'Guardando…' : abierto ? 'Abierto' : 'Abrir ahora'}
      </button>
    )
  }

  return (
    <section className={`mt-6 rounded-3xl p-5 text-white sm:p-7 ${abierto ? 'bg-ok' : 'bg-ink'}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-white/70">Disponibilidad{estado.automatico && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">Automática</span>}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">{titulo}</h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">{detalle}</p>
          {!estado.automatico && <p className="mt-2 max-w-md text-xs text-white/60">Configura tu horario abajo y no tendrás que abrir y cerrar a mano.</p>}
        </div>
        {accion}
      </div>
    </section>
  )
}

function Campo({ id, label, value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type="text" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="input" />
    </div>
  )
}
