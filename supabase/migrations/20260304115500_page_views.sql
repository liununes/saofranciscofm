
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  path text not null,
  user_agent text,
  ip text,
  city text,
  region text,
  country text,
  session_id text
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Allow anyone to insert (public tracking)
create policy "Allow public insert" on public.page_views
  for insert with check (true);

-- Allow authenticated only to select
create policy "Allow authenticated select" on public.page_views
  for select using (auth.role() = 'authenticated');
