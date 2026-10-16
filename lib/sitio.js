// Datos del sitio usados en metadatos, robots y sitemap.
// Cuando haya un dominio propio, se define NEXT_PUBLIC_SITE_URL en Vercel y todo pasa a usarlo.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://comidascienaga.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'ComidasCiénaga'
