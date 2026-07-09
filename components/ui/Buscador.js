'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Buscador({ valorInicial = '' }) {
  const [query, setQuery] = useState(valorInicial)
  const router = useRouter()

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888780]">
        🔍
      </span>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="¿Qué quieres comer hoy?"
        className="w-full bg-white border border-[#D3D1C7] rounded-2xl py-3 pl-10 pr-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#E8593C] transition-colors"
      />
    </form>
  )
}