create table if not exists meal_plan_template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references meal_plan_templates(id) on delete cascade,
  day_label text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meal_plan_template_days_template_id
  on meal_plan_template_days(template_id);

create unique index if not exists uq_meal_plan_template_days_template_sort_order
  on meal_plan_template_days(template_id, sort_order);

create table if not exists meal_plan_template_meals (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references meal_plan_template_days(id) on delete cascade,
  meal_label text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meal_plan_template_meals_day_id
  on meal_plan_template_meals(day_id);

create unique index if not exists uq_meal_plan_template_meals_day_sort_order
  on meal_plan_template_meals(day_id, sort_order);

create table if not exists meal_plan_template_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meal_plan_template_meals(id) on delete cascade,
  item_text text not null,
  quantity_text text,
  notes text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meal_plan_template_items_meal_id
  on meal_plan_template_items(meal_id);

create unique index if not exists uq_meal_plan_template_items_meal_sort_order
  on meal_plan_template_items(meal_id, sort_order);
