/**
 * Purpose: Business logic for managing meal plan template structure inside the authenticated organization.
 * Direct dependencies: meal plan template structure repo, request auth context, structure validation types and shared RBAC helpers.
 * Inputs/Outputs: auth context + parent ids + structure DTOs in -> structure DTOs out.
 * Security: Uses auth.orgId as mandatory tenant boundary and enforces minimum role for template structure management.
 * Notes: This first version manages days, meals and items under a template while keeping assigned meal plans separate.
 */

import type { Env } from "../../shared/db";
import type { RequestAuthContext } from "../../shared/auth/request-context";
import { hasRequiredRole } from "../../shared/auth/rbac";
import { AuthServiceError } from "../auth/service";
import {
  createMealPlanTemplateDay,
  createMealPlanTemplateItem,
  createMealPlanTemplateMeal,
  deleteMealPlanTemplateDayByIdAndTemplateId,
  deleteMealPlanTemplateItemByIdAndMealId,
  deleteMealPlanTemplateMealByIdAndDayId,
  findMealPlanTemplateDayByIdAndTemplateId,
  findMealPlanTemplateItemByIdAndMealId,
  findMealPlanTemplateMealByIdAndDayId,
  findTemplateByIdAndOrgId,
  listMealPlanTemplateDaysByTemplateId,
  listMealPlanTemplateItemsByMealId,
  listMealPlanTemplateMealsByDayId,
  updateMealPlanTemplateDayByIdAndTemplateId,
  updateMealPlanTemplateItemByIdAndMealId,
  updateMealPlanTemplateMealByIdAndDayId,
} from "./structure-repo";
import {
  validateCreateMealPlanTemplateDayBody,
  validateCreateMealPlanTemplateItemBody,
  validateCreateMealPlanTemplateMealBody,
  validateUpdateMealPlanTemplateDayBody,
  validateUpdateMealPlanTemplateItemBody,
  validateUpdateMealPlanTemplateMealBody,
  type CreateMealPlanTemplateDayBody,
  type CreateMealPlanTemplateItemBody,
  type CreateMealPlanTemplateMealBody,
  type MealPlanTemplateDayDto,
  type MealPlanTemplateItemDto,
  type MealPlanTemplateMealDto,
  type UpdateMealPlanTemplateDayBody,
  type UpdateMealPlanTemplateItemBody,
  type UpdateMealPlanTemplateMealBody,
} from "./structure-types";

function mapMealPlanTemplateDayRowToDto(row: {
  id: string;
  template_id: string;
  day_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}): MealPlanTemplateDayDto {
  return {
    id: row.id,
    templateId: row.template_id,
    dayLabel: row.day_label,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMealPlanTemplateMealRowToDto(row: {
  id: string;
  day_id: string;
  meal_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}): MealPlanTemplateMealDto {
  return {
    id: row.id,
    dayId: row.day_id,
    mealLabel: row.meal_label,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMealPlanTemplateItemRowToDto(row: {
  id: string;
  meal_id: string;
  item_text: string;
  quantity_text: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}): MealPlanTemplateItemDto {
  return {
    id: row.id,
    mealId: row.meal_id,
    itemText: row.item_text,
    quantityText: row.quantity_text,
    notes: row.notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below the required minimum.
 */
function ensureMealPlanTemplateStructureWriteAccess(
  auth: RequestAuthContext
): void {
  if (!hasRequiredRole(auth.role, "dietitian")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to manage meal plan template structure",
      403
    );
  }
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below the required minimum.
 */
function ensureMealPlanTemplateStructureReadAccess(
  auth: RequestAuthContext
): void {
  if (!hasRequiredRole(auth.role, "assistant")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to access meal plan template structure",
      403
    );
  }
}

/**
 * Preconditions: auth must be valid and templateId must belong to auth.orgId.
 * Side effects: none.
 * Expected errors: MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
async function ensureTemplateExistsForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string
): Promise<void> {
  const template = await findTemplateByIdAndOrgId(env, {
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
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId and dayId must belong to that template.
 * Side effects: none.
 * Expected errors: MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND.
 */
async function requireDayForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string
) {
  await ensureTemplateExistsForOrganization(env, auth, templateId);

  const day = await findMealPlanTemplateDayByIdAndTemplateId(env, {
    dayId,
    templateId,
  });

  if (!day) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND",
      "Meal plan template day not found",
      404
    );
  }

  return day;
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template and mealId must belong to day.
 * Side effects: none.
 * Expected errors: MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND.
 */
async function requireMealForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string
) {
  await requireDayForOrganization(env, auth, templateId, dayId);

  const meal = await findMealPlanTemplateMealByIdAndDayId(env, {
    mealId,
    dayId,
  });

  if (!meal) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND",
      "Meal plan template meal not found",
      404
    );
  }

  return meal;
}

