import { Bloque, EncabezadoCargando, TarjetaCargando, TextoCargando } from '@/components/ui/Esqueleto'

// Pantalla de carga de la búsqueda: buscador, filtros y resultados con el panel lateral.
export default function CargandoBusqueda() {
  return (
    <>
      <EncabezadoCargando />
      <main className="mx-auto flex max-w-6xl gap-10 px-4 pb-16 sm:px-8">
        <TextoCargando>Buscando negocios…</TextoCargando>
        <div className="min-w-0 flex-1">
          <section className="pb-6 pt-8 sm:pt-10">
            <Bloque className="h-9 w-3/4 max-w-md sm:h-10" />
            <Bloque className="mt-5 h-[52px] w-full max-w-2xl rounded-2xl sm:h-[60px]" />
            <div className="mt-4 flex gap-1.5 overflow-hidden">
              {['w-14', 'w-20', 'w-20', 'w-20', 'w-16', 'w-20', 'w-32'].map((ancho, indice) => <Bloque key={indice} className={`h-10 shrink-0 rounded-[10px] ${ancho}`} />)}
            </div>
          </section>
          <Bloque className="mb-4 h-4 w-28" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TarjetaCargando />
            <TarjetaCargando />
            <div className="hidden sm:block"><TarjetaCargando /></div>
            <div className="hidden sm:block"><TarjetaCargando /></div>
          </div>
        </div>
        <div className="card sticky top-24 mt-10 hidden h-[320px] w-[320px] shrink-0 self-start p-5 lg:block">
          <Bloque className="h-4 w-28" />
          <Bloque className="mt-3 h-8 w-36" />
          <Bloque className="mt-4 h-11 w-full" />
          <Bloque className="mt-6 h-4 w-48" />
          <div className="mt-3 flex flex-wrap gap-1.5">{['w-20', 'w-28', 'w-24', 'w-16', 'w-24'].map((ancho, indice) => <Bloque key={indice} className={`h-8 rounded-full ${ancho}`} />)}</div>
        </div>
      </main>
    </>
  )
}
