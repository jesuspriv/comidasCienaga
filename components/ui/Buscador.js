'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Icon from '@/components/ui/Icon'

// `hero`: versión redonda, más alta y con sombra, para ir sobre la foto de la portada.
export default function Buscador({ valorInicial = '', compacto = false, hero = false }) {
  const [query, setQuery] = useState(valorInicial)
  const router = useRouter()

  function handleSubmit(event) {
    event.preventDefault()
    router.push(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : '/buscar')
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <label htmlFor="buscador-principal" className="sr-only">Busca una comida o un negocio</label>
      <div className={hero
        ? 'flex h-[58px] items-center gap-2 rounded-full bg-white pl-5 pr-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.3)] transition focus-within:ring-4 focus-within:ring-fuego/30 sm:h-16 sm:pl-[22px] sm:pr-2'
        : `flex items-center gap-2 rounded-2xl border border-line-strong bg-white pl-4 pr-1.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10 ${compacto ? 'h-12' : 'h-[52px] sm:h-[60px] sm:pl-[18px]'}`}>
        <Icon name="search" className="shrink-0 text-ink-subtle" />
        <input
          id="buscador-principal"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Un plato o el nombre de un negocio…"
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle/80"
        />
        <button type="submit" aria-label="Buscar" className={hero
          ? 'flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-fuego font-bold text-white transition hover:bg-brand sm:h-[50px] sm:w-auto sm:px-[26px] sm:text-base'
          : `flex shrink-0 items-center justify-center rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-dark ${compacto ? 'h-9 w-9' : 'h-10 w-10 sm:h-12 sm:w-auto sm:px-[22px]'}`}>
          <span className={compacto ? 'hidden' : 'hidden sm:inline'}>Buscar</span>
          <span className={compacto ? '' : 'sm:hidden'}><Icon name="arrowRight" size={18} strokeWidth={2.2} /></span>
        </button>
      </div>
    </form>
  )
}
