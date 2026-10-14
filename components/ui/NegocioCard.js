import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import { obtenerCategoria } from '@/lib/categorias'

export default function NegocioCard({ negocio, modo = 'grid' }) {
  const primeraFoto = negocio.fotos_comida?.[0]?.url
  const tags = negocio.tags?.slice(0, 2) || []
  const categoria = obtenerCategoria(negocio.categoria)
  const calificacion = Number(negocio.calificacion_promedio)

  if (modo === 'fila') {
    return (
      <Link href={`/negocio/${negocio.id}`} className="group flex items-center gap-3.5 rounded-[18px] border border-line bg-white p-3 transition hover:border-line-strong focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/10">
        <Foto url={primeraFoto} nombre={negocio.nombre} categoria={categoria} className="h-16 w-16 shrink-0 rounded-[14px] sm:h-[72px] sm:w-[72px]" iconSize={28} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] font-semibold sm:text-base">{negocio.nombre}</span>
            {calificacion > 0 && <Rating valor={calificacion} />}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-ink-subtle sm:text-sm">
            {categoria.corto}{tags.length > 0 && ` · ${tags.map(tag => tag.valor).join(', ')}`}
          </span>
          <span className="mt-1.5 block"><Estado abierto={negocio.abierto_ahora} pequeno /></span>
        </span>
      </Link>
    )
  }

  return (
    <Link href={`/negocio/${negocio.id}`} className="group block overflow-hidden rounded-[20px] border border-line bg-white transition hover:-translate-y-0.5 hover:border-line-strong focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/10">
      <span className="relative block">
        <Foto url={primeraFoto} nombre={negocio.nombre} categoria={categoria} className="h-44" iconSize={56} zoom />
        <span className="absolute left-3 top-3"><Estado abierto={negocio.abierto_ahora} chip /></span>
      </span>
      <span className="block p-4">
        <span className="flex items-center justify-between gap-2.5">
          <span className="truncate text-[17px] font-semibold">{negocio.nombre}</span>
          {calificacion > 0 && <Rating valor={calificacion} />}
        </span>
        <span className="mt-1 block text-sm text-ink-subtle">{categoria.label}</span>
        {tags.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-1.5">
            {tags.map(tag => <span key={tag.valor} className="flex h-[26px] items-center rounded-lg bg-chip-soft px-2.5 text-xs text-ink-muted">{tag.valor}</span>)}
          </span>
        )}
      </span>
    </Link>
  )
}

function Foto({ url, nombre, categoria, className, iconSize, zoom = false }) {
  if (url) {
    return (
      <span className={`block overflow-hidden bg-chip ${className}`}>
        <img src={url} alt={`Comida de ${nombre}`} className={`h-full w-full object-cover ${zoom ? 'transition duration-500 group-hover:scale-105' : ''}`} />
      </span>
    )
  }
  return (
    <span aria-hidden="true" className={`flex items-center justify-center ${categoria.tono} ${className}`}>
      <Icon name={categoria.icono} size={iconSize} strokeWidth={1.4} />
    </span>
  )
}

function Rating({ valor }) {
  return <span className="shrink-0 text-[13px] font-semibold sm:text-sm"><span aria-hidden="true">★</span> {valor.toFixed(1)}</span>
}

export function Estado({ abierto, chip = false, pequeno = false }) {
  const texto = abierto ? 'Abierto' : 'Cerrado'
  const punto = <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${abierto ? 'bg-ok-dot' : 'bg-ink-subtle/60'}`} />
  if (chip) {
    return <span className={`flex h-[26px] items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-semibold ${abierto ? 'text-ok' : 'text-ink-subtle'}`}>{punto}{texto}</span>
  }
  return <span className={`inline-flex items-center gap-1.5 font-semibold ${pequeno ? 'text-xs' : 'text-sm'} ${abierto ? 'text-ok' : 'text-ink-subtle'}`}>{punto}{texto}</span>
}
