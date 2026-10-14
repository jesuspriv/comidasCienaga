'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Aviso, Cargando, PanelHeader } from '@/components/dashboard/PanelUI'
import Icon from '@/components/ui/Icon'
import { obtenerCategoria } from '@/lib/categorias'

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

  useEffect(() => {
    let activo = true
    async function cargarNegocio() {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) return router.replace('/login')
      const { data, error } = await supabase.from('negocios').select('*, tags(valor), fotos_comida(url), cartas(url, tipo)').eq('usuario_id', authData.user.id).single()
      if (!activo) return
      if (error || !data) return router.replace('/registro')
      setNegocio(data)
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

  async function guardarCambios(event) {
    event.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('negocios').update({ nombre: negocio.nombre.trim(), direccion: negocio.direccion?.trim() || null, whatsapp: negocio.whatsapp?.trim() || null, horario: negocio.horario?.trim() || null }).eq('id', negocio.id)
    setGuardando(false)
    mostrarMensaje(error ? 'error' : 'success', error ? 'No pudimos guardar los cambios. Inténtalo de nuevo.' : 'Información guardada correctamente.')
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

        <section className={`mt-6 rounded-3xl p-5 text-white sm:p-7 ${negocio.abierto_ahora ? 'bg-ok' : 'bg-ink'}`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Disponibilidad</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">{negocio.abierto_ahora ? 'Tu negocio está abierto' : 'Tu negocio está cerrado'}</h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">{negocio.abierto_ahora ? 'Los clientes te ven en "Abiertos para ti" y en el filtro "Abiertos ahora".' : 'Actívalo cuando estés listo para recibir pedidos.'}</p>
            </div>
            <button type="button" role="switch" aria-checked={negocio.abierto_ahora} onClick={toggleAbierto} disabled={cambiandoEstado} className="flex h-12 items-center gap-3 self-start rounded-2xl bg-white/15 px-4 text-sm font-semibold transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-60 sm:self-auto">
              <span className={`relative h-7 w-12 rounded-full transition ${negocio.abierto_ahora ? 'bg-white' : 'bg-white/30'}`}><span className={`absolute top-1 h-5 w-5 rounded-full shadow transition-all ${negocio.abierto_ahora ? 'left-6 bg-ok' : 'left-1 bg-white'}`} /></span>
              {cambiandoEstado ? 'Guardando…' : negocio.abierto_ahora ? 'Abierto' : 'Abrir ahora'}
            </button>
          </div>
        </section>

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

        <section className="card mt-10 p-5 sm:p-6">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Información principal</h2>
          <p className="mt-1 text-sm text-ink-subtle">Lo que aparece en tu perfil. Guarda los cambios cuando termines.</p>
          <form onSubmit={guardarCambios} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Campo id="campo-nombre" label="Nombre del negocio" value={negocio.nombre} onChange={valor => setNegocio(actual => ({ ...actual, nombre: valor }))} />
            <Campo id="campo-whatsapp" label="WhatsApp del negocio" value={negocio.whatsapp || ''} onChange={valor => setNegocio(actual => ({ ...actual, whatsapp: valor }))} placeholder="+57 300 000 0000" />
            <Campo id="campo-direccion" label="Dirección o punto de referencia" value={negocio.direccion || ''} onChange={valor => setNegocio(actual => ({ ...actual, direccion: valor }))} placeholder="Frente al parque principal" />
            <Campo id="campo-horario" label="Horario de atención" value={negocio.horario || ''} onChange={valor => setNegocio(actual => ({ ...actual, horario: valor }))} placeholder="Lun–Sáb, 10 a. m. – 9 p. m." />
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
  const secciones = [{ completa: Boolean(negocio.nombre), nombre: 'nombre' }, { completa: Boolean(negocio.whatsapp), nombre: 'WhatsApp' }, { completa: Boolean(negocio.direccion), nombre: 'ubicación' }, { completa: Boolean(negocio.horario), nombre: 'horario' }, { completa: Boolean(negocio.tags?.length), nombre: 'productos' }, { completa: Boolean(negocio.fotos_comida?.length), nombre: 'fotos' }, { completa: Boolean(negocio.cartas?.length), nombre: 'carta' }]
  const completos = secciones.filter(seccion => seccion.completa).length
  return { completos, total: secciones.length, porcentaje: Math.round((completos / secciones.length) * 100), faltantes: secciones.filter(seccion => !seccion.completa).map(seccion => seccion.nombre) }
}

function Campo({ id, label, value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type="text" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="input" />
    </div>
  )
}
