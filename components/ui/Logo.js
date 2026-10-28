import Link from 'next/link'
import Icon from '@/components/ui/Icon'

// `claro`: texto blanco, para usarlo encima de una foto oscura.
export default function Logo({ className = '', claro = false }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em] sm:text-lg ${claro ? 'text-white' : 'text-ink'} ${className}`}>
      <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-white ${claro ? 'bg-fuego' : 'bg-brand'}`}>
        <Icon name="burger" size={16} strokeWidth={2.4} />
      </span>
      ComidasCiénaga
    </Link>
  )
}
