-- Marca los negocios de prueba. El sitio publicado no los muestra;
-- solo aparecen en local con MOSTRAR_NEGOCIOS_PRUEBA=true en .env.local.

alter table public.negocios
  add column if not exists es_prueba boolean not null default false;

create index if not exists idx_negocios_es_prueba on public.negocios (es_prueba);
