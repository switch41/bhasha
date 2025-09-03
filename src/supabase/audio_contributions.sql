-- Audio contributions table (stores voice data references)
create table if not exists public.audio_contributions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,                 -- App user email
  language text not null,                   -- ISO code like 'hi', 'bn', etc.
  audio_storage_id text not null,           -- Convex storage id for now (string)
  duration integer,                         -- Duration in seconds (optional)
  transcript text,                          -- Optional transcript
  is_validated boolean not null default false,
  metadata jsonb,                           -- Optional extra fields (difficulty, etc.)
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_audio_contributions_user_email on public.audio_contributions (user_email);
create index if not exists idx_audio_contributions_language on public.audio_contributions (language);
create index if not exists idx_audio_contributions_created_at on public.audio_contributions (created_at desc);

-- RLS: Disable for now to allow inserts from frontend anon key.
-- If you want to restrict later, enable RLS and add appropriate policies.
alter table public.audio_contributions disable row level security;
