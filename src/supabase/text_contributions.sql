-- Text contributions table (stores text entries per language)
create table if not exists public.text_contributions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,                -- App user email
  language text not null,                  -- ISO code like 'hi', 'bn', etc.
  content text not null,                   -- Text content contributed
  word_count integer,                      -- Optional word count
  difficulty text,                         -- Optional difficulty label
  is_validated boolean not null default false,
  metadata jsonb,                          -- Optional additional fields
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_text_contributions_user_email on public.text_contributions (user_email);
create index if not exists idx_text_contributions_language on public.text_contributions (language);
create index if not exists idx_text_contributions_created_at on public.text_contributions (created_at desc);

-- RLS: Disable for now to allow inserts from frontend anon key.
-- If you want to restrict later, enable RLS and add appropriate policies.
alter table public.text_contributions disable row level security;
