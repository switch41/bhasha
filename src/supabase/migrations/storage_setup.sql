-- Create required buckets if they don't exist
insert into storage.buckets (id, name, public)
values 
  ('audio', 'audio', true),
  ('text', 'text', true)
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage.objects
alter table if exists storage.objects enable row level security;

-- Allow anon & authenticated to INSERT/SELECT in 'audio' bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_audio_insert_public'
  ) then
    create policy "storage_audio_insert_public"
      on storage.objects
      for insert
      to anon, authenticated
      with check (bucket_id = 'audio');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_audio_select_public'
  ) then
    create policy "storage_audio_select_public"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'audio');
  end if;
end$$;

-- Allow anon & authenticated to INSERT/SELECT in 'text' bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_text_insert_public'
  ) then
    create policy "storage_text_insert_public"
      on storage.objects
      for insert
      to anon, authenticated
      with check (bucket_id = 'text');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_text_select_public'
  ) then
    create policy "storage_text_select_public"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'text');
  end if;
end$$;

-- Create additional buckets if they don't exist
insert into storage.buckets (id, name, public)
values 
  ('text-contributions','text-contributions', true),
  ('images','images', true)
on conflict (id) do nothing;

-- Policies for 'text-contributions' bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_text_contributions_insert_public'
  ) then
    create policy "storage_text_contributions_insert_public"
      on storage.objects
      for insert
      to anon, authenticated
      with check (bucket_id = 'text-contributions');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_text_contributions_select_public'
  ) then
    create policy "storage_text_contributions_select_public"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'text-contributions');
  end if;
end$$;

-- Policies for 'images' bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_images_insert_public'
  ) then
    create policy "storage_images_insert_public"
      on storage.objects
      for insert
      to anon, authenticated
      with check (bucket_id = 'images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_images_select_public'
  ) then
    create policy "storage_images_select_public"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'images');
  end if;
end$$;