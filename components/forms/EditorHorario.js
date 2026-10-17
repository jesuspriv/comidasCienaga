'use client'

import { DIAS, resumenHorario } from '@/lib/horario'

// Editor del horario semanal: por cada día, si abre y a qué horas.
// `valor` tiene la forma { lun: { abierto, abre, cierra }, ... } y `onChange` recibe el objeto nuevo.
export default function EditorHorario({ valor, onChange }) {
  function cambiarDia(clave, cambios) {
    onChange({ ...valor, [clave]: { ...valor[clave], ...cambios } })
  }

  // Copia las horas del primer día abierto a todos los días que están abiertos.
  function copiarATodos() {
    const modelo = DIAS.map(dia => valor[dia.clave]).find(turno => turno?.abierto)
    if (!modelo) return
    onChange(Object.fromEntries(DIAS.map(dia => [dia.clave, valor[dia.clave]?.abierto ? { ...valor[dia.clave], abre: modelo.abre, cierra: modelo.cierra } : valor[dia.clave]])))
  }

  const resumen = resumenHorario(valor)

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line-strong bg-white">
        {DIAS.map(dia => {
          const turno = valor[dia.clave] || { abierto: false, abre: '11:00', cierra: '21:00' }
          const pasaMedianoche = turno.abierto && turno.cierra <= turno.abre
          return (
            <div key={dia.clave} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5 last:border-b-0 sm:flex-nowrap sm:px-4">
              <label className="flex min-w-[132px] cursor-pointer items-center gap-3">
                <input type="checkbox" checked={turno.abierto} onChange={event => cambiarDia(dia.clave, { abierto: event.target.checked })} className="peer sr-only" />
                <span aria-hidden="true" className="relative h-6 w-10 shrink-0 rounded-full bg-line transition peer-checked:bg-ok peer-focus-visible:ring-4 peer-focus-visible:ring-ink/10">
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${turno.abierto ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
                <span className={`text-sm font-medium ${turno.abierto ? 'text-ink' : 'text-ink-subtle'}`}>{dia.label}</span>
              </label>
              {turno.abierto ? (
                <div className="ml-auto flex items-center gap-2 sm:ml-0">
                  <label className="sr-only" htmlFor={`abre-${dia.clave}`}>{dia.label}: abre</label>
                  <input id={`abre-${dia.clave}`} type="time" value={turno.abre} onChange={event => cambiarDia(dia.clave, { abre: event.target.value })} className="h-10 rounded-lg border border-line-strong bg-white px-2 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-ink/10" />
                  <span className="text-sm text-ink-subtle">a</span>
                  <label className="sr-only" htmlFor={`cierra-${dia.clave}`}>{dia.label}: cierra</label>
                  <input id={`cierra-${dia.clave}`} type="time" value={turno.cierra} onChange={event => cambiarDia(dia.clave, { cierra: event.target.value })} className="h-10 rounded-lg border border-line-strong bg-white px-2 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-ink/10" />
                  {pasaMedianoche && <span className="hidden text-xs text-ink-subtle sm:inline">del día siguiente</span>}
                </div>
              ) : (
                <span className="ml-auto text-sm text-ink-subtle sm:ml-0">Cerrado</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-subtle">{resumen || 'Marca los días en que abres.'}</p>
        <button type="button" onClick={copiarATodos} className="h-9 rounded-lg px-2.5 text-xs font-semibold text-brand-dark transition hover:bg-brand-soft">Usar las mismas horas todos los días</button>
      </div>
    </div>
  )
}
