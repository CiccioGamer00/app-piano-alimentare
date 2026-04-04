/**
 * Purpose: Database access for meal plan templates within an organization scope.
 * Direct dependencies: shared db factory.
 * Inputs/Outputs: meal plan template queries in and typed template rows out.
 * Security: Every query must be scoped by org_id to enforce tenant isolation.
 * Notes: First version stores only template metadata and keeps assigned plans fully separate.
 */

import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";

export type MealPlanTemplatesRepoEnv = Env;

export type MealPlanTemplateRow = {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
export type MealPlanTemplateDayTreeRow = {
  id: string;
  template_id: string;
  day_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MealPlanTemplateMealTreeRow = {
  id: string;
  day_id: string;
  meal_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MealPlanTemplateItemTreeRow = {
  id: string;
  meal_id: string;
  item_text: string;
  quantity_text: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function createMealPlanTemplate(
  env: MealPlanTemplatesRepoEnv,
  input: {
    orgId: string;
    name: string;
    description?: string;
    notes?: string;
  }
): Promise<MealPlanTemplateRow> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateRow[]>`
    insert into meal_plan_templates (
      org_id,
      name,
      description,
      notes
    )
    values (
      ${input.orgId},
      ${input.name},
      ${input.description ?? null},
      ${input.notes ?? null}
    )
    returning
      id,
      org_id,
      name,
      description,
      notes,
      created_at,
      updated_at
  `;

  return rows[0];
}

export async function listMealPlanTemplatesByOrgId(
  env: MealPlanTemplatesRepoEnv,
  orgId: string
): Promise<MealPlanTemplateRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateRow[]>`
    select
      id,
      org_id,
      name,
      description,
      notes,
      created_at,
      updated_at
    from meal_plan_templates
    where org_id = ${orgId}
    order by name asc, created_at desc
  `;

  return rows;
}

export async function findMealPlanTemplateByIdAndOrgId(
  env: MealPlanTemplatesRepoEnv,
  input: {
    templateId: string;
    orgId: string;
  }
): Promise<MealPlanTemplateRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateRow[]>`
    select
      id,
      org_id,
      name,
      description,
      notes,
      created_at,
      updated_at
    from meal_plan_templates
    where id = ${input.templateId}
      and org_id = ${input.orgId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function updateMealPlanTemplateByIdAndOrgId(
  env: MealPlanTemplatesRepoEnv,
  input: {
    templateId: string;
    orgId: string;
    name: string;
    description?: string;
    notes?: string;
  }
): Promise<MealPlanTemplateRow | null> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateRow[]>`
    update meal_plan_templates
    set
      name = ${input.name},
      description = ${input.description ?? null},
      notes = ${input.notes ?? null},
      updated_at = now()
    where id = ${input.templateId}
      and org_id = ${input.orgId}
    returning
      id,
      org_id,
      name,
      description,
      notes,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function deleteMealPlanTemplateByIdAndOrgId(
  env: MealPlanTemplatesRepoEnv,
  input: {
    templateId: string;
    orgId: string;
  }
): Promise<boolean> {
  const sql = createDb(env);

  const rows = await sql<{ id: string }[]>`
    delete from meal_plan_templates
    where id = ${input.templateId}
      and org_id = ${input.orgId}
    returning id
  `;

  return rows.length > 0;
}

export async function listMealPlanTemplateDaysTreeByTemplateId(
  env: MealPlanTemplatesRepoEnv,
  input: {
    templateId: string;
    orgId: string;
  }
): Promise<MealPlanTemplateDayTreeRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateDayTreeRow[]>`
    select
      d.id,
      d.template_id,
      d.day_label,
      d.sort_order,
      d.created_at,
      d.updated_at
    from meal_plan_template_days d
    inner join meal_plan_templates t
      on t.id = d.template_id
    where d.template_id = ${input.templateId}
      and t.org_id = ${input.orgId}
    order by d.sort_order asc, d.created_at asc
  `;

  return rows;
}

export async function listMealPlanTemplateMealsTreeByTemplateId(
  env: MealPlanTemplatesRepoEnv,
  input: {
    templateId: string;
    orgId: string;
  }
): Promise<MealPlanTemplateMealTreeRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateMealTreeRow[]>`
    select
      m.id,
      m.day_id,
      m.meal_label,
      m.sort_order,
      m.created_at,
      m.updated_at
    from meal_plan_template_meals m
    inner join meal_plan_template_days d
      on d.id = m.day_id
    inner join meal_plan_templates t
      on t.id = d.template_id
    where d.template_id = ${input.templateId}
      and t.org_id = ${input.orgId}
    order by m.sort_order asc, m.created_at asc
  `;

  return rows;
}

export async function listMealPlanTemplateItemsTreeByTemplateId(
  env: MealPlanTemplatesRepoEnv,
  input: {
    templateId: string;
    orgId: string;
  }
): Promise<MealPlanTemplateItemTreeRow[]> {
  const sql = createDb(env);

  const rows = await sql<MealPlanTemplateItemTreeRow[]>`
    select
      i.id,
      i.meal_id,
      i.item_text,
      i.quantity_text,
      i.notes,
      i.sort_order,
      i.created_at,
      i.updated_at
    from meal_plan_template_items i
    inner join meal_plan_template_meals m
      on m.id = i.meal_id
    inner join meal_plan_template_days d
      on d.id = m.day_id
    inner join meal_plan_templates t
      on t.id = d.template_id
    where d.template_id = ${input.templateId}
      and t.org_id = ${input.orgId}
    order by i.sort_order asc, i.created_at asc
  `;

  return rows;
}
