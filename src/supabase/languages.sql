-- Languages master table with a primary key per language (Indic coverage)
create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,              -- ISO like 'hi', 'bn', etc.
  name text not null,                     -- English name
  native_name text not null,              -- Native name/script
  is_active boolean not null default true,
  total_contributions integer not null default 0,
  active_contributors integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_languages_code on public.languages (code);
create index if not exists idx_languages_is_active on public.languages (is_active);

alter table public.languages disable row level security;

-- Seed common Indic languages (safe to re-run due to ON CONFLICT)
insert into public.languages (code, name, native_name)
values
  ('hi', 'Hindi', 'हिन्दी'),
  ('bn', 'Bengali', 'বাংলা'),
  ('te', 'Telugu', 'తెలుగు'),
  ('mr', 'Marathi', 'मराठी'),
  ('ta', 'Tamil', 'தமிழ்'),
  ('gu', 'Gujarati', 'ગુજરાતી'),
  ('ur', 'Urdu', 'اردو'),
  ('kn', 'Kannada', 'ಕನ್ನಡ'),
  ('or', 'Odia', 'ଓଡ଼ିଆ'),
  ('pa', 'Punjabi', 'ਪੰਜਾਬੀ'),
  ('ml', 'Malayalam', 'മലയാളം'),
  ('as', 'Assamese', 'অসমীয়া')
on conflict (code) do nothing;
