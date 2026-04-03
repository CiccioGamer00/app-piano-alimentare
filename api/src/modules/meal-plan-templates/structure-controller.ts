/**
 * Purpose: HTTP controller for meal plan template structure endpoints.
 * Direct dependencies: auth middleware, meal plan template structure service and shared HTTP helpers.
 * Inputs/Outputs: HTTP Request with bearer token and optional JSON body -> HTTP JSON Response.
 * Security: All endpoints require authentication and are always scoped to auth.orgId through the service layer.
 * Notes: This first version manages days, meals and items nested under a meal plan template.
 */

import type { Env } from "../../shared/db";
import { requireAuth } from "../../shared/auth/middleware";
import { errorJson, json } from "../../shared/http";
import { AuthServiceError } from "../auth/service";
import {
  createMealPlanTemplateDayForOrganization,
  createMealPlanTemplateItemForOrganization,
  createMealPlanTemplateMealForOrganization,
  deleteMealPlanTemplateDayForOrganization,
  deleteMealPlanTemplateItemForOrganization,
  deleteMealPlanTemplateMealForOrganization,
  listMealPlanTemplateDaysForOrganization,
  listMealPlanTemplateItemsForOrganization,
  listMealPlanTemplateMealsForOrganization,
  updateMealPlanTemplateDayForOrganization,
  updateMealPlanTemplateItemForOrganization,
  updateMealPlanTemplateMealForOrganization,
} from "./structure-service";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AuthServiceError(
      "INVALID_JSON",
      "Request body must be valid JSON",
      400
    );
  }
}

function getPathParts(request: Request): string[] {
  const url = new URL(request.url);
  return url.pathname.split("/").filter(Boolean);
}

function getTemplateIdForDaysRoute(request: Request): string | null {
  const parts = getPathParts(request);

  if (
    parts.length === 4 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "days"
  ) {
    return parts[2];
  }

  return null;
}

function getTemplateAndDayIdsFromDayDetailRoute(request: Request): {
  templateId: string;
  dayId: string;
} | null {
  const parts = getPathParts(request);

  if (
    parts.length === 5 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "days"
  ) {
    return {
      templateId: parts[2],
      dayId: parts[4],
    };
  }

  return null;
}

function getTemplateAndDayIdsForMealsRoute(request: Request): {
  templateId: string;
  dayId: string;
} | null {
  const parts = getPathParts(request);

  if (
    parts.length === 6 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "days" &&
    parts[5] === "meals"
  ) {
    return {
      templateId: parts[2],
      dayId: parts[4],
    };
  }

  return null;
}

function getTemplateDayAndMealIdsFromMealDetailRoute(request: Request): {
  templateId: string;
  dayId: string;
  mealId: string;
} | null {
  const parts = getPathParts(request);

  if (
    parts.length === 7 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "days" &&
    parts[5] === "meals"
  ) {
    return {
      templateId: parts[2],
      dayId: parts[4],
      mealId: parts[6],
    };
  }

  return null;
}

function getTemplateDayAndMealIdsForItemsRoute(request: Request): {
  templateId: string;
  dayId: string;
  mealId: string;
} | null {
  const parts = getPathParts(request);

  if (
    parts.length === 8 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "days" &&
    parts[5] === "meals" &&
    parts[7] === "items"
  ) {
    return {
      templateId: parts[2],
      dayId: parts[4],
      mealId: parts[6],
    };
  }

  return null;
}

function getTemplateDayMealAndItemIdsFromItemDetailRoute(request: Request): {
  templateId: string;
  dayId: string;
  mealId: string;
  itemId: string;
} | null {
  const parts = getPathParts(request);

  if (
    parts.length === 9 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "days" &&
    parts[5] === "meals" &&
    parts[7] === "items"
  ) {
    return {
      templateId: parts[2],
      dayId: parts[4],
      mealId: parts[6],
      itemId: parts[8],
    };
  }

  return null;
}

/**
 * Preconditions: request method must be POST, token must be valid and the URL must contain a template id.
 * Side effects: creates one day row under the template inside the authenticated org.
 * Expected errors: UNAUTHORIZED, TEMPLATE_ID_REQUIRED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function handleCreateMealPlanTemplateDay(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const templateId = getTemplateIdForDaysRoute(request);
  if (!templateId) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ID_REQUIRED",
      "Meal plan template id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const day = await createMealPlanTemplateDayForOrganization(
      env,
      auth,
      templateId,
      body as Parameters<typeof createMealPlanTemplateDayForOrganization>[3]
    );

    return json(day, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET, token must be valid and the URL must contain a template id.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, TEMPLATE_ID_REQUIRED, FORBIDDEN, MEAL_PLAN_TEMPLATE_NOT_FOUND.
 */
