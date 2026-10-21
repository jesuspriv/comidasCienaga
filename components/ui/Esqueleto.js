import Logo from '@/components/ui/Logo'

// Piezas de las pantallas de carga (loading.js): bloques grises que laten con la forma del contenido real.

export function Bloque({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-line-strong/70 ${className}`} />
}

export function EncabezadoCargando() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[68px] sm:px-8">
        <Logo />
        <Bloque className="h-10 w-24 rounded-[10px] sm:w-40" />
      </div>
    </header>
  )
}

export function TarjetaCargando() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-line bg-white">
      <Bloque className="h-44 rounded-none" />
      <div className="p-4">
        <Bloque className="h-4 w-3/5" />
        <Bloque className="mt-2.5 h-3 w-2/5" />
        <div className="mt-3.5 flex gap-1.5"><Bloque className="h-6 w-20 rounded-lg" /><Bloque className="h-6 w-16 rounded-lg" /></div>
      </div>
    </div>
  )
}

export function TextoCargando({ children = 'Cargando…' }) {
  return <p role="status" className="sr-only">{children}</p>
}
