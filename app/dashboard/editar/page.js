'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateMenuFile, validatePhotoFiles } from '@/lib/uploads'
import { Aviso, Cargando, PanelHeader } from '@/components/dashboard/PanelUI'
import Icon from '@/components/ui/Icon'

export default function EditarPage() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [negocio, setNegocio] = useState(null)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [fotos, setFotos] = useState([])
  const [subiendoFotos, setSubiendoFotos] = useState(false)
  const [subiendoCarta, setSubiendoCarta] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    let activo = true
    async function cargar() {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) return router.replace('/login')
      const { data, error } = await supabase.from('negocios').select('*, tags(id, valor), fotos_comida(id, url), cartas(id, url, tipo)').eq('usuario_id', authData.user.id).single()
      if (!activo) return
      if (error || !data) return router.replace('/registro')
      setNegocio(data)
      setTags(data.tags || [])
      setFotos(data.fotos_comida || [])
    }
    cargar()
    return () => { activo = false }
  }, [router, supabase])

  function avisar(tipo, texto) {
    setMensaje({ tipo, texto })
    window.setTimeout(() => setMensaje(null), 3500)
  }

  async function agregarTag(event) {
    if (event.key !== ',' && event.key !== 'Enter') return
    event.preventDefault()
    const valor = tagInput.replace(',', '').trim().toLowerCase()
    if (!valor || tags.some(tag => tag.valor === valor)) return setTagInput('')
    const { data, error } = await supabase.from('tags').insert({ negocio_id: negocio.id, valor }).select().single()
    if (error) return avisar('error', 'No pudimos agregar ese producto.')
    setTags(actuales => [...actuales, data])
    setTagInput('')
  }

  async function borrarTag(id) {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) return avisar('error', 'No pudimos eliminar el producto.')
    setTags(actuales => actuales.filter(tag => tag.id !== id))
  }

  async function subirFotos(event) {
    const archivos = Array.from(event.target.files || [])
    if (!archivos.length) return
    const validation = validatePhotoFiles(archivos, fotos.length)
    if (validation.error) {
      avisar('error', validation.error)
      event.target.value = ''
      return
    }
    setSubiendoFotos(true)
    try {
      for (const [indice, archivo] of validation.files.entries()) {
        const extension = archivo.name.split('.').pop()
        const path = `${negocio.id}/${Date.now()}-${indice}.${extension}`
        const { error: uploadError } = await supabase.storage.from('fotos-comida').upload(path, archivo)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('fotos-comida').getPublicUrl(path)
        const { data: foto, error: fotoError } = await supabase.from('fotos_comida').insert({ negocio_id: negocio.id, url: urlData.publicUrl }).select().single()
        if (fotoError) throw fotoError
        setFotos(actuales => [...actuales, foto])
      }
      avisar('success', 'Tus fotos ya aparecen en el perfil público.')
    } catch {
      avisar('error', 'No pudimos subir una o más fotos. Inténtalo de nuevo.')
    }
    setSubiendoFotos(false)
    event.target.value = ''
  }

  async function borrarFoto(foto) {
    const path = foto.url.split('fotos-comida/')[1]
    const { error: storageError } = path ? await supabase.storage.from('fotos-comida').remove([path]) : { error: null }
    if (storageError) return avisar('error', 'No pudimos eliminar la foto.')
    const { error } = await supabase.from('fotos_comida').delete().eq('id', foto.id)
    if (error) return avisar('error', 'No pudimos eliminar la foto.')
    setFotos(actuales => actuales.filter(item => item.id !== foto.id))
  }

  async function subirCarta(event) {
    const archivo = event.target.files?.[0]
    if (!archivo) return
    const validation = validateMenuFile(archivo)
    if (validation.error) {
      avisar('error', validation.error)
      event.target.value = ''
      return
    }
    setSubiendoCarta(true)
    try {
      const extension = validation.file.name.split('.').pop()
      const path = `${negocio.id}/carta-${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('cartas-menu').upload(path, validation.file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('cartas-menu').getPublicUrl(path)
      const { data: carta, error: cartaError } = await supabase.from('cartas').insert({ negocio_id: negocio.id, url: urlData.publicUrl, tipo: extension?.toLowerCase() === 'pdf' ? 'pdf' : 'foto' }).select().single()
      if (cartaError) throw cartaError
      setNegocio(actual => ({ ...actual, cartas: [...(actual.cartas || []), carta] }))
      avisar('success', 'Tu carta ya está disponible en el perfil.')
    } catch {
      avisar('error', 'No pudimos subir la carta. Inténtalo de nuevo.')
    }
    setSubiendoCarta(false)
    event.target.value = ''
  }

  async function borrarCarta(carta) {
    const path = carta.url.split('cartas-menu/')[1]
    const { error: storageError } = path ? await supabase.storage.from('cartas-menu').remove([path]) : { error: null }
    if (storageError) return avisar('error', 'No pudimos eliminar la carta.')
    const { error } = await supabase.from('cartas').delete().eq('id', carta.id)
    if (error) return avisar('error', 'No pudimos eliminar la carta.')
    setNegocio(actual => ({ ...actual, cartas: actual.cartas.filter(item => item.id !== carta.id) }))
  }

  if (!negocio) return <Cargando texto="Cargando tu editor…" />

  return (
    <>
      <PanelHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
        <p className="eyebrow">Gestiona tu vitrina</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.04em] sm:text-3xl">Productos, fotos y carta</h1>

        {mensaje && <Aviso mensaje={mensaje} />}

        <Seccion titulo="Lo que vendes" descripcion="Usa palabras que los clientes buscarían para encontrarte." icon="tag" tono="bg-brand-soft text-brand-dark">
          <label htmlFor="nuevo-tag" className="sr-only">Nuevo producto</label>
          <input id="nuevo-tag" value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={agregarTag} placeholder="Hamburguesa, sancocho, jugo de corozo" className="input mt-5" />
          <p className="mt-2 text-xs text-ink-subtle">Presiona Enter o coma para agregar un producto.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.length ? tags.map(tag => (
              <span key={tag.id} className="flex h-9 items-center gap-1.5 rounded-full bg-chip pl-3.5 pr-1.5 text-sm font-medium">
                {tag.valor}
                <button type="button" onClick={() => borrarTag(tag.id)} aria-label={`Eliminar ${tag.valor}`} className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted transition hover:bg-line hover:text-ink"><Icon name="x" size={14} /></button>
              </span>
            )) : <p className="text-sm text-ink-subtle">Aún no agregas productos.</p>}
          </div>
        </Seccion>

        <Seccion titulo="Fotos de tu comida" descripcion="La primera foto es la que aparece en tu tarjeta y en tu perfil." icon="camera" tono="bg-mango-soft text-mango">
          {fotos.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fotos.map((foto, indice) => (
                <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-chip">
                  <img src={foto.url} alt={`Foto ${indice + 1} de ${negocio.nombre}`} className="h-full w-full object-cover" />
                  {indice === 0 && <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">Principal</span>}
                  <button type="button" onClick={() => borrarFoto(foto)} className="absolute right-2 top-2 h-9 rounded-lg bg-black/65 px-3 text-xs font-semibold text-white opacity-100 transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100">Eliminar</button>
                </div>
              ))}
            </div>
          )}
          <Upload label={subiendoFotos ? 'Subiendo fotos…' : 'Agregar fotos'} detail="JPG, PNG o WebP, hasta 5 MB cada una." accept="image/jpeg,image/png,image/webp" multiple onChange={subirFotos} disabled={subiendoFotos} />
        </Seccion>

        <Seccion titulo="Carta del menú" descripcion="Sube una foto o PDF para que los clientes consulten los precios." icon="menu" tono="bg-teal-soft text-teal">
          {negocio.cartas?.length > 0 && (
            <div className="mt-5 space-y-2">
              {negocio.cartas.map((carta, indice) => (
                <div key={carta.id} className="flex items-center justify-between gap-3 rounded-2xl bg-chip-soft p-3.5">
                  <a href={carta.url} target="_blank" rel="noopener noreferrer" className="min-w-0 text-sm font-semibold hover:underline">{carta.tipo === 'pdf' ? 'Ver menú en PDF' : `Ver carta ${indice + 1}`}</a>
                  <button type="button" onClick={() => borrarCarta(carta)} className="h-9 shrink-0 rounded-lg px-3 text-xs font-semibold text-danger transition hover:bg-danger-soft">Eliminar</button>
                </div>
              ))}
            </div>
          )}
          <Upload label={subiendoCarta ? 'Subiendo carta…' : 'Subir carta'} detail="Imagen o PDF, hasta 10 MB." accept="image/jpeg,image/png,image/webp,.pdf" onChange={subirCarta} disabled={subiendoCarta} />
        </Seccion>

        <Link href="/dashboard" className="btn-dark mt-8 w-full">Listo, volver a mi panel</Link>
      </main>
    </>
  )
}

function Seccion({ titulo, descripcion, icon, tono, children }) {
  return (
    <section className="card mt-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em]">{titulo}</h2>
          <p className="mt-1 text-sm text-ink-subtle">{descripcion}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tono}`}><Icon name={icon} /></span>
      </div>
      {children}
    </section>
  )
}

function Upload({ label, detail, accept, multiple, onChange, disabled }) {
  return (
    <label className={`mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-line-strong bg-paper p-4 transition hover:border-ink ${disabled ? 'cursor-wait opacity-70' : ''}`}>
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink"><Icon name="plus" /></span>
        <span><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs text-ink-subtle">{detail}</span></span>
      </span>
      <span className="hidden h-9 items-center rounded-lg bg-white px-3 text-xs font-semibold ring-1 ring-line-strong sm:flex">Elegir archivo</span>
      <input type="file" accept={accept} multiple={multiple} className="sr-only" disabled={disabled} onChange={onChange} />
    </label>
  )
}
