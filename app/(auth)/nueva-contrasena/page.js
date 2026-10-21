'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Icon from '@/components/ui/Icon'

// Llega aquí desde el enlace del correo de recuperación. Supabase agrega ?code=… a la URL;
// se canjea por una sesión y luego se puede guardar la contraseña nueva.
export default function NuevaContrasenaPage() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [estado, setEstado] = useState('verificando') // verificando | listo | invalido | guardada
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    async function verificar() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      // Supabase manda los errores (por ejemplo, enlace vencido) en el hash de la URL.
      if (url.hash.includes('error')) return activo && setEstado('invalido')
      if (code) {
        const { error: canjeError } = await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState(null, '', '/nueva-contrasena')
        if (!activo) return
        return setEstado(canjeError ? 'invalido' : 'listo')
      }
      const { data } = await supabase.auth.getSession()
      if (activo) setEstado(data.session ? 'listo' : 'invalido')
    }
    verificar()
    return () => { activo = false }
  }, [supabase])

  async function guardar(event) {
    event.preventDefault()
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirmacion) return setError('Las dos contraseñas no coinciden.')
    setGuardando(true)
    setError('')
    const { error: guardarError } = await supabase.auth.updateUser({ password })
    setGuardando(false)
    if (guardarError) return setError(guardarError.message.includes('different') ? 'La contraseña nueva debe ser distinta a la anterior.' : 'No pudimos guardar la contraseña. Pide un enlace nuevo e inténtalo otra vez.')
    setEstado('guardada')
    window.setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col">
        <header><Logo /></header>
        <div className="flex flex-1 flex-col justify-center py-10">
          {estado === 'verificando' && (
            <div className="text-center">
              <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-line border-t-brand" />
              <p className="mt-4 text-sm font-medium text-ink-subtle">Verificando tu enlace…</p>
            </div>
          )}

          {estado === 'invalido' && (
            <div className="card p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger"><Icon name="alert" size={24} /></span>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em]">Este enlace ya no sirve</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">Puede que haya vencido o que ya lo hayas usado. Pide uno nuevo y ábrelo en este mismo navegador.</p>
              <Link href="/recuperar" className="btn-primary mt-5 w-full">Pedir un enlace nuevo</Link>
            </div>
          )}

          {estado === 'guardada' && (
            <div className="card p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ok-soft text-ok"><Icon name="check" size={24} /></span>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em]">Contraseña actualizada</h1>
              <p className="mt-2 text-[15px] text-ink-muted">Te llevamos a tu panel…</p>
            </div>
          )}

          {estado === 'listo' && (
            <>
              <p className="eyebrow">Recupera tu acceso</p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em]">Crea una contraseña nueva</h1>
              <form onSubmit={guardar} className="card mt-8 p-5 sm:p-6">
                <label htmlFor="nueva-password" className="label">Contraseña nueva</label>
                <div className="relative">
                  <input id="nueva-password" type={mostrar ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" className="input pr-20" />
                  <button type="button" onClick={() => setMostrar(valor => !valor)} className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-semibold text-ink-muted transition hover:bg-chip hover:text-ink">{mostrar ? 'Ocultar' : 'Ver'}</button>
                </div>
                <label htmlFor="confirmar-password" className="label mt-4">Repite la contraseña</label>
                <input id="confirmar-password" type={mostrar ? 'text' : 'password'} autoComplete="new-password" value={confirmacion} onChange={event => setConfirmacion(event.target.value)} className="input" />
                {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}
                <button type="submit" disabled={guardando} className="btn-primary mt-5 w-full">{guardando ? 'Guardando…' : 'Guardar contraseña'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