/**
 * Preconditions: auth must be valid and templateId must belong to auth.orgId.
 * Side effects: writes one day row under the template.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function createMealPlanTemplateDayForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  body: CreateMealPlanTemplateDayBody
): Promise<MealPlanTemplateDayDto> {
  ensureMealPlanTemplateStructureWriteAccess(auth);

  try {
    validateCreateMealPlanTemplateDayBody(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid meal plan template day payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

await ensureTemplateExistsForOrganization(env, auth, templateId);

const existingDays = await listMealPlanTemplateDaysByTemplateId(env, templateId);
const hasDuplicateSortOrder = existingDays.some(
  (day) => day.sort_order === body.sortOrder
);

if (hasDuplicateSortOrder) {
  throw new AuthServiceError(
    "MEAL_PLAN_TEMPLATE_DAY_SORT_ORDER_CONFLICT",
    "A day with the same sortOrder already exists in this template",
    409
  );
}

const createdDay = await createMealPlanTemplateDay(env, {
  templateId,
  dayLabel: body.dayLabel.trim(),
  sortOrder: body.sortOrder,
});

return mapMealPlanTemplateDayRowToDto(createdDay);
}

/**
 * Preconditions: auth must be valid and templateId must belong to auth.orgId.
 * Side effects: none.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function listMealPlanTemplateDaysForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string
): Promise<MealPlanTemplateDayDto[]> {
  ensureMealPlanTemplateStructureReadAccess(auth);
  await ensureTemplateExistsForOrganization(env, auth, templateId);

  const rows = await listMealPlanTemplateDaysByTemplateId(env, templateId);
  return rows.map(mapMealPlanTemplateDayRowToDto);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId and dayId must belong to template.
 * Side effects: none.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND.
 */
export async function updateMealPlanTemplateDayForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  body: UpdateMealPlanTemplateDayBody
): Promise<MealPlanTemplateDayDto> {
  ensureMealPlanTemplateStructureWriteAccess(auth);

  try {
    validateUpdateMealPlanTemplateDayBody(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid meal plan template day payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const existingDay = await requireDayForOrganization(env, auth, templateId, dayId);

  const updatedDay = await updateMealPlanTemplateDayByIdAndTemplateId(env, {
    dayId,
    templateId,
    dayLabel:
      body.dayLabel !== undefined ? body.dayLabel.trim() : existingDay.day_label,
    sortOrder:
      body.sortOrder !== undefined ? body.sortOrder : existingDay.sort_order,
  });

  if (!updatedDay) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND",
      "Meal plan template day not found",
      404
    );
  }

  return mapMealPlanTemplateDayRowToDto(updatedDay);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId and dayId must belong to template.
 * Side effects: deletes one day row and cascades its meals/items.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND.
 */
export async function deleteMealPlanTemplateDayForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string
): Promise<void> {
  ensureMealPlanTemplateStructureWriteAccess(auth);
  await requireDayForOrganization(env, auth, templateId, dayId);

  const deleted = await deleteMealPlanTemplateDayByIdAndTemplateId(env, {
    dayId,
    templateId,
  });

  if (!deleted) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND",
      "Meal plan template day not found",
      404
    );
  }
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId and dayId must belong to template.
 * Side effects: writes one meal row under the day.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND.
 */
export async function createMealPlanTemplateMealForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  body: CreateMealPlanTemplateMealBody
): Promise<MealPlanTemplateMealDto> {
  ensureMealPlanTemplateStructureWriteAccess(auth);

  try {
    validateCreateMealPlanTemplateMealBody(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid meal plan template meal payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  await requireDayForOrganization(env, auth, templateId, dayId);

  const createdMeal = await createMealPlanTemplateMeal(env, {
    dayId,
    mealLabel: body.mealLabel.trim(),
    sortOrder: body.sortOrder,
  });

  return mapMealPlanTemplateMealRowToDto(createdMeal);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId and dayId must belong to template.
 * Side effects: none.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND.
 */
export async function listMealPlanTemplateMealsForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string
): Promise<MealPlanTemplateMealDto[]> {
  ensureMealPlanTemplateStructureReadAccess(auth);
  await requireDayForOrganization(env, auth, templateId, dayId);

  const rows = await listMealPlanTemplateMealsByDayId(env, dayId);
  return rows.map(mapMealPlanTemplateMealRowToDto);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template and mealId must belong to day.
 * Side effects: updates one meal row under the day.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND.
 */
export async function updateMealPlanTemplateMealForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string,
  body: UpdateMealPlanTemplateMealBody
): Promise<MealPlanTemplateMealDto> {
  ensureMealPlanTemplateStructureWriteAccess(auth);

  try {
    validateUpdateMealPlanTemplateMealBody(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid meal plan template meal payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const existingMeal = await requireMealForOrganization(
    env,
    auth,
    templateId,
    dayId,
    mealId
  );

  const updatedMeal = await updateMealPlanTemplateMealByIdAndDayId(env, {
    mealId,
    dayId,
    mealLabel:
      body.mealLabel !== undefined
        ? body.mealLabel.trim()
        : existingMeal.meal_label,
    sortOrder:
      body.sortOrder !== undefined ? body.sortOrder : existingMeal.sort_order,
  });

  if (!updatedMeal) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND",
      "Meal plan template meal not found",
      404
    );
  }

  return mapMealPlanTemplateMealRowToDto(updatedMeal);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template and mealId must belong to day.
 * Side effects: deletes one meal row and cascades its items.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND.
 */
export async function deleteMealPlanTemplateMealForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string
): Promise<void> {
  ensureMealPlanTemplateStructureWriteAccess(auth);
  await requireMealForOrganization(env, auth, templateId, dayId, mealId);

  const deleted = await deleteMealPlanTemplateMealByIdAndDayId(env, {
    mealId,
    dayId,
  });

  if (!deleted) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND",
      "Meal plan template meal not found",
      404
    );
  }
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template and mealId must belong to day.
 * Side effects: writes one item row under the meal.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND.
 */
export async function createMealPlanTemplateItemForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string,
  body: CreateMealPlanTemplateItemBody
): Promise<MealPlanTemplateItemDto> {
  ensureMealPlanTemplateStructureWriteAccess(auth);

  try {
    validateCreateMealPlanTemplateItemBody(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid meal plan template item payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  await requireMealForOrganization(env, auth, templateId, dayId, mealId);

  const createdItem = await createMealPlanTemplateItem(env, {
    mealId,
    itemText: body.itemText.trim(),
    quantityText: body.quantityText?.trim() || undefined,
    notes: body.notes?.trim() || undefined,
    sortOrder: body.sortOrder,
  });

  return mapMealPlanTemplateItemRowToDto(createdItem);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template and mealId must belong to day.
 * Side effects: none.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND.
 */
export async function listMealPlanTemplateItemsForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string
): Promise<MealPlanTemplateItemDto[]> {
  ensureMealPlanTemplateStructureReadAccess(auth);
  await requireMealForOrganization(env, auth, templateId, dayId, mealId);

  const rows = await listMealPlanTemplateItemsByMealId(env, mealId);
  return rows.map(mapMealPlanTemplateItemRowToDto);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template, mealId must belong to day and itemId must belong to meal.
 * Side effects: updates one item row under the meal.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND, MEAL_PLAN_TEMPLATE_ITEM_NOT_FOUND.
 */
export async function updateMealPlanTemplateItemForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string,
  itemId: string,
  body: UpdateMealPlanTemplateItemBody
): Promise<MealPlanTemplateItemDto> {
  ensureMealPlanTemplateStructureWriteAccess(auth);

  try {
    validateUpdateMealPlanTemplateItemBody(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid meal plan template item payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  await requireMealForOrganization(env, auth, templateId, dayId, mealId);

  const existingItem = await findMealPlanTemplateItemByIdAndMealId(env, {
    itemId,
    mealId,
  });

  if (!existingItem) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_ITEM_NOT_FOUND",
      "Meal plan template item not found",
      404
    );
  }

  const updatedItem = await updateMealPlanTemplateItemByIdAndMealId(env, {
    itemId,
    mealId,
    itemText:
      body.itemText !== undefined ? body.itemText.trim() : existingItem.item_text,
    quantityText:
      body.quantityText !== undefined
        ? body.quantityText?.trim() || undefined
        : existingItem.quantity_text ?? undefined,
    notes:
      body.notes !== undefined
        ? body.notes?.trim() || undefined
        : existingItem.notes ?? undefined,
    sortOrder:
      body.sortOrder !== undefined ? body.sortOrder : existingItem.sort_order,
  });

  if (!updatedItem) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_ITEM_NOT_FOUND",
      "Meal plan template item not found",
      404
    );
  }

  return mapMealPlanTemplateItemRowToDto(updatedItem);
}

/**
 * Preconditions: auth must be valid, templateId must belong to auth.orgId, dayId must belong to template, mealId must belong to day and itemId must belong to meal.
 * Side effects: deletes one item row under the meal.
 * Expected errors: FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND, MEAL_PLAN_TEMPLATE_DAY_NOT_FOUND, MEAL_PLAN_TEMPLATE_MEAL_NOT_FOUND, MEAL_PLAN_TEMPLATE_ITEM_NOT_FOUND.
 */
export async function deleteMealPlanTemplateItemForOrganization(
  env: Env,
  auth: RequestAuthContext,
  templateId: string,
  dayId: string,
  mealId: string,
  itemId: string
): Promise<void> {
  ensureMealPlanTemplateStructureWriteAccess(auth);
  await requireMealForOrganization(env, auth, templateId, dayId, mealId);

  const existingItem = await findMealPlanTemplateItemByIdAndMealId(env, {
    itemId,
    mealId,
  });

  if (!existingItem) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_ITEM_NOT_FOUND",
      "Meal plan template item not found",
      404
    );
  }

  const deleted = await deleteMealPlanTemplateItemByIdAndMealId(env, {
    itemId,
    mealId,
  });

  if (!deleted) {
    throw new AuthServiceError(
      "MEAL_PLAN_TEMPLATE_ITEM_NOT_FOUND",
      "Meal plan template item not found",
      404
    );
  }
}
