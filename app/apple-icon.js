import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Ícono para la pantalla de inicio de iPhone: el mismo logo de la pestaña, a 180×180.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E5482D' }}>
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11h16M6 11a6 6 0 0 1 12 0M5 15h14l-1 3H6l-1-3Z" />
        </svg>
      </div>
    ),
    size,
  )
}
