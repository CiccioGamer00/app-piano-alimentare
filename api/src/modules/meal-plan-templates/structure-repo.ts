/**
 * Purpose: Database access for meal plan template structure within an organization scope.
 * Direct dependencies: shared db factory.
 * Inputs/Outputs: structure queries in and typed rows out for template days, meals and items.
 * Security: Parent template ownership must always be verified through org_id before mutating nested structure.
 * Notes: This module keeps structure persistence separate from template metadata and assigned meal plans.
 */

import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";

export type MealPlanTemplateStructureRepoEnv = Env;

export type MealPlanTemplateDayRow = {
  id: string;
  template_id: string;
  day_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MealPlanTemplateMealRow = {
  id: string;
  day_id: string;
  meal_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MealPlanTemplateItemRow = {
  id: string;
  meal_id: string;
  item_text: string;
  quantity_text: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function findTemplateByIdAndOrgId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    templateId: string;
    orgId: string;
  }
): Promise<{ id: string } | null> {
  const sql = createDb(env);

  const rows = await sql<{ id: string }[]>`
    select id
    from meal_plan_templates
    where id = ${input.templateId}
      and org_id = ${input.orgId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function createMealPlanTemplateDay(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    templateId: string;
    dayLabel: string;
    sortOrder: number;
  }
): Promise<MealPlanTemplateDayRow> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateDayRow[]>`
    insert into meal_plan_template_days (
      template_id,
      day_label,
      sort_order
    )
    values (
      ${input.templateId},
      ${input.dayLabel},
      ${input.sortOrder}
    )
    returning
      id,
      template_id,
      day_label,
      sort_order,
      created_at,
      updated_at
  `;

  return rows[0];
}

export async function listMealPlanTemplateDaysByTemplateId(
  env: MealPlanTemplateStructureRepoEnv,
  templateId: string
): Promise<MealPlanTemplateDayRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateDayRow[]>`
    select
      id,
      template_id,
      day_label,
      sort_order,
      created_at,
      updated_at
    from meal_plan_template_days
    where template_id = ${templateId}
    order by sort_order asc, created_at asc
  `;

  return rows;
}

export async function findMealPlanTemplateDayByIdAndTemplateId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    dayId: string;
    templateId: string;
  }
): Promise<MealPlanTemplateDayRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateDayRow[]>`
    select
      id,
      template_id,
      day_label,
      sort_order,
      created_at,
      updated_at
    from meal_plan_template_days
    where id = ${input.dayId}
      and template_id = ${input.templateId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function updateMealPlanTemplateDayByIdAndTemplateId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    dayId: string;
    templateId: string;
    dayLabel: string;
    sortOrder: number;
  }
): Promise<MealPlanTemplateDayRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateDayRow[]>`
    update meal_plan_template_days
    set
      day_label = ${input.dayLabel},
      sort_order = ${input.sortOrder},
      updated_at = now()
    where id = ${input.dayId}
      and template_id = ${input.templateId}
    returning
      id,
      template_id,
      day_label,
      sort_order,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function deleteMealPlanTemplateDayByIdAndTemplateId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    dayId: string;
    templateId: string;
  }
): Promise<boolean> {
  const sql = createDb(env);

  const rows = await sql<{ id: string }[]>`
    delete from meal_plan_template_days
    where id = ${input.dayId}
      and template_id = ${input.templateId}
    returning id
  `;

  return rows.length > 0;
}

export async function createMealPlanTemplateMeal(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    dayId: string;
    mealLabel: string;
    sortOrder: number;
  }
): Promise<MealPlanTemplateMealRow> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateMealRow[]>`
    insert into meal_plan_template_meals (
      day_id,
      meal_label,
      sort_order
    )
    values (
      ${input.dayId},
      ${input.mealLabel},
      ${input.sortOrder}
    )
    returning
      id,
      day_id,
      meal_label,
      sort_order,
      created_at,
      updated_at
  `;

  return rows[0];
}

export async function listMealPlanTemplateMealsByDayId(
  env: MealPlanTemplateStructureRepoEnv,
  dayId: string
): Promise<MealPlanTemplateMealRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateMealRow[]>`
    select
      id,
      day_id,
      meal_label,
      sort_order,
      created_at,
      updated_at
    from meal_plan_template_meals
    where day_id = ${dayId}
    order by sort_order asc, created_at asc
  `;

  return rows;
}

export async function findMealPlanTemplateMealByIdAndDayId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    mealId: string;
    dayId: string;
  }
): Promise<MealPlanTemplateMealRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateMealRow[]>`
    select
      id,
      day_id,
      meal_label,
      sort_order,
      created_at,
      updated_at
    from meal_plan_template_meals
    where id = ${input.mealId}
      and day_id = ${input.dayId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function updateMealPlanTemplateMealByIdAndDayId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    mealId: string;
    dayId: string;
    mealLabel: string;
    sortOrder: number;
  }
): Promise<MealPlanTemplateMealRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateMealRow[]>`
    update meal_plan_template_meals
    set
      meal_label = ${input.mealLabel},
      sort_order = ${input.sortOrder},
      updated_at = now()
    where id = ${input.mealId}
      and day_id = ${input.dayId}
    returning
      id,
      day_id,
      meal_label,
      sort_order,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function deleteMealPlanTemplateMealByIdAndDayId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    mealId: string;
    dayId: string;
  }
): Promise<boolean> {
  const sql = createDb(env);

  const rows = await sql<{ id: string }[]>`
    delete from meal_plan_template_meals
    where id = ${input.mealId}
      and day_id = ${input.dayId}
    returning id
  `;

  return rows.length > 0;
}

export async function createMealPlanTemplateItem(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    mealId: string;
    itemText: string;
    quantityText?: string;
    notes?: string;
    sortOrder: number;
  }
): Promise<MealPlanTemplateItemRow> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateItemRow[]>`
    insert into meal_plan_template_items (
      meal_id,
      item_text,
      quantity_text,
      notes,
      sort_order
    )
    values (
      ${input.mealId},
      ${input.itemText},
      ${input.quantityText ?? null},
      ${input.notes ?? null},
      ${input.sortOrder}
    )
    returning
      id,
      meal_id,
      item_text,
      quantity_text,
      notes,
      sort_order,
      created_at,
      updated_at
  `;

  return rows[0];
}

export async function listMealPlanTemplateItemsByMealId(
  env: MealPlanTemplateStructureRepoEnv,
  mealId: string
): Promise<MealPlanTemplateItemRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateItemRow[]>`
    select
      id,
      meal_id,
      item_text,
      quantity_text,
      notes,
      sort_order,
      created_at,
      updated_at
    from meal_plan_template_items
    where meal_id = ${mealId}
    order by sort_order asc, created_at asc
  `;

  return rows;
}

export async function findMealPlanTemplateItemByIdAndMealId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    itemId: string;
    mealId: string;
  }
): Promise<MealPlanTemplateItemRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateItemRow[]>`
    select
      id,
      meal_id,
      item_text,
      quantity_text,
      notes,
      sort_order,
      created_at,
      updated_at
    from meal_plan_template_items
    where id = ${input.itemId}
      and meal_id = ${input.mealId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function updateMealPlanTemplateItemByIdAndMealId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    itemId: string;
    mealId: string;
    itemText: string;
    quantityText?: string;
    notes?: string;
    sortOrder: number;
  }
): Promise<MealPlanTemplateItemRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateItemRow[]>`
    update meal_plan_template_items
    set
      item_text = ${input.itemText},
      quantity_text = ${input.quantityText ?? null},
      notes = ${input.notes ?? null},
      sort_order = ${input.sortOrder},
      updated_at = now()
    where id = ${input.itemId}
      and meal_id = ${input.mealId}
    returning
      id,
      meal_id,
      item_text,
      quantity_text,
      notes,
      sort_order,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function deleteMealPlanTemplateItemByIdAndMealId(
  env: MealPlanTemplateStructureRepoEnv,
  input: {
    itemId: string;
    mealId: string;
  }
): Promise<boolean> {
  const sql = createDb(env);

  const rows = await sql<{ id: string }[]>`
    delete from meal_plan_template_items
    where id = ${input.itemId}
      and meal_id = ${input.mealId}
    returning id
  `;

  return rows.length > 0;
}
