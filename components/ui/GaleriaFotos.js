'use client'

import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/ui/Icon'

// Galería del perfil: carrusel deslizable en móvil y mosaico de 3 fotos en escritorio.
// Todas las fotos se pueden ver en grande con el visor.
export default function GaleriaFotos({ fotos, nombre }) {
  const carrusel = useRef(null)
  const [actual, setActual] = useState(0)
  const [visor, setVisor] = useState(null)

  function alDeslizar() {
    const el = carrusel.current
    if (el) setActual(Math.round(el.scrollLeft / el.clientWidth))
  }

  function irA(indice) {
    const el = carrusel.current
    if (el) el.scrollTo({ left: indice * el.clientWidth, behavior: 'smooth' })
  }

  const [principal, ...otras] = fotos
  const laterales = otras.slice(0, 2)

  return (
    <>
      <div className="relative sm:hidden">
        <div ref={carrusel} onScroll={alDeslizar} className="no-scrollbar flex h-72 snap-x snap-mandatory overflow-x-auto">
          {fotos.map((foto, indice) => (
            <button key={foto.url} type="button" onClick={() => setVisor(indice)} aria-label={`Ver foto ${indice + 1} de ${fotos.length} en grande`} className="relative h-full w-full shrink-0 snap-center bg-chip">
              <img src={foto.url} alt={indice === 0 ? `Foto principal de ${nombre}` : ''} className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {fotos.length > 1 && (
          <>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">{actual + 1} / {fotos.length}</span>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {fotos.map((foto, indice) => (
                <button key={foto.url} type="button" onClick={() => irA(indice)} aria-label={`Ir a la foto ${indice + 1}`} className="flex h-6 items-center px-0.5">
                  <span className={`block h-1.5 rounded-full transition-all ${indice === actual ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={`hidden h-[26rem] gap-2 sm:grid ${laterales.length ? 'grid-cols-[2fr_1fr]' : ''}`}>
        <button type="button" onClick={() => setVisor(0)} aria-label="Ver foto principal en grande" className="relative min-h-0 overflow-hidden rounded-3xl bg-chip">
          <img src={principal.url} alt={`Foto principal de ${nombre}`} className="absolute inset-0 h-full w-full object-cover" />
        </button>
        {laterales.length > 0 && (
          <div className={`grid min-h-0 gap-2 ${laterales.length > 1 ? 'grid-rows-2' : ''}`}>
            {laterales.map((foto, indice) => {
              const ultima = indice === laterales.length - 1
              const restantes = fotos.length - 3
              return (
                <button key={foto.url} type="button" onClick={() => setVisor(indice + 1)} aria-label={ultima && restantes > 0 ? `Ver todas las fotos (${fotos.length})` : `Ver foto ${indice + 2} en grande`} className="group relative min-h-0 overflow-hidden rounded-3xl bg-chip">
                  <img src={foto.url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {ultima && restantes > 0 && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">+{restantes} {restantes === 1 ? 'foto' : 'fotos'}</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {visor !== null && <Visor fotos={fotos} nombre={nombre} inicial={visor} onCerrar={() => setVisor(null)} />}
    </>
  )
}

function Visor({ fotos, nombre, inicial, onCerrar }) {
  const [indice, setIndice] = useState(inicial)

  // Evita que la página de fondo se desplace mientras el visor está abierto.
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [])

  const anterior = () => setIndice(valor => (valor - 1 + fotos.length) % fotos.length)
  const siguiente = () => setIndice(valor => (valor + 1) % fotos.length)

  function alTeclear(event) {
    if (event.key === 'Escape') onCerrar()
    if (event.key === 'ArrowLeft') anterior()
    if (event.key === 'ArrowRight') siguiente()
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`Fotos de ${nombre}`} tabIndex={-1} onKeyDown={alTeclear} ref={el => el?.focus()} className="fixed inset-0 z-[60] flex flex-col bg-black/95 outline-none">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium">{indice + 1} / {fotos.length}</span>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"><Icon name="x" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4" onClick={event => { if (event.target === event.currentTarget) onCerrar() }}>
        <img src={fotos[indice].url} alt={`Foto ${indice + 1} de ${nombre}`} className="max-h-full max-w-full rounded-2xl object-contain" />
        {fotos.length > 1 && (
          <>
            <button type="button" onClick={anterior} aria-label="Foto anterior" className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-6"><Icon name="arrowLeft" /></button>
            <button type="button" onClick={siguiente} aria-label="Foto siguiente" className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6"><Icon name="arrowRight" /></button>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="no-scrollbar flex justify-start gap-2 overflow-x-auto px-4 pb-5 sm:justify-center">
          {fotos.map((foto, posicion) => (
            <button key={foto.url} type="button" onClick={() => setIndice(posicion)} aria-label={`Ver foto ${posicion + 1}`} aria-current={posicion === indice} className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition ${posicion === indice ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'}`}>
              <img src={foto.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
