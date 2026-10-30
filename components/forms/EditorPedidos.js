'use client'

import { PAGOS, TIEMPOS } from '@/lib/pedidos'

const COSTOS = [
  { valor: 'fijo', label: 'Valor fijo', ayuda: 'El mismo valor para todos' },
  { valor: 'gratis', label: 'Gratis', ayuda: 'Sin costo para el cliente' },
  { valor: 'gratis_desde', label: 'Gratis desde', ayuda: 'Según el valor del pedido' },
]

// Editor de domicilio, recogida y formas de pago. `valor` tiene la forma de lib/pedidos.js.
export default function EditorPedidos({ valor, onChange, direccion }) {
  const cambiar = cambios => onChange({ ...valor, ...cambios })

  function alternarPago(pago) {
    cambiar({ pagos: valor.pagos.includes(pago) ? valor.pagos.filter(item => item !== pago) : [...valor.pagos, pago] })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line p-4 sm:p-5">
        <Interruptor id="pedidos-domicilio" titulo="Hago domicilios" ayuda="A toda Ciénaga. Los clientes podrán filtrar por «Con domicilio»." activo={valor.domicilio} onChange={domicilio => cambiar({ domicilio })} />
        {valor.domicilio && (
          <div className="mt-5 space-y-4">
            <fieldset>
              <legend className="label">Costo del domicilio</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {COSTOS.map(costo => {
                  const elegido = valor.costo_tipo === costo.valor
                  return (
                    <label key={costo.valor} className={`flex cursor-pointer flex-col gap-1 rounded-xl border px-3 py-2.5 transition ${elegido ? 'border-ink ring-1 ring-ink' : 'border-line-strong hover:border-ink'}`}>
                      <span className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name="costo_tipo" checked={elegido} onChange={() => cambiar({ costo_tipo: costo.valor })} className="accent-ink" />{costo.label}</span>
                      <span className="text-xs text-ink-subtle">{costo.ayuda}</span>
                    </label>
                  )
                })}
              </div>
              {/* El domicilio se da por hecho en toda Ciénaga: solo se pide valor y tiempo. */}
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {valor.costo_tipo === 'gratis_desde' && <CampoPesos id="pedidos-minimo" label="Gratis en pedidos desde" valor={valor.minimo_gratis} onChange={minimo_gratis => cambiar({ minimo_gratis })} />}
                {valor.costo_tipo !== 'gratis' && <CampoPesos id="pedidos-costo" label={valor.costo_tipo === 'gratis_desde' ? 'Si el pedido es menor, cuesta' : 'Valor del domicilio'} valor={valor.costo} onChange={costo => cambiar({ costo })} />}
                <div>
                  <label htmlFor="pedidos-tiempo" className="label">Tiempo estimado</label>
                  <select id="pedidos-tiempo" value={valor.tiempo} onChange={event => cambiar({ tiempo: event.target.value })} className="input">
                    {TIEMPOS.map(tiempo => <option key={tiempo}>{tiempo}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line p-4 sm:p-5">
        <Interruptor id="pedidos-recoger" titulo="Se puede recoger en el local" ayuda={direccion ? `Usamos tu dirección: ${direccion}.` : 'Agrega tu dirección arriba para que sepan dónde recoger.'} activo={valor.recoger} onChange={recoger => cambiar({ recoger })} />
      </div>

      <fieldset className="rounded-2xl border border-line p-4 sm:p-5">
        <legend className="sr-only">Formas de pago</legend>
        <p className="text-base font-semibold">Formas de pago</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PAGOS.map(pago => {
            const marcado = valor.pagos.includes(pago.valor)
            return (
              <label key={pago.valor} className={`flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-[15px] transition ${marcado ? 'border-ink font-medium ring-1 ring-ink' : 'border-line-strong hover:border-ink'}`}>
                <input type="checkbox" checked={marcado} onChange={() => alternarPago(pago.valor)} className="h-[18px] w-[18px] accent-ink" />
                {pago.label}
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

function Interruptor({ id, titulo, ayuda, activo, onChange }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-base font-semibold">{titulo}</span>
        <span className="mt-0.5 block text-sm text-ink-subtle">{ayuda}</span>
      </span>
      <input id={id} type="checkbox" checked={activo} onChange={event => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-line transition peer-checked:bg-ok peer-focus-visible:ring-4 peer-focus-visible:ring-ink/10">
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${activo ? 'left-6' : 'left-1'}`} />
      </span>
    </label>
  )
}

function CampoPesos({ id, label, valor, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="flex h-12 items-center rounded-xl border border-line-strong bg-white px-4 focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10">
        <span className="text-ink-subtle">$</span>
        <input id={id} inputMode="numeric" value={valor ? Number(valor).toLocaleString('es-CO') : ''} onChange={event => onChange(Number(event.target.value.replace(/\D/g, '')) || 0)} placeholder="0" className="w-full bg-transparent pl-1.5 text-base outline-none" />
      </div>
    </div>
  )
}
