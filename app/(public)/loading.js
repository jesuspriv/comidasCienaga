import { Bloque, EncabezadoCargando, TarjetaCargando, TextoCargando } from '@/components/ui/Esqueleto'

// Pantalla de carga del inicio: misma estructura que la página mientras llegan los negocios.
export default function CargandoInicio() {
  return (
    <>
      <EncabezadoCargando />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <TextoCargando>Cargando negocios…</TextoCargando>
        <section className="flex flex-col gap-8 pb-10 pt-8 sm:pt-14 lg:flex-row lg:items-center lg:gap-12">
          <div className="min-w-0 lg:flex-[1.15]">
            <Bloque className="h-[30px] w-44 rounded-full" />
            <Bloque className="mt-5 h-10 w-4/5 sm:h-14" />
            <Bloque className="mt-3 h-10 w-2/5 sm:h-14" />
            <Bloque className="mt-5 h-4 w-full max-w-[440px]" />
            <Bloque className="mt-2 h-4 w-3/5 max-w-[300px]" />
            <Bloque className="mt-7 h-[52px] w-full max-w-[560px] rounded-2xl sm:h-[60px]" />
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3 lg:flex-1 lg:grid-cols-2">
            <Bloque className="h-[104px] rounded-2xl sm:h-32 lg:row-span-2 lg:h-auto lg:min-h-[280px] lg:rounded-[22px]" />
            {[0, 1, 2, 3].map(indice => <Bloque key={indice} className="h-[104px] rounded-2xl sm:h-32 lg:h-[134px] lg:rounded-[22px]" />)}
            <Bloque className="h-[104px] rounded-2xl sm:h-32 lg:hidden" />
          </div>
        </section>
        <Bloque className="h-4 w-36" />
        <Bloque className="mt-2.5 mb-4 h-7 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaCargando />
          <div className="hidden sm:block"><TarjetaCargando /></div>
          <div className="hidden lg:block"><TarjetaCargando /></div>
        </div>
      </main>
    </>
  )
}
