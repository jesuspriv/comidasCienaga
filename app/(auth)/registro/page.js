'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateMenuFile, validatePhotoFiles } from '@/lib/uploads'
import { CATEGORIAS, obtenerCategoria } from '@/lib/categorias'
import { horarioInicial, resumenHorario, tieneHorario, validarHorario } from '@/lib/horario'
import EditorHorario from '@/components/forms/EditorHorario'
import { POLITICA_VERSION } from '@/lib/sitio'
import Logo from '@/components/ui/Logo'
import Icon from '@/components/ui/Icon'

const PASOS = ['Cuenta', 'Negocio', 'Productos', 'Publicar']

// Traduce los errores de Supabase más comunes del registro a mensajes claros.
function mensajeDeError(err) {
  const texto = String(err?.message || '').toLowerCase()
  if (texto.includes('already registered') || texto.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Ingresa con tu contraseña y desde ahí podrás publicar tu negocio.'
  if (texto.includes('email not confirmed')) return 'Te enviamos un correo para confirmar tu cuenta. Confírmalo, ingresa y termina de publicar tu negocio.'
  if (texto.includes('invalid') && texto.includes('email')) return 'Ese correo no parece válido. Revísalo e inténtalo de nuevo.'
  if (texto.includes('password')) return 'La contraseña no es válida. Usa al menos 6 caracteres.'
  if (texto.includes('rate limit') || texto.includes('too many')) return 'Hubo demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.'
  if (texto.includes('duplicate key') && texto.includes('negocios')) return 'Tu cuenta ya tiene un negocio publicado. Ingresa a tu panel para editarlo.'
  return 'Ocurrió un error al publicar. Inténtalo de nuevo en unos minutos.'
}

export default function RegistroPage() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  // Si ya hay sesión (cuenta creada pero sin negocio), no se vuelve a crear la cuenta:
  // { userId, email, tienePerfil }. `verificando` evita mostrar el paso 1 antes de saberlo.
  const [cuenta, setCuenta] = useState(null)
  const [verificando, setVerificando] = useState(true)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', whatsapp: '', nombreNegocio: '', categoria: '', direccion: '', whatsappNegocio: '', horarios: horarioInicial(), tagsInput: '', tags: [], cartaFile: null, fotosFiles: [], aceptaPrivacidad: false })

  useEffect(() => {
    let activo = true
    async function revisarSesion() {
      const { data } = await supabase.auth.getUser()
      const usuario = data?.user
      if (!usuario) return activo && setVerificando(false)
      const [{ data: negocio }, { data: perfil }] = await Promise.all([
        supabase.from('negocios').select('id').eq('usuario_id', usuario.id).maybeSingle(),
        supabase.from('usuarios').select('nombre, whatsapp').eq('id', usuario.id).maybeSingle(),
      ])
      if (!activo) return
      if (negocio) return router.replace('/dashboard')
      setCuenta({ userId: usuario.id, email: usuario.email, tienePerfil: Boolean(perfil) })
      if (perfil) {
        setForm(actual => ({ ...actual, nombre: perfil.nombre, whatsapp: perfil.whatsapp || '', whatsappNegocio: perfil.whatsapp || '' }))
        setPaso(2)
      }
      setVerificando(false)
    }
    revisarSesion()
    return () => { activo = false }
  }, [router, supabase])

  function actualizar(campo, valor) { setForm(actual => ({ ...actual, [campo]: valor })) }
  function siguiente(nuevoPaso) { setError(''); setPaso(nuevoPaso) }
  function validarPasoUno() {
    if (cuenta) {
      if (!form.nombre || !form.whatsapp) return setError('Completa tu nombre y tu WhatsApp para continuar.')
      return siguiente(2)
    }
    if (!form.nombre || !form.email || !form.password || !form.whatsapp) return setError('Completa todos los campos para continuar.')
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    siguiente(2)
  }
  function validarPasoDos() {
    if (!form.nombreNegocio || !form.categoria || !form.whatsappNegocio) return setError('Completa el nombre, categoría y WhatsApp de tu negocio.')
    const errorHorario = validarHorario(form.horarios)
    if (errorHorario) return setError(errorHorario)
    siguiente(3)
  }
  function agregarTag(event) {
    if (event.key !== ',' && event.key !== 'Enter') return
    event.preventDefault()
    const tag = form.tagsInput.replace(',', '').trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) actualizar('tags', [...form.tags, tag])
    actualizar('tagsInput', '')
  }
  function quitarTag(tag) { actualizar('tags', form.tags.filter(item => item !== tag)) }

  async function handleSubmit() {
    const photosValidation = validatePhotoFiles(form.fotosFiles)
    const menuValidation = validateMenuFile(form.cartaFile)
    if (photosValidation.error || menuValidation.error) {
      setError(photosValidation.error || menuValidation.error)
      return
    }
    if (!form.aceptaPrivacidad) return setError('Para publicar tu negocio debes aceptar la política de tratamiento de datos.')
    setCargando(true); setError('')
    // Prueba de la autorización (Ley 1581): fecha y versión de la política, guardadas en la cuenta.
    const autorizacion = { privacidad_aceptada_en: new Date().toISOString(), privacidad_version: POLITICA_VERSION }
    try {
      let userId = cuenta?.userId
      if (cuenta) {
        const { error: autorizacionError } = await supabase.auth.updateUser({ data: autorizacion })
        if (autorizacionError) throw autorizacionError
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: autorizacion } })
        if (authError || !authData.user) throw authError || new Error('No pudimos crear tu cuenta.')
        const { error: loginError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (loginError) throw loginError
        userId = authData.user.id
      }
      if (!cuenta?.tienePerfil) {
        const { error: userError } = await supabase.from('usuarios').insert({ id: userId, nombre: form.nombre, whatsapp: form.whatsapp })
        if (userError) throw userError
        // Si algo falla más adelante y la persona reintenta, no se vuelve a crear el perfil.
        setCuenta(actual => ({ userId, email: actual?.email || form.email, tienePerfil: true }))
      }
      const { data: negocio, error: negocioError } = await supabase.from('negocios').insert({ usuario_id: userId, nombre: form.nombreNegocio, categoria: form.categoria, direccion: form.direccion, whatsapp: form.whatsappNegocio, horarios: form.horarios, horario: resumenHorario(form.horarios) }).select().single()
      if (negocioError) throw negocioError
      if (form.tags.length) {
        const { error: tagsError } = await supabase.from('tags').insert(form.tags.map(valor => ({ negocio_id: negocio.id, valor })))
        if (tagsError) throw tagsError
      }
      for (const [indice, foto] of form.fotosFiles.entries()) {
        const extension = foto.name.split('.').pop()
        const path = `${negocio.id}/${Date.now()}-${indice}.${extension}`
        const { error: uploadError } = await supabase.storage.from('fotos-comida').upload(path, foto)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('fotos-comida').getPublicUrl(path)
        const { error: fotoError } = await supabase.from('fotos_comida').insert({ negocio_id: negocio.id, url: urlData.publicUrl })
        if (fotoError) throw fotoError
      }
      if (form.cartaFile) {
        const extension = form.cartaFile.name.split('.').pop()
        const path = `${negocio.id}/carta-${Date.now()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('cartas-menu').upload(path, form.cartaFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('cartas-menu').getPublicUrl(path)
        const { error: cartaError } = await supabase.from('cartas').insert({ negocio_id: negocio.id, url: urlData.publicUrl, tipo: extension?.toLowerCase() === 'pdf' ? 'pdf' : 'foto' })
        if (cartaError) throw cartaError
      }
      router.push(`/negocio/${negocio.id}?nuevo=true`)
    } catch (err) {
      setError(mensajeDeError(err))
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <Logo />
          <span className="text-sm font-medium text-ink-subtle">Paso {paso} de {PASOS.length}</span>
        </header>
        <Stepper paso={paso} />
        {cuenta && (
          <p className="mb-4 flex items-start gap-2.5 rounded-2xl bg-ok-soft px-4 py-3 text-sm text-ok">
            <Icon name="check" size={18} className="mt-px shrink-0" />
            <span>Ya ingresaste como <span className="font-semibold">{cuenta.email}</span>. Solo falta publicar tu negocio.</span>
          </p>
        )}
        <div className="card p-5 sm:p-8">
          {verificando && <div className="flex justify-center py-10"><span className="block h-8 w-8 animate-spin rounded-full border-4 border-line border-t-brand" /></div>}
          {!verificando && paso === 1 && <Cuenta form={form} actualizar={actualizar} mostrarPassword={mostrarPassword} setMostrarPassword={setMostrarPassword} onNext={validarPasoUno} soloPerfil={Boolean(cuenta)} />}
          {!verificando && paso === 2 && <Negocio form={form} actualizar={actualizar} onBack={cuenta?.tienePerfil ? null : () => siguiente(1)} onNext={validarPasoDos} />}
          {paso === 3 && <Productos form={form} actualizar={actualizar} agregarTag={agregarTag} quitarTag={quitarTag} onBack={() => siguiente(2)} onNext={() => { if (!form.tags.length) return setError('Agrega al menos un producto para que te puedan encontrar.'); siguiente(4) }} onSkip={() => siguiente(4)} />}
          {paso === 4 && <Confirmacion form={form} actualizar={actualizar} onBack={() => siguiente(3)} onSubmit={handleSubmit} cargando={cargando} />}
          {error && <p role="alert" className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        </div>
        {paso === 1 && !cuenta && !verificando && <p className="mt-6 text-center text-sm text-ink-muted">¿Ya tienes un perfil? <Link href="/login" className="font-semibold text-brand-dark hover:underline">Ingresa aquí</Link></p>}
      </div>
    </main>
  )
}

function Encabezado({ eyebrow, titulo, intro }) {
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.04em] sm:text-3xl">{titulo}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{intro}</p>
    </>
  )
}

// `soloPerfil`: la cuenta ya existe (hay sesión), así que solo se piden nombre y WhatsApp.
function Cuenta({ form, actualizar, mostrarPassword, setMostrarPassword, onNext, soloPerfil }) {
  return (
    <section>
      <Encabezado eyebrow="Tu cuenta" titulo={soloPerfil ? 'Completa tus datos' : 'Empecemos con lo básico'} intro={soloPerfil ? 'Necesitamos tu nombre y tu WhatsApp para administrar tu perfil.' : 'Tu cuenta te permitirá actualizar tu negocio cuando quieras.'} />
      <div className="mt-7">
        <Field id="nombre" label="Nombre completo" value={form.nombre} onChange={valor => actualizar('nombre', valor)} placeholder="Tu nombre" autoComplete="name" />
        {!soloPerfil && <Field id="email" label="Correo electrónico" type="email" value={form.email} onChange={valor => actualizar('email', valor)} placeholder="tu@correo.com" autoComplete="email" />}
        {!soloPerfil && <div className="mb-5">
          <label htmlFor="password" className="label">Contraseña</label>
          <div className="relative">
            <input id="password" type={mostrarPassword ? 'text' : 'password'} value={form.password} onChange={event => actualizar('password', event.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" className="input pr-20" />
            <button type="button" onClick={() => setMostrarPassword(valor => !valor)} className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-semibold text-ink-muted transition hover:bg-chip hover:text-ink">{mostrarPassword ? 'Ocultar' : 'Ver'}</button>
          </div>
        </div>}
        <Field id="whatsapp" label="Tu WhatsApp" value={form.whatsapp} onChange={valor => actualizar('whatsapp', valor)} placeholder="+57 300 000 0000" hint="Solo lo usaremos para administrar tu perfil." autoComplete="tel" />
      </div>
      <button type="button" onClick={onNext} className="btn-primary w-full">Continuar</button>
    </section>
  )
}

function Negocio({ form, actualizar, onBack, onNext }) {
  return (
    <section>
      <Encabezado eyebrow="Tu negocio" titulo="Haz que te reconozcan" intro="Estos datos serán visibles para quienes buscan dónde comer." />
      <div className="mt-7">
        <Field id="nombre-negocio" label="Nombre del negocio" value={form.nombreNegocio} onChange={valor => actualizar('nombreNegocio', valor)} placeholder="Donde Marta" />
        <fieldset className="mb-5">
          <legend className="label">Categoría principal</legend>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIAS.map(categoria => {
              const activa = form.categoria === categoria.valor
              return (
                <button key={categoria.valor} type="button" aria-pressed={activa} onClick={() => actualizar('categoria', categoria.valor)} className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${activa ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white text-ink hover:border-ink'}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${activa ? 'bg-white/15 text-white' : categoria.tono}`}><Icon name={categoria.icono} size={16} /></span>
                  {categoria.label}
                </button>
              )
            })}
          </div>
        </fieldset>
        <Field id="direccion" label="Dirección o punto de referencia" value={form.direccion} onChange={valor => actualizar('direccion', valor)} placeholder="Frente al parque principal" hint="Ayuda a tus clientes a encontrarte." />
        <Field id="whatsapp-negocio" label="WhatsApp del negocio" value={form.whatsappNegocio} onChange={valor => actualizar('whatsappNegocio', valor)} placeholder="+57 300 000 0000" autoComplete="tel" />
        <fieldset className="mb-5">
          <legend className="label">Horario de atención</legend>
          <p className="mb-3 text-xs text-ink-subtle">Con tu horario, tu negocio aparecerá como abierto o cerrado automáticamente.</p>
          <EditorHorario valor={form.horarios} onChange={valor => actualizar('horarios', valor)} />
        </fieldset>
      </div>
      <Actions onBack={onBack} onNext={onNext} />
    </section>
  )
}

