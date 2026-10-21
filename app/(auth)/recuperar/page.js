'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Icon from '@/components/ui/Icon'

export default function RecuperarPage() {
  const [supabase] = useState(createClient)
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function enviar(event) {
    event.preventDefault()
    if (!email.trim()) return setError('Escribe el correo con el que te registraste.')
    setEnviando(true)
    setError('')
    // El enlace del correo vuelve a esta misma app, a la página para crear la contraseña nueva.
    const { error: envioError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/nueva-contrasena` })
    setEnviando(false)
    if (envioError) return setError('No pudimos enviar el correo. Revisa la dirección o inténtalo en unos minutos.')
    // Por seguridad no se dice si el correo existe o no.
    setEnviado(true)
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"><Icon name="arrowLeft" size={16} /> Ingresar</Link>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          {enviado ? (
            <div className="card p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ok-soft text-ok"><Icon name="check" size={24} /></span>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em]">Revisa tu correo</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">Si <span className="font-medium text-ink">{email.trim()}</span> tiene una cuenta, te llegará un enlace para crear una contraseña nueva. Puede tardar unos minutos; mira también en spam.</p>
              <button type="button" onClick={() => setEnviado(false)} className="btn-secondary mt-5 w-full">Usar otro correo</button>
            </div>
          ) : (
            <>
              <p className="eyebrow">Recupera tu acceso</p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em]">¿Olvidaste tu contraseña?</h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">Escribe el correo de tu cuenta y te enviamos un enlace para crear una nueva.</p>
              <form onSubmit={enviar} className="card mt-8 p-5 sm:p-6">
                <label htmlFor="recuperar-email" className="label">Correo electrónico</label>
                <input id="recuperar-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="tu@correo.com" className="input" />
                {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}
                <button type="submit" disabled={enviando} className="btn-primary mt-5 w-full">{enviando ? 'Enviando…' : 'Enviar enlace'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
