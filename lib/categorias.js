// Categorías de negocio. `valor` es lo que se guarda en negocios.categoria.
export const CATEGORIAS = [
  { valor: 'comida_rapida', label: 'Comida rápida', corto: 'Rápida', detalle: 'Hamburguesas, perros, salchipapa', icono: 'burger', tono: 'bg-brand-soft text-brand-dark' },
  { valor: 'bebidas', label: 'Bebidas y café', corto: 'Bebidas', detalle: 'Jugos, café, raspao', icono: 'cup', tono: 'bg-teal-soft text-teal' },
  { valor: 'postres', label: 'Dulces y postres', corto: 'Postres', detalle: 'Cocadas, enyucado, helado', icono: 'ice', tono: 'bg-rose-soft text-rose' },
  { valor: 'tipica', label: 'Comida típica', corto: 'Típica', detalle: 'Sancocho, pescado, arroz con coco', icono: 'soup', tono: 'bg-mango-soft text-mango' },
  { valor: 'parrilla', label: 'Parrilla', corto: 'Parrilla', detalle: 'Pinchos, chorizo, carne asada', icono: 'grill', tono: 'bg-ink-soft text-peach' },
  { valor: 'otros', label: 'Otros sabores', corto: 'Otros', detalle: 'Todo lo demás', icono: 'plate', tono: 'bg-chip text-ink' },
]

// Las que se muestran como filtro (sin "otros").
export const CATEGORIAS_FILTRO = CATEGORIAS.filter(categoria => categoria.valor !== 'otros')

export function obtenerCategoria(valor) {
  return CATEGORIAS.find(categoria => categoria.valor === valor) || CATEGORIAS[CATEGORIAS.length - 1]
}

export function esCategoriaValida(valor) {
  return CATEGORIAS_FILTRO.some(categoria => categoria.valor === valor)
}
