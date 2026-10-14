'use client'

import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

export default function BackButton({ className = '' }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Volver a la página anterior"
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:bg-chip ${className}`}
    >
      <Icon name="arrowLeft" size={18} />
    </button>
  )
}
