import { Bloque, EncabezadoCargando, TextoCargando } from '@/components/ui/Esqueleto'

// Pantalla de carga del perfil: galería, datos del negocio y tarjeta de contacto.
export default function CargandoNegocio() {
  return (
    <>
      <div className="hidden sm:block"><EncabezadoCargando /></div>
      <main className="mx-auto max-w-6xl pb-44 sm:px-8 sm:pb-16">
        <TextoCargando>Cargando negocio…</TextoCargando>
        <section className="sm:pt-6">
          <div className="grid gap-2 sm:h-[26rem] sm:grid-cols-[2fr_1fr]">
            <Bloque className="h-72 rounded-none sm:h-full sm:rounded-3xl" />
            <div className="hidden grid-rows-2 gap-2 sm:grid"><Bloque className="rounded-3xl" /><Bloque className="rounded-3xl" /></div>
          </div>
        </section>
        <div className="mt-6 grid gap-10 px-4 sm:px-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="flex gap-2"><Bloque className="h-7 w-28 rounded-full" /><Bloque className="h-7 w-24 rounded-full" /></div>
            <Bloque className="mt-3 h-9 w-2/3 sm:h-11" />
            <Bloque className="mt-3 h-4 w-40" />
            <div className="mt-7 grid gap-3 sm:grid-cols-2"><Bloque className="h-[78px] rounded-[20px]" /><Bloque className="h-[78px] rounded-[20px]" /></div>
            <Bloque className="mt-10 h-6 w-40" />
            <div className="mt-4 flex flex-wrap gap-2">{['w-24', 'w-28', 'w-20', 'w-32'].map((ancho, indice) => <Bloque key={indice} className={`h-10 rounded-full ${ancho}`} />)}</div>
          </div>
          <div className="card hidden h-fit p-5 lg:block">
            <Bloque className="h-4 w-32" />
            <Bloque className="mt-2 h-4 w-48" />
            <Bloque className="mt-4 h-12 w-full" />
            <Bloque className="mt-2 h-12 w-full" />
          </div>
        </div>
      </main>
    </>
  )
}
