'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Icon from '@/components/ui/Icon'

export default function Buscador({ valorInicial = '', compacto = false }) {
  const [query, setQuery] = useState(valorInicial)
  const router = useRouter()

  function handleSubmit(event) {
    event.preventDefault()
    if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <label htmlFor="buscador-principal" className="sr-only">Busca una comida o un negocio</label>
      <div className={`flex items-center gap-2 rounded-2xl border border-line-strong bg-white pl-4 pr-1.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10 ${compacto ? 'h-12' : 'h-[52px] sm:h-[60px] sm:pl-[18px]'}`}>
        <Icon name="search" className="shrink-0 text-ink-subtle" />
        <input
          id="buscador-principal"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Hamburguesa, sancocho, jugo de corozo…"
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle/80"
        />
        <button type="submit" aria-label="Buscar" className={`flex shrink-0 items-center justify-center rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-dark ${compacto ? 'h-9 w-9' : 'h-10 w-10 sm:h-12 sm:w-auto sm:px-[22px]'}`}>
          <span className={compacto ? 'hidden' : 'hidden sm:inline'}>Buscar</span>
          <span className={compacto ? '' : 'sm:hidden'}><Icon name="arrowRight" size={18} strokeWidth={2.2} /></span>
        </button>
      </div>
    </form>
  )
}
