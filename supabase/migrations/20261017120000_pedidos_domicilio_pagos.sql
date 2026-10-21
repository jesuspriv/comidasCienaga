-- Cómo se le hace un pedido a cada negocio: domicilio, recoger en el local y formas de pago.
--
-- pedidos: {
--   "domicilio": true,
--   "costo_tipo": "fijo" | "gratis" | "gratis_desde",
--   "costo": 3000,              -- valor del domicilio cuando es fijo o "gratis desde"
--   "minimo_gratis": 15000,     -- pedido mínimo para que sea gratis ("gratis_desde")
--   "tiempo": "30–45 min",
--   "barrios": ["Centro", "San Juan"],
--   "recoger": true,
--   "pagos": ["efectivo", "nequi", "daviplata", "transferencia", "tarjeta"]
-- }
-- null = el negocio todavía no lo ha configurado.

alter table public.negocios
  add column if not exists pedidos jsonb;

alter table public.negocios
  drop constraint if exists negocios_pedidos_es_objeto;
alter table public.negocios
  add constraint negocios_pedidos_es_objeto check (pedidos is null or jsonb_typeof(pedidos) = 'object');
