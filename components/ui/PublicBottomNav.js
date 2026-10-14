'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/ui/Icon'

const items = [
  { href: '/', label: 'Inicio', icon: 'home', match: pathname => pathname === '/' },
  { href: '/buscar', label: 'Buscar', icon: 'search', match: pathname => pathname.startsWith('/buscar') },
  { href: '/dashboard', label: 'Mi negocio', icon: 'store', match: pathname => pathname.startsWith('/dashboard') },
]

export default function PublicBottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map(({ href, label, icon, match }) => {
          const active = match(pathname)
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] transition-colors ${active ? 'font-semibold text-brand' : 'font-medium text-ink-subtle hover:text-ink'}`}>
              <Icon name={icon} size={22} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
