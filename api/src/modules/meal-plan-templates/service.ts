/**
 * Purpose: Business logic for creating and managing meal plan templates inside the authenticated organization.
 * Direct dependencies: meal plan templates repo, request auth context, meal plan templates validation types and shared RBAC helpers.
 * Inputs/Outputs: auth context + template DTOs in -> template DTOs out.
 * Security: Uses auth.orgId as mandatory tenant boundary and enforces minimum role for template management.
 * Notes: This first version manages only template metadata and keeps assigned meal plans fully separate.
 */

import type { Env } from "../../shared/db";
import type { RequestAuthContext } from "../../shared/auth/request-context";
import { hasRequiredRole } from "../../shared/auth/rbac";
import { AuthServiceError } from "../auth/service";
import {
  createMealPlanTemplate,
  deleteMealPlanTemplateByIdAndOrgId,
  findMealPlanTemplateByIdAndOrgId,
  listMealPlanTemplateDaysTreeByTemplateId,
  listMealPlanTemplateItemsTreeByTemplateId,
  listMealPlanTemplateMealsTreeByTemplateId,
  listMealPlanTemplatesByOrgId,
  updateMealPlanTemplateByIdAndOrgId,
} from "./repo";
import {
  validateCreateMealPlanTemplateBody,
  validateUpdateMealPlanTemplateBody,
  type CreateMealPlanTemplateBody,
  type MealPlanTemplateDto,
  type MealPlanTemplateFullDayDto,
  type MealPlanTemplateFullDto,
  type MealPlanTemplateFullItemDto,
  type MealPlanTemplateFullMealDto,
  type UpdateMealPlanTemplateBody,
} from "./types";

function mapMealPlanTemplateRowToDto(row: {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}): MealPlanTemplateDto {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    description: row.description,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below the required minimum.
 */
function ensureMealPlanTemplatesWriteAccess(auth: RequestAuthContext): void {
  if (!hasRequiredRole(auth.role, "dietitian")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to manage meal plan templates",
      403
    );
  }
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below the required minimum.
 */
function ensureMealPlanTemplatesReadAccess(auth: RequestAuthContext): void {
  if (!hasRequiredRole(auth.role, "assistant")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to access meal plan templates",
      403
    );
  }
}

/**
 * Preconditions: auth must come from a validated bearer token and body must contain a valid template payload.
 * Side effects: writes one meal plan template row to the database scoped to auth.orgId.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR.
 */
