// Cómo se le pide a un negocio: domicilio, recoger en el local, formas de pago
// y el enlace de WhatsApp con el mensaje ya escrito. Se usa en servidor y navegador.

export const PAGOS = [
  { valor: 'efectivo', label: 'Efectivo' },
  { valor: 'nequi', label: 'Nequi' },
  { valor: 'daviplata', label: 'Daviplata' },
  { valor: 'transferencia', label: 'Transferencia' },
  { valor: 'tarjeta', label: 'Tarjeta (datáfono)' },
]

export const TIEMPOS = ['15–30 min', '30–45 min', '45–60 min', 'Más de 1 hora']

export function pedidosIniciales() {
  return { domicilio: false, costo_tipo: 'fijo', costo: 3000, minimo_gratis: 15000, tiempo: '30–45 min', barrios: [], recoger: true, pagos: ['efectivo'] }
}

export function tienePedidos(pedidos) {
  return Boolean(pedidos) && (pedidos.domicilio || pedidos.recoger || pedidos.pagos?.length > 0)
}

export function hacePedidosADomicilio(negocio) {
  return Boolean(negocio.pedidos?.domicilio)
}

// 3000 → "$3.000"
export function formatoPesos(valor) {
  return `$${Math.round(Number(valor) || 0).toLocaleString('es-CO')}`
}

export function etiquetaPago(valor) {
  return PAGOS.find(pago => pago.valor === valor)?.label || valor
}

// "Domicilio $3.000", "Domicilio gratis" o "Domicilio gratis desde $15.000".
export function textoCostoDomicilio(pedidos) {
  if (pedidos.costo_tipo === 'gratis') return 'Domicilio gratis'
  if (pedidos.costo_tipo === 'gratis_desde') return `Domicilio gratis desde ${formatoPesos(pedidos.minimo_gratis)}`
  return `Domicilio ${formatoPesos(pedidos.costo)}`
}

// Línea corta para las tarjetas: { principal, detalle } o null si no está configurado.
export function resumenEntrega(pedidos) {
  if (!tienePedidos(pedidos)) return null
  if (pedidos.domicilio) {
    const detalle = pedidos.costo_tipo === 'gratis_desde' ? `si no, ${formatoPesos(pedidos.costo)}` : pedidos.tiempo
    return { domicilio: true, principal: textoCostoDomicilio(pedidos), detalle }
  }
  if (pedidos.recoger) return { domicilio: false, principal: 'Solo para recoger', detalle: null }
  return null
}

// Los números colombianos de 10 dígitos (celulares 3xx) necesitan el 57 para wa.me.
export function numeroWhatsApp(numero) {
  const digitos = String(numero || '').replace(/\D/g, '')
  if (digitos.length === 10 && digitos.startsWith('3')) return `57${digitos}`
  return digitos
}

export function mensajePedido(nombreNegocio, tipo) {
  const base = `Hola ${nombreNegocio}, los vi en ComidasCiénaga.`
  if (tipo === 'domicilio') return `${base} Quiero hacer un pedido a domicilio: `
  if (tipo === 'recoger') return `${base} Quiero hacer un pedido para recoger: `
  return `${base} `
}

export function enlaceWhatsApp(numero, mensaje) {
  const destino = numeroWhatsApp(numero)
  if (!destino) return null
  return `https://wa.me/${destino}?text=${encodeURIComponent(mensaje.trim())}`
}

// Limpia lo que llega del editor antes de guardarlo.
export function normalizarPedidos(pedidos) {
  const entero = valor => Math.max(0, Math.round(Number(String(valor).replace(/\D/g, '')) || 0))
  return {
    domicilio: Boolean(pedidos.domicilio),
    costo_tipo: ['fijo', 'gratis', 'gratis_desde'].includes(pedidos.costo_tipo) ? pedidos.costo_tipo : 'fijo',
    costo: entero(pedidos.costo),
    minimo_gratis: entero(pedidos.minimo_gratis),
    tiempo: TIEMPOS.includes(pedidos.tiempo) ? pedidos.tiempo : TIEMPOS[1],
    barrios: [...new Set((pedidos.barrios || []).map(barrio => barrio.trim()).filter(Boolean))],
    recoger: Boolean(pedidos.recoger),
    pagos: PAGOS.map(pago => pago.valor).filter(valor => pedidos.pagos?.includes(valor)),
  }
}

export function validarPedidos(pedidos) {
  if (!pedidos.domicilio && !pedidos.recoger) return 'Elige al menos una forma de entrega: domicilio o recoger en el local.'
  if (!pedidos.pagos?.length) return 'Marca al menos una forma de pago.'
  if (pedidos.domicilio && pedidos.costo_tipo !== 'gratis' && !(Number(pedidos.costo) > 0)) return 'Escribe el valor del domicilio.'
  if (pedidos.domicilio && pedidos.costo_tipo === 'gratis_desde' && !(Number(pedidos.minimo_gratis) > 0)) return 'Escribe desde qué valor de pedido el domicilio es gratis.'
  return null
}
