create extension if not exists pgcrypto;

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  first_name text,
  last_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_org_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  org_id uuid not null references orgs(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'dietitian', 'assistant', 'patient')),
  created_at timestamptz not null default now(),
  unique (user_id, org_id)
);

create index if not exists idx_user_org_roles_user_id
  on user_org_roles(user_id);

create index if not exists idx_user_org_roles_org_id
  on user_org_roles(org_id);
