-- Migration 054: org logo / cover photo / photo gallery uploads.
-- Files live in a public Supabase Storage bucket "org-media", one folder per
-- org: org-media/<org_id>/<file>. Anyone can view them (they're shown on
-- public pages); only that org's owner — or an admin — can add or delete
-- files in its folder. Images are resized + re-encoded in the browser before
-- upload, which also strips GPS/EXIF data. Safe to re-run.

alter table public.organizations add column if not exists image_url text;
alter table public.organizations add column if not exists gallery_urls text[] not null default '{}';
alter table public.organizations drop constraint if exists organizations_gallery_max_6;
alter table public.organizations add constraint organizations_gallery_max_6
  check (cardinality(gallery_urls) <= 6);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('org-media', 'org-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Can the signed-in user manage files in this org's folder?
create or replace function public.can_manage_org_media(folder text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.organizations o
    where o.id::text = folder and o.owner_id = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  );
$$;

drop policy if exists "org media: owners upload" on storage.objects;
create policy "org media: owners upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'org-media' and public.can_manage_org_media((storage.foldername(name))[1]));

drop policy if exists "org media: owners delete" on storage.objects;
create policy "org media: owners delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'org-media' and public.can_manage_org_media((storage.foldername(name))[1]));

-- Delete needs to "see" the row first; scoped the same way (public viewing
-- goes through the bucket's public URL, which doesn't need this).
drop policy if exists "org media: owners read" on storage.objects;
create policy "org media: owners read" on storage.objects
  for select to authenticated
  using (bucket_id = 'org-media' and public.can_manage_org_media((storage.foldername(name))[1]));
