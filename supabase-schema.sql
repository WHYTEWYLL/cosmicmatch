-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Create the sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  person_a_name text not null,
  person_b_name text not null,
  person_a_answers jsonb not null,
  person_b_answers jsonb,
  person_a_results jsonb not null,
  combined_results jsonb,
  paid boolean default false,
  stripe_session_id text,
  partner_token text unique not null,
  created_at timestamptz default now()
);

-- Index for fast partner token lookups
create index if not exists idx_sessions_partner_token on sessions (partner_token);

-- Enable Row Level Security (optional but recommended)
alter table sessions enable row level security;

-- Allow anonymous inserts and reads (needed for the app to work without auth)
create policy "Allow anonymous insert" on sessions for insert with check (true);
create policy "Allow anonymous select" on sessions for select using (true);
create policy "Allow anonymous update" on sessions for update using (true);
