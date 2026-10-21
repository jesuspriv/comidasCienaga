'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Icon from '@/components/ui/Icon'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    if (!form.email || !form.password) return setError('Completa tu correo y contraseña para continuar.')
    setCargando(true)
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword(form)
    if (loginError) {
      setError('No pudimos ingresar con esos datos. Revisa tu correo y contraseña.')
      setCargando(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"><Icon name="arrowLeft" size={16} /> Explorar</Link>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          <p className="eyebrow">Para negocios locales</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em]">Bienvenido de vuelta</h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">Ingresa para actualizar tu perfil, fotos, productos y disponibilidad.</p>

          <form onSubmit={handleLogin} className="card mt-8 p-5 sm:p-6">
            <div className="mb-4">
              <label htmlFor="login-email" className="label">Correo electrónico</label>
              <input id="login-email" type="email" autoComplete="email" value={form.email} onChange={event => setForm(actual => ({ ...actual, email: event.target.value }))} placeholder="tu@correo.com" className="input" />
            </div>
            <div className="mb-5">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="login-password" className="label">Contraseña</label>
                <Link href="/recuperar" className="text-[13px] font-medium text-brand-dark hover:underline">¿La olvidaste?</Link>
              </div>
              <div className="relative">
                <input id="login-password" type={mostrarPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={event => setForm(actual => ({ ...actual, password: event.target.value }))} placeholder="Tu contraseña" className="input pr-20" />
                <button type="button" onClick={() => setMostrarPassword(valor => !valor)} className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-semibold text-ink-muted transition hover:bg-chip hover:text-ink">{mostrarPassword ? 'Ocultar' : 'Ver'}</button>
              </div>
            </div>
            {error && <p role="alert" className="mb-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}
            <button type="submit" disabled={cargando} className="btn-primary w-full">{cargando ? 'Ingresando…' : 'Ingresar a mi negocio'}</button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">¿Aún no publicas tu negocio? <Link href="/registro" className="font-semibold text-brand-dark hover:underline">Crear perfil gratis</Link></p>
        </div>
      </div>
    </main>
  )
}
