import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata = {
  metadataBase: new URL('https://comidascienaga.com'),
  title: 'ComidasCiénaga — Directorio gastronómico',
  description: 'Encuentra todos los locales de comida de Ciénaga, Magdalena. Busca por plato y descubre dónde comer.',
  keywords: 'comida Ciénaga, restaurantes Ciénaga, donde comer Ciénaga, Magdalena',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
