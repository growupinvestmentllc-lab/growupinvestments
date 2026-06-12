alter table public.project_stages
  add column if not exists estimated_start_date date,
  add column if not exists estimated_end_date date;