function Productos({ form, actualizar, agregarTag, quitarTag, onBack, onNext, onSkip }) {
  return (
    <section>
      <Encabezado eyebrow="Lo que vendes" titulo="Que te encuentren por tus platos" intro="Agrega los productos que alguien escribiría para encontrar tu negocio." />
      <div className="mt-7">
        <label htmlFor="tags" className="label">Productos</label>
        <input id="tags" value={form.tagsInput} onChange={event => actualizar('tagsInput', event.target.value)} onKeyDown={agregarTag} placeholder="Escribe un producto y presiona Enter" className="input" />
        <p className="mt-2 text-xs text-ink-subtle">Por ejemplo: hamburguesa, salchipapa, jugo de corozo.</p>
        {form.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.tags.map(tag => (
              <span key={tag} className="flex h-9 items-center gap-1.5 rounded-full bg-chip pl-3.5 pr-1.5 text-sm font-medium">
                {tag}
                <button type="button" onClick={() => quitarTag(tag)} aria-label={`Quitar ${tag}`} className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted transition hover:bg-line hover:text-ink"><Icon name="x" size={14} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Upload label="Fotos de tu comida" detail="Puedes agregar varias. Las buenas fotos hacen la diferencia." accept="image/jpeg,image/png,image/webp" multiple files={form.fotosFiles} onChange={files => actualizar('fotosFiles', files)} icon="camera" />
          <Upload label="Carta del menú" detail="Una foto o PDF. Puedes hacerlo después." accept="image/jpeg,image/png,image/webp,.pdf" files={form.cartaFile ? [form.cartaFile] : []} onChange={files => actualizar('cartaFile', files[0] || null)} icon="menu" />
        </div>
      </div>
      <Actions onBack={onBack} onNext={onNext} />
      <button type="button" onClick={onSkip} className="mt-2 h-11 w-full rounded-xl text-sm font-medium text-ink-muted transition hover:bg-chip hover:text-ink">Completar fotos y carta después</button>
    </section>
  )
}

function Confirmacion({ form, actualizar, onBack, onSubmit, cargando }) {
  const categoria = obtenerCategoria(form.categoria)
  return (
    <section>
      <Encabezado eyebrow="Último paso" titulo="Revisa tu perfil" intro="Así aparecerá para las personas que buscan comida en Ciénaga." />
      <div className="mt-7 overflow-hidden rounded-[20px] border border-line">
        <div aria-hidden="true" className={`flex h-32 items-center justify-center ${categoria.tono}`}><Icon name={categoria.icono} size={52} strokeWidth={1.4} /></div>
        <div className="p-5">
          <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ${categoria.tono}`}>{categoria.label}</span>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.02em]">{form.nombreNegocio}</h2>
          <p className="mt-1 text-sm text-ink-subtle">Ciénaga, Magdalena</p>
          {(tieneHorario(form.horarios) || form.direccion) && (
            <dl className="mt-4 space-y-1 text-sm">
              {tieneHorario(form.horarios) && <div className="flex gap-2"><dt className="shrink-0 text-ink-subtle">Horario:</dt><dd>{resumenHorario(form.horarios)}</dd></div>}
              {form.direccion && <div className="flex gap-2"><dt className="text-ink-subtle">Ubicación:</dt><dd>{form.direccion}</dd></div>}
            </dl>
          )}
          {form.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{form.tags.map(tag => <span key={tag} className="flex h-[26px] items-center rounded-lg bg-chip-soft px-2.5 text-xs text-ink-muted">{tag}</span>)}</div>}
        </div>
      </div>
      <p className="mt-4 text-center text-xs leading-relaxed text-ink-subtle">Podrás modificar toda esta información, fotos y productos más adelante.</p>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-line-strong bg-paper p-4 text-sm leading-relaxed text-ink-muted transition hover:border-ink">
        <input type="checkbox" checked={form.aceptaPrivacidad} onChange={event => actualizar('aceptaPrivacidad', event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
        <span>Autorizo el tratamiento de mis datos personales según la <Link href="/privacidad" target="_blank" className="font-semibold text-brand-dark underline">política de tratamiento de datos</Link>. Entiendo que el perfil del negocio será público.</span>
      </label>
      <Actions onBack={onBack} onNext={onSubmit} nextLabel={cargando ? 'Publicando…' : 'Publicar mi negocio'} disabled={cargando} />
    </section>
  )
}

function Stepper({ paso }) {
  return (
    <div className="my-8">
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${(paso / PASOS.length) * 100}%` }} />
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-2">
        {PASOS.map((label, indice) => {
          const estado = indice + 1 < paso ? 'hecho' : indice + 1 === paso ? 'actual' : 'pendiente'
          return (
            <li key={label} aria-current={estado === 'actual' ? 'step' : undefined} className={`flex items-center justify-center gap-1.5 text-xs font-medium ${estado === 'pendiente' ? 'text-ink-subtle' : 'text-ink'}`}>
              {estado === 'hecho' && <Icon name="check" size={14} className="text-ok" />}
              {label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Field({ id, label, type = 'text', value, onChange, placeholder, hint, autoComplete }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} className="input" />
      {hint && <p className="mt-1.5 text-xs text-ink-subtle">{hint}</p>}
    </div>
  )
}

function Upload({ label, detail, accept, multiple = false, files, onChange, icon }) {
  return (
    <label className="flex cursor-pointer flex-col rounded-2xl border border-dashed border-line-strong bg-paper p-4 transition hover:border-ink">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink"><Icon name={icon} /></span>
      <span className="mt-3 block text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs leading-relaxed text-ink-subtle">{files.length ? `${files.length} archivo${files.length > 1 ? 's' : ''} seleccionado${files.length > 1 ? 's' : ''}` : detail}</span>
      <span className="mt-3 inline-flex h-8 w-fit items-center rounded-lg bg-white px-3 text-xs font-semibold text-ink ring-1 ring-line-strong">Elegir archivo</span>
      <input type="file" accept={accept} multiple={multiple} className="sr-only" onChange={event => onChange(Array.from(event.target.files || []))} />
    </label>
  )
}

function Actions({ onBack, onNext, nextLabel = 'Continuar', disabled }) {
  return (
    <div className="mt-7 flex gap-3">
      {onBack && <button type="button" onClick={onBack} className="btn-secondary">Atrás</button>}
      <button type="button" onClick={onNext} disabled={disabled} className="btn-primary flex-1">{nextLabel}</button>
    </div>
  )
}
