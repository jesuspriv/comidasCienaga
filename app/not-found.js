import Link from 'next/link'
import SiteHeader from '@/components/ui/SiteHeader'
import Icon from '@/components/ui/Icon'

export const metadata = {
  title: 'Página no encontrada — ComidasCiénaga',
  robots: { index: false },
}

// Se muestra cuando una ruta no existe o cuando un negocio fue borrado (notFound()).
export default function NoEncontrado() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:py-28">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><Icon name="search" size={26} /></span>
        <p className="mt-6 text-sm font-semibold text-brand-dark">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">No encontramos esta página</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">Puede que el negocio ya no esté publicado o que el enlace esté mal escrito.</p>
        <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href="/buscar" className="btn-primary">Buscar comida</Link>
          <Link href="/" className="btn-secondary">Ir al inicio</Link>
        </div>
      </main>
    </>
  )
}
