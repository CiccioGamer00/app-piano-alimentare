/**
 * Purpose: DTOs and validation helpers for meal plan templates module.
 * Direct dependencies: none.
 * Inputs/Outputs: raw request payloads and API DTOs for meal plan templates.
 * Security: Contains organization-scoped operational data and must be handled only within the authenticated org scope.
 * Notes: First version is intentionally minimal and models only template metadata, not assigned plans or meal structure.
 */

export type CreateMealPlanTemplateBody = {
  name: string;
  description?: string | null;
  notes?: string | null;
};

export type UpdateMealPlanTemplateBody = {
  name?: string;
  description?: string | null;
  notes?: string | null;
};

export type MealPlanTemplateDto = {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function validateCreateMealPlanTemplateBody(
  body: CreateMealPlanTemplateBody
): void {
  if (!body.name || !body.name.trim()) {
    throw new Error("name is required");
  }
}

export function validateUpdateMealPlanTemplateBody(
  body: UpdateMealPlanTemplateBody
): void {
  const hasAtLeastOneField =
    body.name !== undefined ||
    body.description !== undefined ||
    body.notes !== undefined;

  if (!hasAtLeastOneField) {
    throw new Error("at least one field must be provided");
  }

  if (body.name !== undefined && !body.name.trim()) {
    throw new Error("name cannot be empty");
  }
}
