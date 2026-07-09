import Link from 'next/link'

export default function NegocioCard({ negocio, modo = 'grid' }) {
  const primeraFoto = negocio.fotos_comida?.[0]?.url
  const tags = negocio.tags?.slice(0, 2) || []

  if (modo === 'horizontal') {
    return (
      <Link href={`/negocio/${negocio.id}`} className="flex-shrink-0 w-36 bg-white border border-[#D3D1C7] rounded-2xl overflow-hidden">
        <div className="h-20 bg-[#FAEEDA] flex items-center justify-center text-3xl relative">
          {primeraFoto
            ? <img src={primeraFoto} alt={negocio.nombre} className="w-full h-full object-cover" />
            : '🍽️'
          }
          <span className="absolute top-2 left-2 text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#27500A]">
            Abierto
          </span>
        </div>
        <div className="p-2">
          <p className="text-xs font-medium text-[#2C2C2A] truncate">{negocio.nombre}</p>
          <p className="text-[10px] text-[#888780] mb-1">{negocio.categoria?.replace('_', ' ')}</p>
          <div className="flex items-center gap-1 text-[10px] text-[#BA7517]">
            ⭐ <span className="text-[#5F5E5A]">{negocio.calificacion_promedio || '—'}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/negocio/${negocio.id}`} className="bg-white border border-[#D3D1C7] rounded-2xl overflow-hidden">
      <div className="h-24 bg-[#FAEEDA] flex items-center justify-center text-4xl relative">
        {primeraFoto
          ? <img src={primeraFoto} alt={negocio.nombre} className="w-full h-full object-cover" />
          : '🍽️'
        }
        {negocio.abierto_ahora && (
          <span className="absolute top-2 left-2 text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#27500A]">
            Abierto
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-[#2C2C2A] truncate">{negocio.nombre}</p>
        <p className="text-[10px] text-[#888780] mb-2">{negocio.categoria?.replace('_', ' ')}</p>
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span key={tag.valor} className="text-[9px] px-2 py-0.5 rounded-full bg-[#FAECE7] text-[#993C1D]">
              {tag.valor}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}