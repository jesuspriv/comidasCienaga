'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIAS = [
  { valor: 'comida_rapida', emoji: '🍔', label: 'Comida rápida' },
  { valor: 'bebidas',       emoji: '🥤', label: 'Bebidas y café' },
  { valor: 'postres',       emoji: '🍓', label: 'Dulces y postres' },
  { valor: 'tipica',        emoji: '🍲', label: 'Comida típica' },
  { valor: 'parrilla',      emoji: '🥩', label: 'Parrilla' },
  { valor: 'otros',         emoji: '📦', label: 'Otros' },
]

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Paso 1 - cuenta
    nombre:     '',
    email:      '',
    password:   '',
    whatsapp:   '',
    // Paso 2 - negocio
    nombreNegocio: '',
    categoria:     '',
    direccion:     '',
    whatsappNegocio: '',
    horario:       '',
    // Paso 3 - productos
    tagsInput:  '',
    tags:       [],
    cartaFile:  null,
    fotosFiles: [],
  })

  function actualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  function agregarTag(e) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      const nuevo = form.tagsInput.replace(',', '').trim().toLowerCase()
      if (nuevo && !form.tags.includes(nuevo)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, nuevo], tagsInput: '' }))
      } else {
        setForm(prev => ({ ...prev, tagsInput: '' }))
      }
    }
  }

  function quitarTag(tag) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  async function handleSubmit() {
    setCargando(true)
    setError('')
    try {
      // 1. Crear cuenta en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    })
    if (authError) throw authError

    // Iniciar sesión inmediatamente después del registro
    const { error: loginError } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
    })
    if (loginError) throw loginError

    const userId = authData.user.id

      // 2. Crear perfil en tabla usuarios
      const { error: userError } = await supabase.from('usuarios').insert({
        id: userId,
        nombre: form.nombre,
        whatsapp: form.whatsapp,
      })
      if (userError) throw userError

      // 3. Crear el negocio
      const { data: negocio, error: negocioError } = await supabase
        .from('negocios')
        .insert({
          usuario_id:   userId,
          nombre:       form.nombreNegocio,
          categoria:    form.categoria,
          direccion:    form.direccion,
          whatsapp:     form.whatsappNegocio,
          horario:      form.horario,
        })
        .select()
        .single()
      if (negocioError) throw negocioError

      const negocioId = negocio.id

      // 4. Insertar tags
      if (form.tags.length > 0) {
        const tagsData = form.tags.map(valor => ({ negocio_id: negocioId, valor }))
        await supabase.from('tags').insert(tagsData)
      }

      // 5. Subir fotos de comida
      for (const foto of form.fotosFiles) {
        const ext  = foto.name.split('.').pop()
        const path = `${negocioId}/${Date.now()}.${ext}`
        const { data: uploaded } = await supabase.storage
          .from('fotos-comida')
          .upload(path, foto)
        if (uploaded) {
          const { data: urlData } = supabase.storage
            .from('fotos-comida')
            .getPublicUrl(path)
          await supabase.from('fotos_comida').insert({
            negocio_id: negocioId,
            url: urlData.publicUrl,
          })
        }
      }

      // 6. Subir carta
      if (form.cartaFile) {
        const ext  = form.cartaFile.name.split('.').pop()
        const path = `${negocioId}/carta.${ext}`
        const tipo = ext === 'pdf' ? 'pdf' : 'foto'
        const { data: uploaded } = await supabase.storage
          .from('cartas-menu')
          .upload(path, form.cartaFile)
        if (uploaded) {
          const { data: urlData } = supabase.storage
            .from('cartas-menu')
            .getPublicUrl(path)
          await supabase.from('cartas').insert({
            negocio_id: negocioId,
            url: urlData.publicUrl,
            tipo,
          })
        }
      }

      router.push(`/negocio/${negocioId}?nuevo=true`)
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] pb-10">

      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <a href="/" className="text-[#5F5E5A] text-sm">← Volver</a>
        <span className="text-sm text-[#888780]">Paso {paso} de 4</span>
      </header>

      {/* Barra de progreso */}
      <div className="px-4 mb-6">
        <div className="h-1.5 bg-[#E8E6E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8593C] rounded-full transition-all duration-300"
            style={{ width: `${(paso / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {[1,2,3,4].map(n => (
            <div key={n} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${n < paso ? 'bg-[#E8593C] text-white' : n === paso ? 'bg-[#E8593C] text-white ring-4 ring-[#FAECE7]' : 'bg-[#E8E6E0] text-[#888780]'}`}>
              {n < paso ? '✓' : n}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">

        {/* ── PASO 1: Cuenta ── */}
        {paso === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-[#2C2C2A] mb-1">Crea tu cuenta</h2>
            <p className="text-sm text-[#888780] mb-6">Gratis, sin tarjeta de crédito</p>
            <Campo label="Nombre completo" value={form.nombre} onChange={v => actualizar('nombre', v)} placeholder="Tu nombre" />
            <Campo label="Correo electrónico" value={form.email} onChange={v => actualizar('email', v)} placeholder="tu@correo.com" type="email" />
            <Campo label="Contraseña" value={form.password} onChange={v => actualizar('password', v)} placeholder="Mínimo 6 caracteres" type="password" />
            <Campo label="Tu WhatsApp" value={form.whatsapp} onChange={v => actualizar('whatsapp', v)} placeholder="+57 300 000 0000" hint="Este número será tu contacto principal" />
            <Boton onClick={() => {
              if (!form.nombre || !form.email || !form.password || !form.whatsapp) return setError('Completa todos los campos')
              setError(''); setPaso(2)
            }}>Continuar →</Boton>
            <p className="text-center text-sm text-[#888780] mt-4">
              ¿Ya tienes cuenta? <a href="/login" className="text-[#E8593C]">Inicia sesión</a>
            </p>
          </div>
        )}

        {/* ── PASO 2: Info del negocio ── */}
        {paso === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-[#2C2C2A] mb-1">Tu negocio</h2>
            <p className="text-sm text-[#888780] mb-6">Cuéntanos sobre tu local</p>
            <Campo label="Nombre del local" value={form.nombreNegocio} onChange={v => actualizar('nombreNegocio', v)} placeholder="Ej: Donde Marta" />
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#5F5E5A] mb-2">Categoría principal</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIAS.map(cat => (
                  <button key={cat.valor} type="button"
                    onClick={() => actualizar('categoria', cat.valor)}
                    className={`py-2.5 px-3 rounded-xl text-sm border transition-colors text-left
                      ${form.categoria === cat.valor
                        ? 'bg-[#FAECE7] border-[#E8593C] text-[#993C1D] font-medium'
                        : 'bg-white border-[#D3D1C7] text-[#5F5E5A]'}`}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <Campo label="Dirección o punto de referencia" value={form.direccion} onChange={v => actualizar('direccion', v)} placeholder="Ej: Cra 5 con Calle 18, frente al parque" />
            <Campo label="WhatsApp del negocio" value={form.whatsappNegocio} onChange={v => actualizar('whatsappNegocio', v)} placeholder="+57 300 000 0000" />
            <Campo label="Horario de atención" value={form.horario} onChange={v => actualizar('horario', v)} placeholder="Ej: Lun-Sáb 10am-9pm" />
            <div className="flex gap-3">
              <Boton secundario onClick={() => setPaso(1)}>← Atrás</Boton>
              <Boton onClick={() => {
                if (!form.nombreNegocio || !form.categoria) return setError('Pon el nombre y categoría del negocio')
                setError(''); setPaso(3)
              }}>Continuar →</Boton>
            </div>
          </div>
        )}

        {/* ── PASO 3: Lo que vendes ── */}
        {paso === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-[#2C2C2A] mb-1">Lo que vendes</h2>
            <p className="text-sm text-[#888780] mb-6">Esto es lo que los clientes van a buscar para encontrarte</p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#5F5E5A] mb-1">¿Qué vendes?</label>
              <input
                type="text"
                value={form.tagsInput}
                onChange={e => actualizar('tagsInput', e.target.value)}
                onKeyDown={agregarTag}
                placeholder="Escribe un producto y presiona coma o Enter"
                className="w-full bg-white border border-[#E8593C] rounded-xl py-3 px-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none"
              />
              <p className="text-xs text-[#888780] mt-1">Ej: hamburguesa, salchipapa, jugo de corozo</p>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-[#FAECE7] text-[#993C1D] text-xs px-3 py-1 rounded-full">
                      {tag}
                      <button type="button" onClick={() => quitarTag(tag)} className="text-[#993C1D] font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#5F5E5A] mb-1">
                Fotos de tu comida <span className="text-[#B4B2A9] font-normal">(opcional)</span>
              </label>
              <label className="block w-full bg-white border border-dashed border-[#D3D1C7] rounded-xl p-4 text-center cursor-pointer hover:border-[#E8593C] transition-colors">
                <span className="text-2xl block mb-1">📷</span>
                <span className="text-sm text-[#5F5E5A]">
                  {form.fotosFiles.length > 0 ? `${form.fotosFiles.length} foto(s) seleccionada(s)` : 'Subir fotos de tu comida'}
                </span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={e => actualizar('fotosFiles', Array.from(e.target.files))} />
              </label>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-[#5F5E5A] mb-1">
                Carta del menú <span className="text-[#B4B2A9] font-normal">(opcional)</span>
              </label>
              <label className="block w-full bg-white border border-dashed border-[#D3D1C7] rounded-xl p-4 text-center cursor-pointer hover:border-[#E8593C] transition-colors">
                <span className="text-2xl block mb-1">📄</span>
                <span className="text-sm text-[#5F5E5A]">
                  {form.cartaFile ? form.cartaFile.name : 'Subir foto o PDF de tu carta'}
                </span>
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => actualizar('cartaFile', e.target.files[0])} />
              </label>
              <p className="text-xs text-[#888780] mt-1 text-center">
                <button type="button" onClick={() => setPaso(4)} className="underline">Completar esto después</button>
              </p>
            </div>

            <div className="flex gap-3">
              <Boton secundario onClick={() => setPaso(2)}>← Atrás</Boton>
              <Boton onClick={() => {
                if (form.tags.length === 0) return setError('Agrega al menos un producto')
                setError(''); setPaso(4)
              }}>Continuar →</Boton>
            </div>
          </div>
        )}

        {/* ── PASO 4: Confirmación ── */}
        {paso === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-[#2C2C2A] mb-1">Confirma tu negocio</h2>
            <p className="text-sm text-[#888780] mb-4">Así va a aparecer en la plataforma</p>

            <div className="bg-white border border-[#D3D1C7] rounded-2xl overflow-hidden mb-6">
              <div className="h-24 bg-[#FAEEDA] flex items-center justify-center text-5xl">🍽️</div>
              <div className="p-4">
                <p className="font-semibold text-[#2C2C2A] text-base">{form.nombreNegocio}</p>
                <p className="text-sm text-[#888780] mb-3">{CATEGORIAS.find(c => c.valor === form.categoria)?.emoji} {CATEGORIAS.find(c => c.valor === form.categoria)?.label} · Ciénaga</p>
                {form.horario && <p className="text-sm text-[#5F5E5A] mb-1">🕐 {form.horario}</p>}
                {form.direccion && <p className="text-sm text-[#5F5E5A] mb-3">📍 {form.direccion}</p>}
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[#FAECE7] text-[#993C1D]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

            <Boton onClick={handleSubmit} disabled={cargando}>
              {cargando ? 'Publicando...' : '¡Publicar mi negocio! 🎉'}
            </Boton>
            <Boton secundario onClick={() => setPaso(3)}>← Editar</Boton>
          </div>
        )}

        {error && paso !== 4 && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}
      </div>
    </main>
  )
}

// ── Componentes reutilizables del formulario ──────────────────

function Campo({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-[#5F5E5A] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#D3D1C7] rounded-xl py-3 px-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#E8593C] transition-colors"
      />
      {hint && <p className="text-xs text-[#888780] mt-1">{hint}</p>}
    </div>
  )
}

function Boton({ children, onClick, secundario, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-xl text-sm font-medium mb-2 transition-colors
        ${secundario
          ? 'bg-white border border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F5F4F0]'
          : 'bg-[#E8593C] text-white hover:bg-[#D14E34] disabled:opacity-60'}`}>
      {children}
    </button>
  )
}