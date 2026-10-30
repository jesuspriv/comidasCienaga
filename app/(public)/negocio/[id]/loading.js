import Logo from '@/components/ui/Logo'
import { Bloque, TextoCargando } from '@/components/ui/Esqueleto'

// Pantalla de carga del perfil en modo noche: nombre y botones a la izquierda, collage a la derecha.
export default function CargandoNegocio() {
  return (
    <div className="bg-noche pb-44 sm:pb-16">
      <header className="mx-auto hidden h-[68px] max-w-6xl items-center px-8 sm:flex"><Logo claro /></header>
      <main className="mx-auto max-w-6xl sm:px-8">
        <TextoCargando>Cargando negocio…</TextoCargando>
        <section className="grid items-center gap-6 sm:pt-4 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pt-2">
          <Bloque oscuro className="h-80 rounded-none sm:h-[26rem] sm:rounded-3xl lg:order-2 lg:h-[30rem] lg:-rotate-1 lg:rounded-[28px]" />
          <div className="px-4 sm:px-0 lg:order-1">
            <div className="flex gap-2"><Bloque oscuro className="h-8 w-24 rounded-full" /><Bloque oscuro className="h-8 w-40 rounded-full" /></div>
            <Bloque oscuro className="mt-4 h-12 w-4/5 lg:h-[72px]" />
            <Bloque oscuro className="mt-3 h-12 w-1/2 lg:hidden" />
            <Bloque oscuro className="mt-4 h-5 w-56" />
            <div className="mt-7 flex gap-2.5"><Bloque oscuro className="hidden h-14 w-60 rounded-full lg:block" /><Bloque oscuro className="h-12 w-12 rounded-full lg:h-14 lg:w-14" /><Bloque oscuro className="h-12 w-12 rounded-full lg:h-14 lg:w-14" /></div>
          </div>
        </section>
        <div className="px-4 sm:px-0">
          <Bloque oscuro className="mt-12 h-8 w-44 lg:mt-14" />
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map(indice => <Bloque oscuro key={indice} className="h-[150px] rounded-[28px]" />)}</div>
        </div>
      </main>
    </div>
  )
}
