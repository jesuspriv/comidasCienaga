
-- Baseline recovered from the pre-existing remote project. `if not exists` lets
-- this first tracked migration adopt that project without recreating its tables.
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  whatsapp text,
  created_at timestamptz default now()
);

create table if not exists public.negocios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  nombre text not null,
  categoria text not null,
  direccion text,
  whatsapp text,
  horario text,
  foto_local_url text,
  abierto_ahora boolean default false,
  calificacion_promedio double precision default 0,
  total_calificaciones integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  valor text not null
);

create table if not exists public.fotos_comida (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

create table if not exists public.cartas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  url text not null,
  tipo text not null default 'foto',
  created_at timestamptz default now()
);

create table if not exists public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  puntuacion integer not null check (puntuacion between 1 and 5),
  comentario text,
  created_at timestamptz default now(),
  unique (negocio_id, usuario_id)
);

create index if not exists idx_negocios_usuario on public.negocios (usuario_id);
create index if not exists idx_negocios_categoria on public.negocios (categoria);
create index if not exists idx_negocios_abierto on public.negocios (abierto_ahora);
create index if not exists idx_negocios_calificacion on public.negocios (calificacion_promedio desc);
create index if not exists idx_tags_negocio on public.tags (negocio_id);
create index if not exists idx_tags_valor on public.tags (valor);
create index if not exists idx_tags_fts on public.tags using gin (to_tsvector('spanish', valor));
create index if not exists idx_fotos_negocio on public.fotos_comida (negocio_id);
create index if not exists idx_cartas_negocio on public.cartas (negocio_id);
create index if not exists idx_cal_negocio on public.calificaciones (negocio_id);

