-- Horario estructurado por día para calcular "Abierto ahora" automáticamente.
--
-- horarios: { "lun": { "abierto": true, "abre": "17:00", "cierra": "23:00" }, ..., "dom": {...} }
--   Las horas son de Colombia (America/Bogota). Si "cierra" es menor o igual que "abre",
--   el turno pasa la medianoche (por ejemplo 18:00 → 02:00).
-- pausado_hasta: el dueño cerró temporalmente ("Cerrar por hoy") hasta esta fecha.
--
-- La columna horario (texto) se mantiene como resumen legible y abierto_ahora como respaldo
-- para los negocios que todavía no configuraron su horario.

alter table public.negocios
  add column if not exists horarios jsonb,
  add column if not exists pausado_hasta timestamptz;

alter table public.negocios
  drop constraint if exists negocios_horarios_es_objeto;
alter table public.negocios
  add constraint negocios_horarios_es_objeto check (horarios is null or jsonb_typeof(horarios) = 'object');
