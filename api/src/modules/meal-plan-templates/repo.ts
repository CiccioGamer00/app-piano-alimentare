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
