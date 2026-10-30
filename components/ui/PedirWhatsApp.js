'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/ui/Icon'
import { enlaceWhatsApp, etiquetaPago, mensajePedido, textoCostoDomicilio } from '@/lib/pedidos'

// Botones para pedir por WhatsApp con el mensaje ya escrito.
// Si el negocio configuró domicilio o recogida, primero se elige cómo se quiere el pedido.
// `variante`: "barra" (barra fija de móvil), "hero" (botón verde grande del perfil)
// o "tarjeta" (tarjeta lateral de escritorio).
export default function PedirWhatsApp({ nombre, whatsapp, pedidos, direccion, variante }) {
  const [abierto, setAbierto] = useState(null)
  const opciones = [pedidos?.domicilio && 'domicilio', pedidos?.recoger && 'recoger'].filter(Boolean)
  const unBoton = variante === 'barra' || variante === 'hero'
  const claseBoton = variante === 'hero'
    ? 'inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-ok-dot px-7 text-base font-extrabold text-white shadow-[0_14px_30px_rgba(30,154,82,0.35)] transition hover:-translate-y-px hover:bg-ok'
    : variante === 'barra'
      ? 'inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-ok-dot px-5 text-[15px] font-bold text-white transition hover:bg-ok'
      : 'btn-primary w-full'

  if (!opciones.length) {
    const href = enlaceWhatsApp(whatsapp, mensajePedido(nombre))
    return href ? <a href={href} target="_blank" rel="noopener noreferrer" className={claseBoton}><Icon name="whatsapp" size={variante === 'hero' ? 20 : 18} /> Escribir por WhatsApp</a> : null
  }

  return (
    <>
      {unBoton ? (
        <button type="button" onClick={() => setAbierto(opciones[0])} className={claseBoton}><Icon name="whatsapp" size={variante === 'hero' ? 20 : 18} /> Pedir por WhatsApp</button>
      ) : (
        <div className="space-y-2">
          {opciones.map((tipo, indice) => (
            <button key={tipo} type="button" onClick={() => setAbierto(tipo)} className={`${indice === 0 ? 'btn-primary' : 'btn-secondary'} w-full`}>
              {indice === 0 && <Icon name="whatsapp" size={18} />}{tipo === 'domicilio' ? 'Pedir a domicilio' : 'Pedir para recoger'}
            </button>
          ))}
        </div>
      )}
      {/* El diálogo va directo al body: la barra fija de móvil (con backdrop-blur) lo dejaría debajo de la navegación. */}
      {abierto && createPortal(<Dialogo nombre={nombre} whatsapp={whatsapp} pedidos={pedidos} direccion={direccion} opciones={opciones} inicial={abierto} onCerrar={() => setAbierto(null)} />, document.body)}
    </>
  )
}

function Dialogo({ nombre, whatsapp, pedidos, direccion, opciones, inicial, onCerrar }) {
  const [tipo, setTipo] = useState(inicial)
  const [mensaje, setMensaje] = useState(() => mensajePedido(nombre, inicial))

  // Evita que la página de fondo se desplace mientras el diálogo está abierto.
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [])

  function elegir(nuevo) {
    // Solo se reescribe el mensaje si la persona no lo cambió.
    if (mensaje === mensajePedido(nombre, tipo)) setMensaje(mensajePedido(nombre, nuevo))
    setTipo(nuevo)
  }

  const detalle = {
    domicilio: [textoCostoDomicilio(pedidos), pedidos.tiempo, 'Toda Ciénaga'].filter(Boolean).join(' · '),
    recoger: direccion || 'Pregunta la dirección por WhatsApp',
  }
  const href = enlaceWhatsApp(whatsapp, mensaje)

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="pedido-titulo" onKeyDown={event => event.key === 'Escape' && onCerrar()} className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/45 sm:items-center sm:p-4" onClick={event => { if (event.target === event.currentTarget) onCerrar() }}>
      <div className="w-full max-w-md rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:rounded-3xl sm:p-6">
        <span aria-hidden="true" className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-line-strong sm:hidden" />
        <div className="flex items-center justify-between gap-3">
          <h2 id="pedido-titulo" className="text-xl font-bold tracking-[-0.02em]">¿Cómo quieres tu pedido?</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" autoFocus className="flex h-10 w-10 items-center justify-center rounded-full bg-chip transition hover:bg-line"><Icon name="x" size={18} /></button>
        </div>

        {opciones.length > 1 && (
          <fieldset className="mt-4 grid gap-2">
            <legend className="sr-only">Tipo de pedido</legend>
            {opciones.map(opcion => (
              <label key={opcion} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 transition ${tipo === opcion ? 'border-ink ring-1 ring-ink' : 'border-line-strong hover:border-ink'}`}>
                <input type="radio" name="tipo-pedido" checked={tipo === opcion} onChange={() => elegir(opcion)} className="h-5 w-5 accent-ink" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold">{opcion === 'domicilio' ? 'A domicilio' : 'Recoger en el local'}</span>
                  <span className="mt-0.5 block text-[13px] text-ink-subtle">{detalle[opcion]}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        {opciones.length === 1 && <p className="mt-3 text-sm text-ink-muted">{tipo === 'domicilio' ? 'A domicilio' : 'Para recoger'} · {detalle[tipo]}</p>}

        {pedidos.pagos?.length > 0 && (
          <>
            <p className="mt-4 text-[13px] font-semibold">Pagas con</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{pedidos.pagos.map(pago => <span key={pago} className="flex h-8 items-center rounded-full bg-chip px-3 text-[13px]">{etiquetaPago(pago)}</span>)}</div>
          </>
        )}

        <label htmlFor="pedido-mensaje" className="mt-4 block text-[13px] font-semibold">Tu mensaje <span className="font-normal text-ink-subtle">(puedes cambiarlo)</span></label>
        <textarea id="pedido-mensaje" rows={3} value={mensaje} onChange={event => setMensaje(event.target.value)} className="mt-1.5 w-full resize-none rounded-2xl border border-line-strong bg-paper px-3.5 py-2.5 text-base leading-snug outline-none focus:border-ink focus:ring-4 focus:ring-ink/10" />

        {href && <a href={href} target="_blank" rel="noopener noreferrer" onClick={onCerrar} className="btn-primary mt-3 h-[52px] w-full text-base"><Icon name="whatsapp" size={20} /> Abrir WhatsApp</a>}
      </div>
    </div>
  )
}
