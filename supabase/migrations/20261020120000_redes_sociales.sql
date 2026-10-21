-- Redes sociales del negocio (todas opcionales). Se guarda solo el nombre de usuario:
-- redes: { "instagram": "dondemarta", "facebook": "dondemarta.cienaga", "tiktok": "dondemarta" }

alter table public.negocios
  add column if not exists redes jsonb;

alter table public.negocios
  drop constraint if exists negocios_redes_es_objeto;
alter table public.negocios
  add constraint negocios_redes_es_objeto check (redes is null or jsonb_typeof(redes) = 'object');
