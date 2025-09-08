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