export async function createMealPlanTemplateForOrganization(
  env: Env,
  auth: RequestAuthContext,
  body: CreateMealPlanTemplateBody
): Promise<MealPlanTemplateDto> {
  ensureMealPlanTemplatesWriteAccess(auth);

  try {
    validateCreateMealPlanTemplateBody(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid meal plan template payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const createdTemplate = await createMealPlanTemplate(env, {
    orgId: auth.orgId,
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    notes: body.notes?.trim() || undefined,
  });

  return mapMealPlanTemplateRowToDto(createdTemplate);
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN.
 */
export async function listMealPlanTemplatesForOrganization(
  env: Env,
  auth: RequestAuthContext
): Promise<MealPlanTemplateDto[]> {
  ensureMealPlanTemplatesReadAccess(auth);

  const rows = await listMealPlanTemplatesByOrgId(env, auth.orgId);
  return rows.map(mapMealPlanTemplateRowToDto);
}

/**
 * Preconditions: auth must come from a validated bearer token and templateId must be a valid string.
 * Side effects: none.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function getMealPlanTemplateForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string
): Promise<MealPlanTemplateDto> {
  ensureMealPlanTemplatesReadAccess(auth);

  const template = await findMealPlanTemplateByIdAndOrgId(env, {
    templateId,
    orgId: auth.orgId,
  });

  if (!template) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_NOT_FOUND",
      "Meal plan template not found",
      404
    );
  }

  return mapMealPlanTemplateRowToDto(template);
}

/**
 * Preconditions: auth must come from a validated bearer token, templateId must be valid and body must contain at least one valid field.
 * Side effects: updates one meal plan template row inside auth.orgId.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function updateMealPlanTemplateForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  body: UpdateMealPlanTemplateBody
): Promise<MealPlanTemplateDto> {
  ensureMealPlanTemplatesWriteAccess(auth);

  try {
    validateUpdateMealPlanTemplateBody(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid meal plan template payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const existingTemplate = await findMealPlanTemplateByIdAndOrgId(env, {
    templateId,
    orgId: auth.orgId,
  });

  if (!existingTemplate) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_NOT_FOUND",
      "Meal plan template not found",
      404
    );
  }

  const updatedTemplate = await updateMealPlanTemplateByIdAndOrgId(env, {
    templateId,
    orgId: auth.orgId,
    name: body.name !== undefined ? body.name.trim() : existingTemplate.name,
    description:
      body.description !== undefined
        ? body.description?.trim() || undefined
        : existingTemplate.description ?? undefined,
    notes:
      body.notes !== undefined
        ? body.notes?.trim() || undefined
        : existingTemplate.notes ?? undefined,
  });

  if (!updatedTemplate) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_NOT_FOUND",
      "Meal plan template not found",
      404
    );
  }

  return mapMealPlanTemplateRowToDto(updatedTemplate);
}

/**
 * Preconditions: auth must come from a validated bearer token and templateId must be valid.
 * Side effects: deletes one meal plan template row inside auth.orgId.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function deleteMealPlanTemplateForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string
): Promise<void> {
  ensureMealPlanTemplatesWriteAccess(auth);

  const deleted = await deleteMealPlanTemplateByIdAndOrgId(env, {
    templateId,
    orgId: auth.orgId,
  });

  if (!deleted) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_NOT_FOUND",
      "Meal plan template not found",
      404
    );
  }
}
export async function getMealPlanTemplateFullForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string
): Promise<MealPlanTemplateFullDto> {
  ensureMealPlanTemplatesReadAccess(auth);

  const template = await findMealPlanTemplateByIdAndOrgId(env, {
    templateId,
    orgId: auth.orgId,
  });

  if (!template) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_NOT_FOUND",
      "Meal plan template not found",
      404
    );
  }

  const [dayRows, mealRows, itemRows] = await Promise.all([
    listMealPlanTemplateDaysTreeByTemplateId(env, {
      templateId,
      orgId: auth.orgId,
    }),
    listMealPlanTemplateMealsTreeByTemplateId(env, {
      templateId,
      orgId: auth.orgId,
    }),
    listMealPlanTemplateItemsTreeByTemplateId(env, {
      templateId,
      orgId: auth.orgId,
    }),
  ]);

  const itemsByMealId = new Map<string, MealPlanTemplateFullItemDto[]>();

  for (const itemRow of itemRows) {
    const itemDto: MealPlanTemplateFullItemDto = {
      id: itemRow.id,
      mealId: itemRow.meal_id,
      itemText: itemRow.item_text,
      quantityText: itemRow.quantity_text,
      notes: itemRow.notes,
      sortOrder: itemRow.sort_order,
      createdAt: itemRow.created_at,
      updatedAt: itemRow.updated_at,
    };

    const currentItems = itemsByMealId.get(itemRow.meal_id) ?? [];
    currentItems.push(itemDto);
    itemsByMealId.set(itemRow.meal_id, currentItems);
  }

  const mealsByDayId = new Map<string, MealPlanTemplateFullMealDto[]>();

  for (const mealRow of mealRows) {
    const mealDto: MealPlanTemplateFullMealDto = {
      id: mealRow.id,
      dayId: mealRow.day_id,
      mealLabel: mealRow.meal_label,
      sortOrder: mealRow.sort_order,
      createdAt: mealRow.created_at,
      updatedAt: mealRow.updated_at,
      items: itemsByMealId.get(mealRow.id) ?? [],
    };

    const currentMeals = mealsByDayId.get(mealRow.day_id) ?? [];
    currentMeals.push(mealDto);
    mealsByDayId.set(mealRow.day_id, currentMeals);
  }

  const days: MealPlanTemplateFullDayDto[] = dayRows.map((dayRow) => ({
    id: dayRow.id,
    templateId: dayRow.template_id,
    dayLabel: dayRow.day_label,
    sortOrder: dayRow.sort_order,
    createdAt: dayRow.created_at,
    updatedAt: dayRow.updated_at,
    meals: mealsByDayId.get(dayRow.id) ?? [],
  }));

  return {
    id: template.id,
    orgId: template.org_id,
    name: template.name,
    description: template.description,
    notes: template.notes,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
    days,
  };
}