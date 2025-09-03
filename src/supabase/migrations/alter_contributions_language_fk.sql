-- 1) Ensure languages table exists before running this migration.
-- 2) Add language_id columns and backfill from existing 'language' code fields, if they exist.

-- TEXT CONTRIBUTIONS
do $$
begin
  -- Add column if not exists
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'text_contributions'
      and column_name = 'language_id'
  ) then
    alter table public.text_contributions
      add column language_id uuid;

    -- Backfill language_id from languages.code if 'language' column exists
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'text_contributions'
        and column_name = 'language'
    ) then
      update public.text_contributions tc
      set language_id = l.id
      from public.languages l
      where tc.language_id is null
        and tc.language = l.code;
    end if;

    -- Make it not null if we could backfill or if new rows are enforced
    alter table public.text_contributions
      alter column language_id set not null;

    -- Add the FK and index
    alter table public.text_contributions
      add constraint fk_text_contributions_language
      foreign key (language_id) references public.languages (id) on delete restrict;

    create index if not exists idx_text_contributions_language_id
      on public.text_contributions (language_id);
  end if;
end $$;

-- AUDIO CONTRIBUTIONS
do $$
begin
  -- Add column if not exists
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audio_contributions'
      and column_name = 'language_id'
  ) then
    alter table public.audio_contributions
      add column language_id uuid;

    -- Backfill language_id from languages.code if 'language' column exists
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'audio_contributions'
        and column_name = 'language'
    ) then
      update public.audio_contributions ac
      set language_id = l.id
      from public.languages l
      where ac.language_id is null
        and ac.language = l.code;
    end if;

    -- Make it not null if we could backfill or if new rows are enforced
    alter table public.audio_contributions
      alter column language_id set not null;

    -- Add the FK and index
    alter table public.audio_contributions
      add constraint fk_audio_contributions_language
      foreign key (language_id) references public.languages (id) on delete restrict;

    create index if not exists idx_audio_contributions_language_id
      on public.audio_contributions (language_id);
  end if;
end $$;
