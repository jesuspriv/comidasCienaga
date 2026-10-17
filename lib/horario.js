// Horario estructurado de los negocios y cálculo de "Abierto ahora".
// Se usa igual en el servidor y en el navegador. Todas las horas son de Colombia,
// que es UTC-5 todo el año (no tiene horario de verano).

const OFFSET_COLOMBIA_MS = -5 * 60 * 60 * 1000

// Ordenados de lunes a domingo; `indice` es el de Date#getDay (0 = domingo).
export const DIAS = [
  { clave: 'lun', label: 'Lunes', corto: 'Lun', indice: 1 },
  { clave: 'mar', label: 'Martes', corto: 'Mar', indice: 2 },
  { clave: 'mie', label: 'Miércoles', corto: 'Mié', indice: 3 },
  { clave: 'jue', label: 'Jueves', corto: 'Jue', indice: 4 },
  { clave: 'vie', label: 'Viernes', corto: 'Vie', indice: 5 },
  { clave: 'sab', label: 'Sábado', corto: 'Sáb', indice: 6 },
  { clave: 'dom', label: 'Domingo', corto: 'Dom', indice: 0 },
]

const POR_INDICE = Object.fromEntries(DIAS.map(dia => [dia.indice, dia]))

export function horarioInicial() {
  return Object.fromEntries(DIAS.map(dia => [dia.clave, { abierto: dia.clave !== 'dom', abre: '11:00', cierra: '21:00' }]))
}

export function tieneHorario(horarios) {
  return Boolean(horarios) && DIAS.some(dia => horarios[dia.clave]?.abierto)
}

export function validarHorario(horarios) {
  if (!tieneHorario(horarios)) return 'Marca al menos un día en que abras.'
  for (const dia of DIAS) {
    const turno = horarios[dia.clave]
    if (!turno?.abierto) continue
    if (aMinutos(turno.abre) === null) return `Revisa la hora de apertura del ${dia.label.toLowerCase()}.`
    if (aMinutos(turno.cierra) === null) return `Revisa la hora de cierre del ${dia.label.toLowerCase()}.`
    if (turno.abre === turno.cierra) return `El ${dia.label.toLowerCase()} abre y cierra a la misma hora.`
  }
  return null
}

function aMinutos(hora) {
  const [h, m] = String(hora || '').split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null
}

// "17:30" → "5:30 p. m.", "00:00" → "12 a. m."
export function formatoHora(hora) {
  const minutos = aMinutos(hora)
  if (minutos === null) return ''
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  const sufijo = h < 12 ? 'a. m.' : 'p. m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${sufijo}`
}

// Día de la semana (0 = domingo) y minutos desde la medianoche, en hora de Colombia.
function relojColombia(ahora) {
  const local = new Date(ahora.getTime() + OFFSET_COLOMBIA_MS)
  return { dia: local.getUTCDay(), minutos: local.getUTCHours() * 60 + local.getUTCMinutes() }
}

function turnoDe(horarios, indiceDia) {
  const turno = horarios?.[POR_INDICE[indiceDia].clave]
  if (!turno?.abierto) return null
  const abre = aMinutos(turno.abre)
  const cierra = aMinutos(turno.cierra)
  if (abre === null || cierra === null || abre === cierra) return null
  return { ...turno, abreMin: abre, cierraMin: cierra, pasaMedianoche: cierra <= abre }
}

// Próxima apertura a partir de este momento: { dia: 0..7 días desde hoy, hora: "17:00" }.
function proximaApertura(horarios, reloj) {
  for (let salto = 0; salto <= 7; salto++) {
    const turno = turnoDe(horarios, (reloj.dia + salto) % 7)
    if (!turno) continue
    if (salto === 0 && turno.abreMin <= reloj.minutos) continue
    return { salto, indiceDia: (reloj.dia + salto) % 7, hora: turno.abre }
  }
  return null
}

