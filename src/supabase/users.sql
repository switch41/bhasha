-- Users table for application user profiles and stats
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,                 -- Unique user email
  name text,                                  -- Display name
  image text,                                 -- Avatar URL
  is_anonymous boolean default false,         -- Anonymous flag

  role text default 'user',                   -- 'admin' | 'user' | 'member'

  preferred_language text,                    -- ISO code like 'hi', 'bn', etc.
  total_contributions integer not null default 0,
  badges jsonb default '[]'::jsonb,           -- Array of badge strings
  weekly_streak integer not null default 0,
  last_contribution_at timestamptz,           -- Last contribution time

  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_created_at on public.users (created_at desc);

-- RLS: Disable for now to allow inserts from frontend anon key.
-- If you want to restrict later, enable RLS and add appropriate policies.
alter table public.users disable row level security;
