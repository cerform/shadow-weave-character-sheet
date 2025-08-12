-- 1) Profiles table for listing all users in Admin panel
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Update updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Trigger to populate profiles on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'displayName', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger only if not exists (defensive): drop then create to avoid duplicates
do $$ begin
  if exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    drop trigger on_auth_user_created on auth.users;
  end if;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies for profiles
create policy if not exists "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy if not exists "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "Admins can update all profiles"
  on public.profiles for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2) Storage bucket for 3D models (public read, admin-only write)
insert into storage.buckets (id, name, public)
values ('models', 'models', true)
on conflict (id) do nothing;

-- Storage policies (SELECT public, write only admin)
-- Public read access to models
create policy if not exists "Public read access to models"
  on storage.objects for select
  using (bucket_id = 'models');

-- Admins can upload models
create policy if not exists "Admins can upload models"
  on storage.objects for insert
  with check (bucket_id = 'models' and public.has_role(auth.uid(), 'admin'));

-- Admins can update models
create policy if not exists "Admins can update models"
  on storage.objects for update
  using (bucket_id = 'models' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'models' and public.has_role(auth.uid(), 'admin'));

-- Admins can delete models
create policy if not exists "Admins can delete models"
  on storage.objects for delete
  using (bucket_id = 'models' and public.has_role(auth.uid(), 'admin'));
