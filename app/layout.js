import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'ComidasCiénaga — Directorio gastronómico',
  description: 'Encuentra todos los locales de comida de Ciénaga, Magdalena. Busca por plato y descubre dónde comer.',
  keywords: 'comida Ciénaga, restaurantes Ciénaga, donde comer Ciénaga, Magdalena',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}