-- The app creates public URLs for food photos and menus, so the buckets must exist
-- and enforce the same limits that the client-side validation advertises.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('fotos-comida', 'fotos-comida', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('cartas-menu', 'cartas-menu', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The dashboard assumes one business per account and tags should not be duplicated.
alter table public.negocios
  add constraint negocios_usuario_id_key unique (usuario_id);

alter table public.tags
  add constraint tags_negocio_id_valor_key unique (negocio_id, valor);

revoke all on all tables in schema public from anon, authenticated;
grant select on public.negocios, public.tags, public.fotos_comida, public.cartas, public.calificaciones to anon;
grant select on public.negocios, public.tags, public.fotos_comida, public.cartas, public.calificaciones to authenticated;
grant select, insert, update on public.usuarios to authenticated;
grant insert, update, delete on public.negocios, public.tags, public.fotos_comida, public.cartas, public.calificaciones to authenticated;

alter table public.usuarios enable row level security;
alter table public.negocios enable row level security;
alter table public.tags enable row level security;
alter table public.fotos_comida enable row level security;
alter table public.cartas enable row level security;
alter table public.calificaciones enable row level security;

drop policy if exists "usuario crea su perfil" on public.usuarios;
drop policy if exists "usuario edita su perfil" on public.usuarios;
drop policy if exists "usuario lee su perfil" on public.usuarios;
drop policy if exists "dueño crea negocio" on public.negocios;
drop policy if exists "dueño edita negocio" on public.negocios;
drop policy if exists "dueño borra negocio" on public.negocios;
drop policy if exists "todos ven negocios" on public.negocios;
drop policy if exists "dueño inserta tags" on public.tags;
drop policy if exists "dueño actualiza tags" on public.tags;
drop policy if exists "dueño borra tags" on public.tags;
drop policy if exists "todos ven tags" on public.tags;
drop policy if exists "dueño inserta fotos" on public.fotos_comida;
drop policy if exists "dueño borra fotos" on public.fotos_comida;
drop policy if exists "todos ven fotos" on public.fotos_comida;
drop policy if exists "dueño inserta cartas" on public.cartas;
drop policy if exists "dueño actualiza cartas" on public.cartas;
drop policy if exists "dueño borra cartas" on public.cartas;
drop policy if exists "todos ven cartas" on public.cartas;
drop policy if exists "usuario inserta calificacion" on public.calificaciones;
drop policy if exists "usuario edita su calificacion" on public.calificaciones;
drop policy if exists "usuario borra su calificacion" on public.calificaciones;
drop policy if exists "todos ven calificaciones" on public.calificaciones;

create policy "usuario crea su perfil" on public.usuarios
  for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "usuario edita su perfil" on public.usuarios
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "usuario lee su perfil" on public.usuarios
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "dueño crea negocio" on public.negocios
  for insert to authenticated
  with check ((select auth.uid()) = usuario_id);
create policy "dueño edita negocio" on public.negocios
  for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
create policy "dueño borra negocio" on public.negocios
  for delete to authenticated
  using ((select auth.uid()) = usuario_id);
create policy "todos ven negocios" on public.negocios
  for select to anon, authenticated
  using (true);

create policy "dueño inserta tags" on public.tags
  for insert to authenticated
  with check (exists (
    select 1 from public.negocios
    where negocios.id = tags.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "dueño actualiza tags" on public.tags
  for update to authenticated
  using (exists (
    select 1 from public.negocios
    where negocios.id = tags.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.negocios
    where negocios.id = tags.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "dueño borra tags" on public.tags
  for delete to authenticated
  using (exists (
    select 1 from public.negocios
    where negocios.id = tags.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "todos ven tags" on public.tags
  for select to anon, authenticated
  using (true);

create policy "dueño inserta fotos" on public.fotos_comida
  for insert to authenticated
  with check (exists (
    select 1 from public.negocios
    where negocios.id = fotos_comida.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "dueño borra fotos" on public.fotos_comida
  for delete to authenticated
  using (exists (
    select 1 from public.negocios
    where negocios.id = fotos_comida.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "todos ven fotos" on public.fotos_comida
  for select to anon, authenticated
  using (true);

create policy "dueño inserta cartas" on public.cartas
  for insert to authenticated
  with check (exists (
    select 1 from public.negocios
    where negocios.id = cartas.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "dueño actualiza cartas" on public.cartas
  for update to authenticated
  using (exists (
    select 1 from public.negocios
    where negocios.id = cartas.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.negocios
    where negocios.id = cartas.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "dueño borra cartas" on public.cartas
  for delete to authenticated
  using (exists (
    select 1 from public.negocios
    where negocios.id = cartas.negocio_id
      and negocios.usuario_id = (select auth.uid())
  ));
create policy "todos ven cartas" on public.cartas
  for select to anon, authenticated
  using (true);

create policy "usuario inserta calificacion" on public.calificaciones
  for insert to authenticated
  with check ((select auth.uid()) = usuario_id);
create policy "usuario edita su calificacion" on public.calificaciones
  for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
create policy "usuario borra su calificacion" on public.calificaciones
  for delete to authenticated
  using ((select auth.uid()) = usuario_id);
create policy "todos ven calificaciones" on public.calificaciones
  for select to anon, authenticated
  using (true);

drop policy if exists "subir fotos comida" on storage.objects;
drop policy if exists "subir cartas" on storage.objects;
drop policy if exists "subir fotos locales" on storage.objects;
drop policy if exists "borrar fotos comida" on storage.objects;
drop policy if exists "ver fotos comida" on storage.objects;
drop policy if exists "ver cartas" on storage.objects;
drop policy if exists "ver fotos locales" on storage.objects;

create policy "dueño sube fotos de comida" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-comida'
    and exists (
      select 1 from public.negocios
      where negocios.id::text = (storage.foldername(name))[1]
        and negocios.usuario_id = (select auth.uid())
    )
  );
create policy "dueño borra fotos de comida" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'fotos-comida'
    and exists (
      select 1 from public.negocios
      where negocios.id::text = (storage.foldername(name))[1]
        and negocios.usuario_id = (select auth.uid())
    )
  );
create policy "dueño sube cartas" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'cartas-menu'
    and exists (
      select 1 from public.negocios
      where negocios.id::text = (storage.foldername(name))[1]
        and negocios.usuario_id = (select auth.uid())
    )
  );
create policy "dueño borra cartas" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'cartas-menu'
    and exists (
      select 1 from public.negocios
      where negocios.id::text = (storage.foldername(name))[1]
        and negocios.usuario_id = (select auth.uid())
    )
  );

create or replace function public.actualizar_calificacion()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  negocio_objetivo uuid := coalesce(new.negocio_id, old.negocio_id);
begin
  update public.negocios
  set
    calificacion_promedio = coalesce((
      select round(avg(puntuacion)::numeric, 1)
      from public.calificaciones
      where negocio_id = negocio_objetivo
    ), 0),
    total_calificaciones = (
      select count(*)
      from public.calificaciones
      where negocio_id = negocio_objetivo
    )
  where id = negocio_objetivo;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function public.actualizar_calificacion() from public, anon, authenticated;

drop trigger if exists actualizar_calificacion_al_cambiar_resena on public.calificaciones;
create trigger actualizar_calificacion_al_cambiar_resena
after insert or update or delete on public.calificaciones
for each row execute function public.actualizar_calificacion();

create or replace function public.buscar_por_tag(termino text)
returns table(
  negocio_id uuid,
  nombre text,
  categoria text,
  direccion text,
  whatsapp text,
  horario text,
  foto_local_url text,
  abierto_ahora boolean,
  calificacion_promedio double precision,
  total_calificaciones integer
)
language sql
security invoker
set search_path = public, pg_temp
as $$
  select distinct
    n.id,
    n.nombre,
    n.categoria,
    n.direccion,
    n.whatsapp,
    n.horario,
    n.foto_local_url,
    n.abierto_ahora,
    n.calificacion_promedio,
    n.total_calificaciones
  from public.negocios n
  join public.tags t on t.negocio_id = n.id
  where to_tsvector('spanish', t.valor) @@ plainto_tsquery('spanish', termino)
     or t.valor ilike '%' || termino || '%'
  order by n.calificacion_promedio desc;
$$;

revoke all on function public.buscar_por_tag(text) from public;
grant execute on function public.buscar_por_tag(text) to anon, authenticated;
