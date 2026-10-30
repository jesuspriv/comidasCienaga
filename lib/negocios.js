// Los negocios de prueba (es_prueba = true) no se muestran en el sitio publicado.
// En local se ven si .env.local tiene MOSTRAR_NEGOCIOS_PRUEBA=true.
export const MOSTRAR_PRUEBA = process.env.MOSTRAR_NEGOCIOS_PRUEBA === 'true'

// Agrega el filtro a una consulta de Supabase sobre la tabla negocios.
export function sinPrueba(consulta) {
  return MOSTRAR_PRUEBA ? consulta : consulta.eq('es_prueba', false)
}
