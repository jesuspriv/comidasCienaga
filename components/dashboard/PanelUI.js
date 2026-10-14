import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Icon from '@/components/ui/Icon'

export function PanelHeader({ onCerrarSesion }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-8">
        <Logo />
        {onCerrarSesion
          ? <button type="button" onClick={onCerrarSesion} className="h-10 rounded-[10px] px-3.5 text-sm font-medium text-ink-muted transition hover:bg-chip hover:text-ink">Cerrar sesión</button>
          : <Link href="/dashboard" className="flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-sm font-medium text-ink-muted transition hover:bg-chip hover:text-ink"><Icon name="arrowLeft" size={16} /> Mi panel</Link>}
      </div>
    </header>
  )
}

export function Aviso({ mensaje }) {
  const error = mensaje.tipo === 'error'
  return (
    <div role="status" className={`mt-5 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium ${error ? 'bg-danger-soft text-danger' : 'bg-ok-soft text-ok'}`}>
      <Icon name={error ? 'alert' : 'check'} size={18} className="mt-px shrink-0" />{mensaje.texto}
    </div>
  )
}

export function Cargando({ texto }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-line border-t-brand" />
        <p className="mt-4 text-sm font-medium text-ink-subtle">{texto}</p>
      </div>
    </main>
  )
}
