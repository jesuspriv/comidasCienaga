import Link from 'next/link'
import Icon from '@/components/ui/Icon'

export default function Logo({ className = '' }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em] text-ink sm:text-lg ${className}`}>
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-brand text-white">
        <Icon name="burger" size={16} strokeWidth={2.4} />
      </span>
      ComidasCiénaga
    </Link>
  )
}
