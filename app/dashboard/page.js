'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)


  useEffect(() => {
    async function cargarNegocio() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('negocios')
        .select(`*, tags(valor), fotos_comida(url), cartas(url, tipo)`)
        .eq('usuario_id', user.id)
        .single()

      if (!data) return router.push('/registro')
      setNegocio(data)
      setCargando(false)
    }
    cargarNegocio()
  }, [])

  async function toggleAbierto() {
    const nuevoEstado = !negocio.abierto_ahora
    setNegocio(prev => ({ ...prev, abierto_ahora: nuevoEstado }))
    await supabase
      .from('negocios')
      .update({ abierto_ahora: nuevoEstado })
      .eq('id', negocio.id)
  }

  async function guardarCambios() {
    setGuardando(true)
    setMensaje('')
    const { error } = await supabase
      .from('negocios')
      .update({
        nombre:    negocio.nombre,
        direccion: negocio.direccion,
        whatsapp:  negocio.whatsapp,
        horario:   negocio.horario,
      })
      .eq('id', negocio.id)

    setGuardando(false)
    setMensaje(error ? 'Error al guardar' : '¡Cambios guardados!')
    setTimeout(() => setMensaje(''), 3000)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
  }

  
  async function eliminarNegocio() {
  setEliminando(true)
  
  // Borrar fotos de Storage
  for (const foto of negocio.fotos_comida || []) {
    const path = foto.url.split('fotos-comida/')[1]
    if (path) await supabase.storage.from('fotos-comida').remove([path])
  }

  // Borrar cartas de Storage
  for (const carta of negocio.cartas || []) {
    const path = carta.url.split('cartas-menu/')[1]
    if (path) await supabase.storage.from('cartas-menu').remove([path])
  }

  // Borrar el negocio — cascade borra tags, fotos y cartas de la DB
  await supabase.from('negocios').delete().eq('id', negocio.id)

  // Cerrar sesión y redirigir
  await supabase.auth.signOut()
  router.push('/')
}



  if (cargando) return (
    <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <p className="text-sm text-[#888780]">Cargando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#FAFAF8] pb-10">

      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#2C2C2A]">Mi negocio</h1>
          <p className="text-xs text-[#888780]">{negocio.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cerrarSesion}
            className="text-xs text-[#888780] border border-[#D3D1C7] px-3 py-1.5 rounded-full"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="px-4">

        {/* Toggle abierto ahora */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#2C2C2A]">¿Estás abierto ahora?</p>
            <p className="text-xs text-[#888780] mt-0.5">
              {negocio.abierto_ahora ? 'Visible como abierto para los clientes' : 'Apareces como cerrado'}
            </p>
          </div>
          <button
            onClick={toggleAbierto}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              negocio.abierto_ahora ? 'bg-[#E8593C]' : 'bg-[#D3D1C7]'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              negocio.abierto_ahora ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>

        {/* Ver perfil público */}
        <a
          href={`/negocio/${negocio.id}`}
          className="flex items-center justify-between bg-[#FAECE7] border border-[#F0997B] rounded-2xl p-4 mb-4"
        >
          <div>
            <p className="text-sm font-medium text-[#993C1D]">Ver mi perfil público</p>
            <p className="text-xs text-[#993C1D] opacity-70 mt-0.5">Así te ven los clientes</p>
          </div>
          <span className="text-[#993C1D]">→</span>
        </a>

        {/* Tags */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-[#2C2C2A] mb-3">Lo que vendes</p>
          <div className="flex flex-wrap gap-2">
            {negocio.tags?.map(tag => (
              <span key={tag.valor} className="text-xs px-3 py-1 rounded-full bg-[#FAECE7] text-[#993C1D]">
                {tag.valor}
              </span>
            ))}
          </div>
          <a href="/dashboard/editar" className="text-xs text-[#E8593C] mt-3 inline-block underline">
            Editar productos
          </a>
        </div>

        {/* Editar info */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-[#2C2C2A] mb-4">Información del negocio</p>

          <Campo
            label="Nombre del local"
            value={negocio.nombre}
            onChange={v => setNegocio(prev => ({ ...prev, nombre: v }))}
          />
          <Campo
            label="Dirección"
            value={negocio.direccion || ''}
            onChange={v => setNegocio(prev => ({ ...prev, direccion: v }))}
            placeholder="Cra 5 con Calle 18"
          />
          <Campo
            label="WhatsApp del negocio"
            value={negocio.whatsapp || ''}
            onChange={v => setNegocio(prev => ({ ...prev, whatsapp: v }))}
            placeholder="+57 300 000 0000"
          />
          <Campo
            label="Horario de atención"
            value={negocio.horario || ''}
            onChange={v => setNegocio(prev => ({ ...prev, horario: v }))}
            placeholder="Lun-Sáb 10am-9pm"
          />

          {mensaje && (
            <p className={`text-sm text-center mb-3 ${mensaje.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {mensaje}
            </p>
          )}

          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="w-full bg-[#E8593C] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#D14E34] disabled:opacity-60 transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Fotos */}
        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-[#2C2C2A] mb-3">Fotos de tu comida</p>
          {negocio.fotos_comida?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {negocio.fotos_comida.map((foto, i) => (
                <div key={i} className="h-20 rounded-xl overflow-hidden bg-[#F1EFE8]">
                  <img src={foto.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#888780] mb-3">Aún no tienes fotos</p>
          )}
          <a href="/dashboard/editar" className="text-xs text-[#E8593C] underline">
            Agregar fotos
          </a>
        </div>
          {/* Zona de peligro */}
          <div className="bg-white border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-medium text-red-500 mb-1">Zona de peligro</p>
            <p className="text-xs text-[#888780] mb-3">
              Al eliminar tu negocio se borrarán también todas las fotos, carta y productos. Esta acción no se puede deshacer.
            </p>
            {!confirmarEliminar ? (
              <button
                onClick={() => setConfirmarEliminar(true)}
                className="w-full border border-red-300 text-red-500 rounded-xl py-2.5 text-sm hover:bg-red-50 transition-colors"
              >
                Eliminar mi negocio
              </button>
            ) : (
              <div>
                <p className="text-sm font-medium text-red-500 text-center mb-3">
                  ¿Estás completamente seguro?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmarEliminar(false)}
                    className="flex-1 border border-[#D3D1C7] text-[#5F5E5A] rounded-xl py-2.5 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={eliminarNegocio}
                    disabled={eliminando}
                    className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
                  >
                    {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    </main>
  )
}

function Campo({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-[#5F5E5A] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FAFAF8] border border-[#D3D1C7] rounded-xl py-2.5 px-4 text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#E8593C] transition-colors"
      />
    </div>
  )
}