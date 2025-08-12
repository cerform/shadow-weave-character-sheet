-- Fix linter: set immutable search_path on function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tighten read access to authenticated users for categories and assets
-- Drop and recreate select policies with auth check
drop policy if exists "asset_categories_select_all" on public.asset_categories;
create policy "asset_categories_select_auth" on public.asset_categories
  for select using (auth.uid() is not null);

drop policy if exists "assets_select_approved_or_admin" on public.assets;
create policy "assets_select_approved_or_admin_auth" on public.assets
  for select using (
    auth.uid() is not null and (
      approved = true or has_role(auth.uid(), 'admin'::app_role)
    )
  );