// Redes sociales del negocio. Se guarda solo el usuario y el enlace se arma al mostrarlo.

// `estilo`: clases del botón con el color característico de cada red.
export const REDES = [
  { clave: 'instagram', label: 'Instagram', dominio: 'instagram.com', url: usuario => `https://www.instagram.com/${usuario}`, estilo: 'bg-[linear-gradient(45deg,#F58529,#DD2A7B_55%,#8134AF)] text-white' },
  { clave: 'facebook', label: 'Facebook', dominio: 'facebook.com', url: usuario => `https://www.facebook.com/${usuario}`, estilo: 'bg-[#1877F2] text-white' },
  { clave: 'tiktok', label: 'TikTok', dominio: 'tiktok.com', url: usuario => `https://www.tiktok.com/@${usuario}`, estilo: 'bg-black text-white' },
]

// Acepta "@usuario", "usuario" o el enlace completo ("https://instagram.com/usuario/?hl=es")
// y devuelve solo el usuario. Si no se reconoce, devuelve "".
export function usuarioDeRed(clave, valor) {
  const red = REDES.find(item => item.clave === clave)
  let texto = String(valor || '').trim()
  if (!red || !texto) return ''
  const enlace = texto.match(new RegExp(`${red.dominio.replace('.', '\\.')}/(?:@)?([^/?#\\s]+)`, 'i'))
  if (enlace) texto = enlace[1]
  texto = texto.replace(/^@/, '')
  return /^[A-Za-z0-9._-]{1,60}$/.test(texto) ? texto : ''
}

// { instagram: "dondemarta", ... } sin las vacías, listo para guardar (o null si no hay ninguna).
export function normalizarRedes(redes) {
  const limpio = {}
  for (const red of REDES) {
    const usuario = usuarioDeRed(red.clave, redes?.[red.clave])
    if (usuario) limpio[red.clave] = usuario
  }
  return Object.keys(limpio).length ? limpio : null
}

// Devuelve el primer campo con un valor escrito que no se pudo reconocer, para avisar al dueño.
export function redInvalida(redes) {
  return REDES.find(red => String(redes?.[red.clave] || '').trim() && !usuarioDeRed(red.clave, redes[red.clave])) || null
}

// Lista para mostrar en el perfil: [{ clave, label, usuario, url, estilo }].
export function enlacesRedes(redes) {
  return REDES.filter(red => redes?.[red.clave]).map(red => ({ clave: red.clave, label: red.label, usuario: redes[red.clave], url: red.url(redes[red.clave]), estilo: red.estilo }))
}
