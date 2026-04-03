/**
 * Purpose: DTOs and validation helpers for meal plan template structure endpoints.
 * Direct dependencies: none.
 * Inputs/Outputs: raw request payloads and API DTOs for days, meals and items inside a meal plan template.
 * Security: Contains organization-scoped operational data and must be handled only within the authenticated org scope.
 * Notes: First version models only the editable template structure hierarchy and keeps assigned meal plans separate.
 */

export type MealPlanTemplateDayDto = {
  id: string;
  templateId: string;
  dayLabel: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MealPlanTemplateMealDto = {
  id: string;
  dayId: string;
  mealLabel: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MealPlanTemplateItemDto = {
  id: string;
  mealId: string;
  itemText: string;
  quantityText: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMealPlanTemplateDayBody = {
  dayLabel: string;
  sortOrder: number;
};

export type UpdateMealPlanTemplateDayBody = {
  dayLabel?: string;
  sortOrder?: number;
};

export type CreateMealPlanTemplateMealBody = {
  mealLabel: string;
  sortOrder: number;
};

export type UpdateMealPlanTemplateMealBody = {
  mealLabel?: string;
  sortOrder?: number;
};

export type CreateMealPlanTemplateItemBody = {
  itemText: string;
  quantityText?: string | null;
  notes?: string | null;
  sortOrder: number;
};

export type UpdateMealPlanTemplateItemBody = {
  itemText?: string;
  quantityText?: string | null;
  notes?: string | null;
  sortOrder?: number;
};

export function validateCreateMealPlanTemplateDayBody(
  body: CreateMealPlanTemplateDayBody
): void {
  if (!body.dayLabel || !body.dayLabel.trim()) {
    throw new Error("dayLabel is required");
  }

  if (!Number.isInteger(body.sortOrder) || body.sortOrder < 0) {
    throw new Error("sortOrder must be an integer greater than or equal to 0");
  }
}

export function validateUpdateMealPlanTemplateDayBody(
  body: UpdateMealPlanTemplateDayBody
): void {
  const hasAtLeastOneField =
    body.dayLabel !== undefined ||
    body.sortOrder !== undefined;

  if (!hasAtLeastOneField) {
    throw new Error("at least one field must be provided");
  }

  if (body.dayLabel !== undefined && !body.dayLabel.trim()) {
    throw new Error("dayLabel cannot be empty");
  }

  if (
    body.sortOrder !== undefined &&
    (!Number.isInteger(body.sortOrder) || body.sortOrder < 0)
  ) {
    throw new Error("sortOrder must be an integer greater than or equal to 0");
  }
}

export function validateCreateMealPlanTemplateMealBody(
  body: CreateMealPlanTemplateMealBody
): void {
  if (!body.mealLabel || !body.mealLabel.trim()) {
    throw new Error("mealLabel is required");
  }

  if (!Number.isInteger(body.sortOrder) || body.sortOrder < 0) {
    throw new Error("sortOrder must be an integer greater than or equal to 0");
  }
}

export function validateUpdateMealPlanTemplateMealBody(
  body: UpdateMealPlanTemplateMealBody
): void {
  const hasAtLeastOneField =
    body.mealLabel !== undefined ||
    body.sortOrder !== undefined;

  if (!hasAtLeastOneField) {
    throw new Error("at least one field must be provided");
  }

  if (body.mealLabel !== undefined && !body.mealLabel.trim()) {
    throw new Error("mealLabel cannot be empty");
  }

  if (
    body.sortOrder !== undefined &&
    (!Number.isInteger(body.sortOrder) || body.sortOrder < 0)
  ) {
    throw new Error("sortOrder must be an integer greater than or equal to 0");
  }
}

export function validateCreateMealPlanTemplateItemBody(
  body: CreateMealPlanTemplateItemBody
): void {
  if (!body.itemText || !body.itemText.trim()) {
    throw new Error("itemText is required");
  }

  if (!Number.isInteger(body.sortOrder) || body.sortOrder < 0) {
    throw new Error("sortOrder must be an integer greater than or equal to 0");
  }
}

export function validateUpdateMealPlanTemplateItemBody(
  body: UpdateMealPlanTemplateItemBody
): void {
  const hasAtLeastOneField =
    body.itemText !== undefined ||
    body.quantityText !== undefined ||
    body.notes !== undefined ||
    body.sortOrder !== undefined;

  if (!hasAtLeastOneField) {
    throw new Error("at least one field must be provided");
  }

  if (body.itemText !== undefined && !body.itemText.trim()) {
    throw new Error("itemText cannot be empty");
  }

  if (
    body.sortOrder !== undefined &&
    (!Number.isInteger(body.sortOrder) || body.sortOrder < 0)
  ) {
    throw new Error("sortOrder must be an integer greater than or equal to 0");
  }
}
