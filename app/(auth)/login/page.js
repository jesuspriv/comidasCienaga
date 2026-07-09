'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  function actualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function handleLogin() {
    if (!form.email || !form.password) return setError('Completa todos los campos')
    setCargando(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      setError('Correo o contraseña incorrectos')
      setCargando(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col">

      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <a href="/" className="text-[#5F5E5A] text-sm">← Volver</a>
      </header>

      <div className="flex-1 flex flex-col justify-center px-4 pb-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2C2C2A]">
            Comidas<span className="text-[#E8593C]">Ciénaga</span>
          </h1>
          <p className="text-sm text-[#888780] mt-1">Ingresa a tu cuenta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-6">

          <div className="mb-4">
            <label className="block text-xs font-medium text-[#5F5E5A] mb-1">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={e => actualizar('email', e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-[#FAFAF8] border border-[#D3D1C7] rounded-xl py-3 px-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#E8593C] transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-[#5F5E5A] mb-1">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => actualizar('password', e.target.value)}
              placeholder="Tu contraseña"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-[#FAFAF8] border border-[#D3D1C7] rounded-xl py-3 px-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#E8593C] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-[#E8593C] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#D14E34] disabled:opacity-60 transition-colors"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

        </div>

        <p className="text-center text-sm text-[#888780] mt-4">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-[#E8593C] font-medium">Registra tu negocio</a>
        </p>

      </div>
    </main>
  )
}