function textoApertura(apertura) {
  if (!apertura) return 'Cerrado por ahora'
  const hora = formatoHora(apertura.hora)
  if (apertura.salto === 0) return `Abre hoy a las ${hora}`
  if (apertura.salto === 1) return `Abre mañana a las ${hora}`
  return `Abre el ${POR_INDICE[apertura.indiceDia].label.toLowerCase()} a las ${hora}`
}

// Estado de un negocio en este momento:
// { abierto, texto, automatico } — texto es "Cierra a las 11 p. m.", "Abre mañana a las 6 a. m.", etc.
// Sin horario configurado se usa el interruptor manual (abierto_ahora) como antes.
export function estadoNegocio(negocio, ahora = new Date()) {
  const { horarios } = negocio
  if (!tieneHorario(horarios)) return { abierto: Boolean(negocio.abierto_ahora), texto: null, automatico: false }

  const reloj = relojColombia(ahora)
  if (negocio.pausado_hasta && new Date(negocio.pausado_hasta) > ahora) {
    return { abierto: false, texto: 'Cerrado por hoy', automatico: true, pausado: true }
  }

  const hoy = turnoDe(horarios, reloj.dia)
  if (hoy) {
    const enTurno = hoy.pasaMedianoche ? reloj.minutos >= hoy.abreMin : reloj.minutos >= hoy.abreMin && reloj.minutos < hoy.cierraMin
    if (enTurno) return { abierto: true, texto: `Cierra a las ${formatoHora(hoy.cierra)}`, automatico: true }
  }

  // Un turno de ayer que pasó la medianoche puede seguir abierto de madrugada.
  const ayer = turnoDe(horarios, (reloj.dia + 6) % 7)
  if (ayer?.pasaMedianoche && reloj.minutos < ayer.cierraMin) {
    return { abierto: true, texto: `Cierra a las ${formatoHora(ayer.cierra)}`, automatico: true }
  }

  return { abierto: false, texto: textoApertura(proximaApertura(horarios, reloj)), automatico: true }
}

// Reemplaza abierto_ahora por el valor calculado y agrega `estado`, para que el resto
// de la app siga leyendo negocio.abierto_ahora sin cambios.
export function conEstado(negocios, ahora = new Date()) {
  return (negocios || []).map(negocio => {
    const estado = estadoNegocio(negocio, ahora)
    return { ...negocio, abierto_ahora: estado.abierto, estado }
  })
}

// Fecha hasta la que dura "Cerrar por hoy": mañana a las 5 a. m. (hora de Colombia),
// para cubrir también los turnos que pasan la medianoche.
export function finDeJornada(ahora = new Date()) {
  const local = new Date(ahora.getTime() + OFFSET_COLOMBIA_MS)
  const manana5am = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + (local.getUTCHours() < 5 ? 0 : 1), 5, 0)
  return new Date(manana5am - OFFSET_COLOMBIA_MS)
}

// Días de la semana con su turno, para mostrar la tabla del perfil. `hoy` marca el día actual.
export function semana(horarios, ahora = new Date()) {
  const { dia: hoy } = relojColombia(ahora)
  return DIAS.map(dia => {
    const turno = horarios?.[dia.clave]
    const abierto = Boolean(turno?.abierto)
    return { ...dia, abierto, texto: abierto ? `${formatoHora(turno.abre)} – ${formatoHora(turno.cierra)}` : 'Cerrado', esHoy: dia.indice === hoy }
  })
}

// Resumen corto: "Lun–Sáb: 11 a. m. – 9 p. m. · Dom: cerrado". Agrupa días seguidos iguales.
export function resumenHorario(horarios) {
  if (!tieneHorario(horarios)) return ''
  const grupos = []
  for (const dia of semana(horarios)) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.texto === dia.texto) ultimo.hasta = dia
    else grupos.push({ desde: dia, hasta: dia, texto: dia.texto })
  }
  return grupos.map(({ desde, hasta, texto }) => {
    const dias = desde === hasta ? desde.corto : `${desde.corto}–${hasta.corto}`
    return `${dias}: ${texto === 'Cerrado' ? 'cerrado' : texto}`
  }).join(' · ')
}
