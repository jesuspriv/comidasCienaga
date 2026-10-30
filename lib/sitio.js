// Datos del sitio usados en metadatos, robots y sitemap.
// Cuando haya un dominio propio, se define NEXT_PUBLIC_SITE_URL en Vercel y todo pasa a usarlo.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://comidascienaga.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'ComidasCiénaga'

// Responsable del tratamiento de datos (Ley 1581 de 2012; el Decreto 1377 de 2013 pide nombre,
// domicilio, dirección, correo y teléfono). Se muestra en /privacidad y el correo en el pie de página.
export const RESPONSABLE = {
  nombre: 'Jesús David Egea Arroyo',
  direccion: 'Calle 14 #19-27',
  ciudad: 'Ciénaga, Magdalena',
  correo: 'contacto.comidascienaga@gmail.com',
  telefono: '316 627 7920',
}

// Cambia la versión cuando cambie el texto de la política; queda guardada con cada aceptación.
export const POLITICA_VERSION = '2026-10-28'
