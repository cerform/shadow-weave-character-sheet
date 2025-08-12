-- 1) Таблицы ассетов и категорий (используем существующую систему ролей user_roles + has_role)

-- asset_categories
create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  created_at timestamptz default now()
);

alter table public.asset_categories enable row level security;

-- Категории читают все, CRUD только админ
create policy "asset_categories_select_all" on public.asset_categories
  for select using (true);
create policy "asset_categories_admin_insert" on public.asset_categories
  for insert with check (has_role(auth.uid(), 'admin'::app_role));
create policy "asset_categories_admin_update" on public.asset_categories
  for update using (has_role(auth.uid(), 'admin'::app_role));
create policy "asset_categories_admin_delete" on public.asset_categories
  for delete using (has_role(auth.uid(), 'admin'::app_role));

-- assets
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.asset_categories(id) on delete restrict,
  name text not null,
  description text,
  storage_path text not null,
  preview_url text,
  scale_x float8 default 1,
  scale_y float8 default 1,
  scale_z float8 default 1,
  pivot jsonb default '{"x":0,"y":0,"z":0}',
  tags text[] default '{}',
  approved boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.assets enable row level security;

-- Видимость ассетов: одобренные видят все; админ видит все и управляет
create policy "assets_select_approved_or_admin" on public.assets
  for select using (
    approved = true
    or has_role(auth.uid(), 'admin'::app_role)
  );
create policy "assets_insert_admin" on public.assets
  for insert with check (has_role(auth.uid(), 'admin'::app_role));
create policy "assets_update_admin" on public.assets
  for update using (has_role(auth.uid(), 'admin'::app_role));
create policy "assets_delete_admin" on public.assets
  for delete using (has_role(auth.uid(), 'admin'::app_role));

-- 2) Экземпляры на карте (привязываем к существующей public.battle_maps и public.game_sessions)
create table if not exists public.map_entities (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.battle_maps(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete restrict,
  type text not null check (type in ('character','monster','prop','terrain','fx')),
  owner_id uuid references auth.users(id),
  x float8 not null,
  y float8 not null,
  z float8 not null,
  rot_x float8 default 0,
  rot_y float8 default 0,
  rot_z float8 default 0,
  scale_x float8,
  scale_y float8,
  scale_z float8,
  hp int,
  max_hp int,
  ac int,
  initiative int,
  data jsonb default '{}',
  is_locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.map_entities enable row level security;

-- Триггер обновления updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_map_entities_updated_at
before update on public.map_entities
for each row execute function public.set_updated_at();

-- SELECT всем участникам соответствующей сессии (DM или игроки)
create policy "map_entities_select_participants" on public.map_entities
  for select using (
    exists (
      select 1 from public.battle_maps bm
      join public.game_sessions gs on gs.id = bm.session_id
      where bm.id = map_id and (
        gs.dm_id = auth.uid() or exists (
          select 1 from public.session_players sp
          where sp.session_id = gs.id and sp.user_id = auth.uid()
        )
      )
    )
  );

-- DM/Admin полные права на карты, где они DM (или админ)
create policy "map_entities_dm_admin_insert" on public.map_entities
  for insert with check (
    exists (
      select 1 from public.battle_maps bm
      join public.game_sessions gs on gs.id = bm.session_id
      where bm.id = map_id and (
        gs.dm_id = auth.uid() or has_role(auth.uid(), 'admin'::app_role)
      )
    )
  );
create policy "map_entities_dm_admin_update" on public.map_entities
  for update using (
    exists (
      select 1 from public.battle_maps bm
      join public.game_sessions gs on gs.id = bm.session_id
      where bm.id = map_id and (
        gs.dm_id = auth.uid() or has_role(auth.uid(), 'admin'::app_role)
      )
    )
  );
create policy "map_entities_dm_admin_delete" on public.map_entities
  for delete using (
    exists (
      select 1 from public.battle_maps bm
      join public.game_sessions gs on gs.id = bm.session_id
      where bm.id = map_id and (
        gs.dm_id = auth.uid() or has_role(auth.uid(), 'admin'::app_role)
      )
    )
  );

-- Игроки могут вставлять/обновлять только свои персонажи
create policy "map_entities_player_insert_character" on public.map_entities
  for insert with check (
    type = 'character' and owner_id = auth.uid()
  );
create policy "map_entities_player_update_character" on public.map_entities
  for update using (
    type = 'character' and owner_id = auth.uid()
  );

-- 3) Realtime
alter table public.map_entities replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'map_entities'
  ) then
    execute 'alter publication supabase_realtime add table public.map_entities';
  end if;
end$$;

-- 4) Storage buckets: map-images, previews (models уже есть)
insert into storage.buckets (id, name, public)
values ('map-images','map-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('previews','previews', true)
on conflict (id) do nothing;

-- Политики на storage.objects: публичное чтение, запись только админам
-- Публичное чтение для указанных бакетов
create policy "public read map-images" on storage.objects
  for select using (bucket_id = 'map-images');
create policy "public read models" on storage.objects
  for select using (bucket_id = 'models');
create policy "public read previews" on storage.objects
  for select using (bucket_id = 'previews');

-- Запись только админам
create policy "admin write map-images" on storage.objects
  for all using (bucket_id = 'map-images' and has_role(auth.uid(), 'admin'::app_role))
  with check (bucket_id = 'map-images' and has_role(auth.uid(), 'admin'::app_role));
create policy "admin write models" on storage.objects
  for all using (bucket_id = 'models' and has_role(auth.uid(), 'admin'::app_role))
  with check (bucket_id = 'models' and has_role(auth.uid(), 'admin'::app_role));
create policy "admin write previews" on storage.objects
  for all using (bucket_id = 'previews' and has_role(auth.uid(), 'admin'::app_role))
  with check (bucket_id = 'previews' and has_role(auth.uid(), 'admin'::app_role));
