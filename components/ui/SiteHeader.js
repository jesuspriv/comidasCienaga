import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/ui/Logo'
import Icon from '@/components/ui/Icon'

// Encabezado público. Si el dueño de un negocio tiene la sesión abierta, en lugar de
// "Ingresar" y "Publica tu negocio" le muestra el acceso a su panel.
// `sobreFoto`: versión transparente con texto blanco para ponerla encima de una foto.
export default async function SiteHeader({ sobreFoto = false }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const conSesion = Boolean(data?.claims?.sub)

  const enlace = sobreFoto ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-chip'
  const principal = sobreFoto ? 'rounded-full bg-white text-cafe hover:bg-white/90' : 'rounded-[10px] bg-ink text-white hover:bg-ink-soft'

  return (
    <header className={sobreFoto ? 'relative z-40' : 'sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur'}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[68px] sm:px-8">
        <Logo claro={sobreFoto} />
        <nav aria-label="Principal" className="flex items-center gap-1">
          <Link href="/buscar" className={`hidden h-10 items-center rounded-[10px] px-3.5 text-sm font-medium transition sm:flex ${enlace}`}>Buscar</Link>
          {conSesion ? (
            <Link href="/dashboard" className={`ml-1.5 flex h-10 items-center gap-2 px-3.5 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${principal}`}>
              <Icon name="store" size={16} /> Mi negocio
            </Link>
          ) : (
            <>
              <Link href="/login" className={`hidden h-10 items-center rounded-[10px] px-3.5 text-sm font-medium transition sm:flex ${enlace}`}>Ingresar</Link>
              <Link href="/registro" className={`ml-1.5 flex h-10 items-center px-3.5 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${principal}`}>
                <span className="sm:hidden">Publicar</span>
                <span className="hidden sm:inline">Publica tu negocio</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