export async function handleListMealPlanTemplateDays(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const templateId = getTemplateIdForDaysRoute(request);
  if (!templateId) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ID_REQUIRED",
      "Meal plan template id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const days = await listMealPlanTemplateDaysForOrganization(
      env,
      auth,
      templateId
    );

    return json({ items: days }, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be PATCH, token must be valid and the URL must contain template/day ids.
 * Side effects: updates one day row inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN, NOT_FOUND.
 */
export async function handleUpdateMealPlanTemplateDay(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "PATCH") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateAndDayIdsFromDayDetailRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_DAY_ID_REQUIRED",
      "Meal plan template day id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const day = await updateMealPlanTemplateDayForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      body as Parameters<typeof updateMealPlanTemplateDayForOrganization>[4]
    );

    return json(day, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be DELETE, token must be valid and the URL must contain template/day ids.
 * Side effects: deletes one day row and cascades children inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, FORBIDDEN, NOT_FOUND.
 */
export async function handleDeleteMealPlanTemplateDay(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "DELETE") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateAndDayIdsFromDayDetailRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_DAY_ID_REQUIRED",
      "Meal plan template day id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    await deleteMealPlanTemplateDayForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId
    );

    return json({ ok: true }, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be POST, token must be valid and the URL must contain template/day ids.
 * Side effects: creates one meal row under the day inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN, NOT_FOUND.
 */
export async function handleCreateMealPlanTemplateMeal(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateAndDayIdsForMealsRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_DAY_ID_REQUIRED",
      "Meal plan template day id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const meal = await createMealPlanTemplateMealForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      body as Parameters<typeof createMealPlanTemplateMealForOrganization>[4]
    );

    return json(meal, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET, token must be valid and the URL must contain template/day ids.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, FORBIDDEN, NOT_FOUND.
 */
export async function handleListMealPlanTemplateMeals(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateAndDayIdsForMealsRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_DAY_ID_REQUIRED",
      "Meal plan template day id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const meals = await listMealPlanTemplateMealsForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId
    );

    return json({ items: meals }, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be PATCH, token must be valid and the URL must contain template/day/meal ids.
 * Side effects: updates one meal row inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN, NOT_FOUND.
 */
export async function handleUpdateMealPlanTemplateMeal(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "PATCH") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateDayAndMealIdsFromMealDetailRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_MEAL_ID_REQUIRED",
      "Meal plan template meal id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const meal = await updateMealPlanTemplateMealForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      ids.mealId,
      body as Parameters<typeof updateMealPlanTemplateMealForOrganization>[5]
    );

    return json(meal, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be DELETE, token must be valid and the URL must contain template/day/meal ids.
 * Side effects: deletes one meal row and cascades children inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, FORBIDDEN, NOT_FOUND.
 */
export async function handleDeleteMealPlanTemplateMeal(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "DELETE") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateDayAndMealIdsFromMealDetailRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_MEAL_ID_REQUIRED",
      "Meal plan template meal id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    await deleteMealPlanTemplateMealForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      ids.mealId
    );

    return json({ ok: true }, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be POST, token must be valid and the URL must contain template/day/meal ids.
 * Side effects: creates one item row under the meal inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN, NOT_FOUND.
 */
export async function handleCreateMealPlanTemplateItem(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateDayAndMealIdsForItemsRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_MEAL_ID_REQUIRED",
      "Meal plan template meal id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const item = await createMealPlanTemplateItemForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      ids.mealId,
      body as Parameters<typeof createMealPlanTemplateItemForOrganization>[5]
    );

    return json(item, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET, token must be valid and the URL must contain template/day/meal ids.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, FORBIDDEN, NOT_FOUND.
 */
export async function handleListMealPlanTemplateItems(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateDayAndMealIdsForItemsRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_MEAL_ID_REQUIRED",
      "Meal plan template meal id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const items = await listMealPlanTemplateItemsForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      ids.mealId
    );

    return json({ items }, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be PATCH, token must be valid and the URL must contain template/day/meal/item ids.
 * Side effects: updates one item row inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN, NOT_FOUND.
 */
export async function handleUpdateMealPlanTemplateItem(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "PATCH") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateDayMealAndItemIdsFromItemDetailRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ITEM_ID_REQUIRED",
      "Meal plan template item id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const item = await updateMealPlanTemplateItemForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      ids.mealId,
      ids.itemId,
      body as Parameters<typeof updateMealPlanTemplateItemForOrganization>[6]
    );

    return json(item, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be DELETE, token must be valid and the URL must contain template/day/meal/item ids.
 * Side effects: deletes one item row inside the authenticated org.
 * Expected errors: UNAUTHORIZED, IDS_REQUIRED, FORBIDDEN, NOT_FOUND.
 */
export async function handleDeleteMealPlanTemplateItem(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "DELETE") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const ids = getTemplateDayMealAndItemIdsFromItemDetailRoute(request);
  if (!ids) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ITEM_ID_REQUIRED",
      "Meal plan template item id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    await deleteMealPlanTemplateItemForOrganization(
      env,
      auth,
      ids.templateId,
      ids.dayId,
      ids.mealId,
      ids.itemId
    );

    return json({ ok: true }, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
