create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  birth_date date,
  sex text check (sex in ('male', 'female', 'other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_org_id
  on patients(org_id);

create index if not exists idx_patients_org_last_name
  on patients(org_id, last_name, first_name);
