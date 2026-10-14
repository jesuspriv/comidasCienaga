import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[68px] sm:px-8">
        <Logo />
        <nav aria-label="Principal" className="flex items-center gap-1">
          <Link href="/buscar" className="hidden h-10 items-center rounded-[10px] px-3.5 text-sm font-medium text-ink transition hover:bg-chip sm:flex">Buscar</Link>
          <Link href="/login" className="hidden h-10 items-center rounded-[10px] px-3.5 text-sm font-medium text-ink transition hover:bg-chip sm:flex">Ingresar</Link>
          <Link href="/registro" className="ml-1.5 flex h-10 items-center rounded-[10px] bg-ink px-3.5 text-[13px] font-semibold text-white transition hover:bg-ink-soft sm:px-4 sm:text-sm">
            <span className="sm:hidden">Publicar</span>
            <span className="hidden sm:inline">Publica tu negocio</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
