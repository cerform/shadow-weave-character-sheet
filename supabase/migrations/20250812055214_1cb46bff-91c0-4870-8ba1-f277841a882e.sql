-- Create models bucket and restrict write to admins only, allow public read
-- 1) Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('models', 'models', true)
on conflict (id) do nothing;

-- 2) Policies for storage.objects on the 'models' bucket
-- Allow anyone to read models (public assets) 
create policy "Public read access to models"
on storage.objects
for select
using (bucket_id = 'models');

-- Allow only admins to upload (insert) into models
create policy "Admins can upload models"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'models' and public.has_role(auth.uid(), 'admin')
);

-- Allow only admins to update files in models
create policy "Admins can update models"
on storage.objects
for update
using (
  bucket_id = 'models' and public.has_role(auth.uid(), 'admin')
)
with check (
  bucket_id = 'models' and public.has_role(auth.uid(), 'admin')
);

-- Allow only admins to delete files in models
create policy "Admins can delete models"
on storage.objects
for delete
using (
  bucket_id = 'models' and public.has_role(auth.uid(), 'admin')
);
