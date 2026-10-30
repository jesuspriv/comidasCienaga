import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { RESPONSABLE } from '@/lib/sitio'

// Pie de página de las páginas públicas.
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-subtle">El directorio de comida de Ciénaga, Magdalena.</p>
        </div>
        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <Link href="/buscar" className="text-ink-muted hover:text-ink">Buscar comida</Link>
          <Link href="/registro" className="text-ink-muted hover:text-ink">Publica tu negocio</Link>
          <Link href="/login" className="text-ink-muted hover:text-ink">Ingresar</Link>
          <Link href="/privacidad" className="text-ink-muted hover:text-ink">Política de privacidad</Link>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-ink-subtle sm:px-8">© {new Date().getFullYear()} ComidasCiénaga · Contacto: {RESPONSABLE.correo}</p>
    </footer>
  )
}
