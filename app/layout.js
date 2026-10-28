import { Bricolage_Grotesque, Geist } from 'next/font/google'
import { SITE_NAME, SITE_URL } from '@/lib/sitio'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

// Tipografía de títulos con más personalidad (font-display).
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-bricolage',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'ComidasCiénaga — Directorio gastronómico',
  description: 'Encuentra todos los locales de comida de Ciénaga, Magdalena. Busca por plato y descubre dónde comer.',
  keywords: 'comida Ciénaga, restaurantes Ciénaga, donde comer Ciénaga, Magdalena',
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: 'es_CO', type: 'website' },
}

// Le dice a Google el nombre del sitio para que no muestre el del hosting ("Vercel").
const datosSitio = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: ['Comidas Ciénaga', 'ComidasCienaga'],
  url: `${SITE_URL}/`,
  inLanguage: 'es-CO',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geist.variable} ${bricolage.variable}`}>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosSitio) }} />
        {children}
      </body>
    </html>
  )
}
