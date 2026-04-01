create table if not exists meal_plan_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meal_plan_templates_org_id
  on meal_plan_templates(org_id);

create index if not exists idx_meal_plan_templates_org_name
  on meal_plan_templates(org_id, name);
