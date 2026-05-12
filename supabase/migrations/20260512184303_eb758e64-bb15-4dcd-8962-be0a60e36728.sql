
-- Roles
create type public.app_role as enum ('admin', 'investor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins see all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "users see own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "admins see all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  -- default role investor
  insert into public.user_roles (user_id, role) values (new.id, 'investor') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  status text not null default 'En construcción',
  total_value numeric not null default 0,
  amount_deposited numeric not null default 0,
  expected_sale_price numeric default 0,
  total_cost numeric default 0,
  notes text,
  -- portfolio specs
  model_name text,
  sqft_total integer,
  sqft_living integer,
  bedrooms integer,
  bathrooms numeric,
  garage boolean default false,
  features text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "investor sees own projects" on public.projects for select to authenticated using (auth.uid() = investor_id);
create policy "admins see all projects" on public.projects for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage projects" on public.projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Stages (one per stage per project, with draw)
create table public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_order integer not null,
  stage_name text not null,
  stage_group text,
  draw_number integer,
  draw_amount numeric default 0,
  completed boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.project_stages enable row level security;
create policy "investor sees own stages" on public.project_stages for select to authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.investor_id = auth.uid())
);
create policy "admins see all stages" on public.project_stages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage stages" on public.project_stages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Comparables
create table public.comparables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  address text not null,
  sale_price numeric not null default 0,
  sqft_total integer,
  sqft_living integer,
  days_on_market integer,
  sale_date date,
  created_at timestamptz not null default now()
);
alter table public.comparables enable row level security;
create policy "investor sees own comps" on public.comparables for select to authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.investor_id = auth.uid())
);
create policy "admins see all comps" on public.comparables for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage comps" on public.comparables for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Portfolio images
create table public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
alter table public.portfolio_images enable row level security;
create policy "investor sees own images" on public.portfolio_images for select to authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.investor_id = auth.uid())
);
create policy "admins see all images" on public.portfolio_images for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage images" on public.portfolio_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Opportunities (shared with all investors)
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  expected_roi numeric not null default 0,
  total_investment numeric not null default 0,
  status text not null default 'Disponible',
  contact_url text,
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.opportunities enable row level security;
create policy "all auth see opportunities" on public.opportunities for select to authenticated using (true);
create policy "admins manage opportunities" on public.opportunities for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
