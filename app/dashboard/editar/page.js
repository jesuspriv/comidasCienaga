'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [negocio, setNegocio] = useState(null)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [fotos, setFotos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [subiendoCarta, setSubiendoCarta] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('negocios')
        .select(`*, tags(id, valor), fotos_comida(id, url), cartas(id, url, tipo)`)
        .eq('usuario_id', user.id)
        .single()

      if (!data) return router.push('/registro')
      setNegocio(data)
      setTags(data.tags || [])
      setFotos(data.fotos_comida || [])
    }
    cargar()
  }, [])

  // ── Tags ──────────────────────────────────────────────────

  async function agregarTag(e) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      const nuevo = tagInput.replace(',', '').trim().toLowerCase()
      if (!nuevo) return
      if (tags.find(t => t.valor === nuevo)) {
        setTagInput('')
        return
      }
      const { data, error } = await supabase
        .from('tags')
        .insert({ negocio_id: negocio.id, valor: nuevo })
        .select()
        .single()
      if (!error) {
        setTags(prev => [...prev, data])
        setTagInput('')
      }
    }
  }

  async function borrarTag(tagId) {
    await supabase.from('tags').delete().eq('id', tagId)
    setTags(prev => prev.filter(t => t.id !== tagId))
  }

  // ── Fotos ─────────────────────────────────────────────────

  async function subirFotos(e) {
    const archivos = Array.from(e.target.files)
    if (!archivos.length) return
    setSubiendo(true)

    for (const archivo of archivos) {
      const ext  = archivo.name.split('.').pop()
      const path = `${negocio.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('fotos-comida')
        .upload(path, archivo)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('fotos-comida')
          .getPublicUrl(path)

        const { data: foto } = await supabase
          .from('fotos_comida')
          .insert({ negocio_id: negocio.id, url: urlData.publicUrl })
          .select()
          .single()

        if (foto) setFotos(prev => [...prev, foto])
      }
    }
    setSubiendo(false)
    setMensaje('¡Fotos subidas!')
    setTimeout(() => setMensaje(''), 3000)
  }

  async function borrarFoto(fotoId, url) {
    // Borrar de Storage
    const path = url.split('fotos-comida/')[1]
    await supabase.storage.from('fotos-comida').remove([path])
    // Borrar de la tabla
    await supabase.from('fotos_comida').delete().eq('id', fotoId)
    setFotos(prev => prev.filter(f => f.id !== fotoId))
  }
//subir carta
  async function subirCarta(e) {
  const archivo = e.target.files[0]
  if (!archivo) return
  setSubiendoCarta(true)

  const ext  = archivo.name.split('.').pop()
  const path = `${negocio.id}/carta_${Date.now()}.${ext}`
  const tipo = ext === 'pdf' ? 'pdf' : 'foto'

  const { error: uploadError } = await supabase.storage
    .from('cartas-menu')
    .upload(path, archivo)

  if (!uploadError) {
    const { data: urlData } = supabase.storage
      .from('cartas-menu')
      .getPublicUrl(path)

    const { data: carta } = await supabase
      .from('cartas')
      .insert({ negocio_id: negocio.id, url: urlData.publicUrl, tipo })
      .select()
      .single()

    if (carta) {
      setNegocio(prev => ({ ...prev, cartas: [...(prev.cartas || []), carta] }))
      setMensaje('¡Carta subida!')
      setTimeout(() => setMensaje(''), 3000)
    }
  }
  setSubiendoCarta(false)
}

async function borrarCarta(carta) {
  const path = carta.url.split('cartas-menu/')[1]
  await supabase.storage.from('cartas-menu').remove([path])
  await supabase.from('cartas').delete().eq('id', carta.id)
  setNegocio(prev => ({ ...prev, cartas: prev.cartas.filter(c => c.id !== carta.id) }))
}




  if (!negocio) return (
    <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <p className="text-sm text-[#888780]">Cargando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#FAFAF8] pb-10">

      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-[#5F5E5A] text-sm">
          ← Volver
        </button>
        <h1 className="text-lg font-semibold text-[#2C2C2A]">Editar productos y fotos</h1>
      </header>

      <div className="px-4">

        {/* Tags */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-[#2C2C2A] mb-1">Lo que vendes</p>
          <p className="text-xs text-[#888780] mb-3">Escribe un producto y presiona coma o Enter para agregarlo</p>

          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={agregarTag}
            placeholder="Ej: hamburguesa, sancocho, jugo..."
            className="w-full bg-[#FAFAF8] border border-[#E8593C] rounded-xl py-3 px-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none mb-3"
          />

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag.id} className="flex items-center gap-1 bg-[#FAECE7] text-[#993C1D] text-xs px-3 py-1 rounded-full">
                  {tag.valor}
                  <button
                    onClick={() => borrarTag(tag.id)}
                    className="text-[#993C1D] font-bold ml-1 hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#B4B2A9]">Aún no tienes productos agregados</p>
          )}
        </div>

        {/* Fotos */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-[#2C2C2A] mb-1">Fotos de tu comida</p>
          <p className="text-xs text-[#888780] mb-3">Estas fotos aparecen en tu perfil público</p>

          {/* Grid de fotos */}
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {fotos.map(foto => (
                <div key={foto.id} className="relative h-24 rounded-xl overflow-hidden bg-[#F1EFE8]">
                  <img src={foto.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => borrarFoto(foto.id, foto.url)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subir fotos */}
          <label className="block w-full bg-[#FAFAF8] border border-dashed border-[#D3D1C7] rounded-xl p-4 text-center cursor-pointer hover:border-[#E8593C] transition-colors">
            <span className="text-2xl block mb-1">{subiendo ? '⏳' : '📷'}</span>
            <span className="text-sm text-[#5F5E5A]">
              {subiendo ? 'Subiendo fotos...' : 'Agregar fotos'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={subirFotos}
              disabled={subiendo}
            />
          </label>
        </div>

        {mensaje && (
          <p className="text-center text-sm text-green-600 mb-4">{mensaje}</p>
        )}



                {/* Carta del menú */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-[#2C2C2A] mb-1">Carta del menú</p>
          <p className="text-xs text-[#888780] mb-3">Sube una foto o PDF de tu carta</p>

          {/* Carta actual */}
          {negocio.cartas?.length > 0 && (
            <div className="mb-3">
              {negocio.cartas.map((carta, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F1EFE8] rounded-xl px-4 py-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span>{carta.tipo === 'pdf' ? '📄' : '🖼️'}</span>
                    <a
                      href={carta.url}
                      target="_blank"
                      className="text-sm text-[#E8593C] underline"
                    >
                      Ver carta actual
                    </a>
                  </div>
                  <button
                    onClick={() => borrarCarta(carta)}
                    className="text-xs text-[#888780] hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subir nueva carta */}
          <label className="block w-full bg-[#FAFAF8] border border-dashed border-[#D3D1C7] rounded-xl p-4 text-center cursor-pointer hover:border-[#E8593C] transition-colors">
            <span className="text-2xl block mb-1">{subiendoCarta ? '⏳' : '📄'}</span>
            <span className="text-sm text-[#5F5E5A]">
              {subiendoCarta ? 'Subiendo carta...' : 'Subir foto o PDF de la carta'}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={subirCarta}
              disabled={subiendoCarta}
            />
          </label>
        </div>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-[#E8593C] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#D14E34] transition-colors"
        >
          Listo
        </button>

      </div>
    </main>
  )
}