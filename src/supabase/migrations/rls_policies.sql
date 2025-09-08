-- Enable Row Level Security and add permissive policies for public contribution tables.
-- This allows anonymous and authenticated users to insert and read rows.

-- TEXT CONTRIBUTIONS
alter table if exists public.text_contributions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'text_contributions'
      and policyname = 'text_contrib_insert_public'
  ) then
    create policy "text_contrib_insert_public"
      on public.text_contributions
      for insert
      to anon, authenticated
      with check (true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'text_contributions'
      and policyname = 'text_contrib_select_public'
  ) then
    create policy "text_contrib_select_public"
      on public.text_contributions
      for select
      to anon, authenticated
      using (true);
  end if;
end$$;

-- AUDIO CONTRIBUTIONS
alter table if exists public.audio_contributions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audio_contributions'
      and policyname = 'audio_contrib_insert_public'
  ) then
    create policy "audio_contrib_insert_public"
      on public.audio_contributions
      for insert
      to anon, authenticated
      with check (true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audio_contributions'
      and policyname = 'audio_contrib_select_public'
  ) then
    create policy "audio_contrib_select_public"
      on public.audio_contributions
      for select
      to anon, authenticated
      using (true);
  end if;
end$$;

-- LANGUAGES (needed because the app may insert a language if missing)
alter table if exists public.languages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'languages'
      and policyname = 'languages_insert_public'
  ) then
    create policy "languages_insert_public"
      on public.languages
      for insert
      to anon, authenticated
      with check (true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'languages'
      and policyname = 'languages_select_public'
  ) then
    create policy "languages_select_public"
      on public.languages
      for select
      to anon, authenticated
      using (true);
  end if;
end$$;

-- STORAGE: Allow public read/write for 'audio' and 'text' buckets
-- Note: Ensure these buckets exist in Supabase Storage first.
alter table if exists storage.objects enable row level security;

-- INSERT (upload) to 'audio' bucket
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
end$$;

-- SELECT (read) from 'audio' bucket
do $$
begin
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

-- INSERT (upload) to 'text' bucket
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
end$$;

-- SELECT (read) from 'text' bucket
do $$
begin
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