/**
 * Purpose: HTTP controller for meal plan templates endpoints.
 * Direct dependencies: auth middleware, meal plan templates service and shared HTTP helpers.
 * Inputs/Outputs: HTTP Request with bearer token and optional JSON body -> HTTP JSON Response.
 * Security: All endpoints require authentication and are always scoped to auth.orgId.
 * Notes: This first version manages only template metadata and keeps assigned meal plans separate.
 */

import type { Env } from "../../shared/db";
import { requireAuth } from "../../shared/auth/middleware";
import { errorJson, json } from "../../shared/http";
import { AuthServiceError } from "../auth/service";
import {
  createMealPlanTemplateForOrganization,
  deleteMealPlanTemplateForOrganization,
  getMealPlanTemplateForOrganization,
  getMealPlanTemplateFullForOrganization,
  listMealPlanTemplatesForOrganization,
  updateMealPlanTemplateForOrganization,
} from "./service";

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

function getMealPlanTemplateIdFromPath(request: Request): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    parts.length === 3 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates"
  ) {
    return parts[2];
  }

  return null;
}
function getMealPlanTemplateFullIdFromPath(request: Request): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    parts.length === 4 &&
    parts[0] === "v1" &&
    parts[1] === "meal-plan-templates" &&
    parts[3] === "full"
  ) {
    return parts[2];
  }

  return null;
}

/**
 * Preconditions: request method must be POST, token must be valid and body must contain valid template data.
 * Side effects: creates one meal plan template row in the authenticated org.
 * Expected errors: UNAUTHORIZED, INVALID_JSON, VALIDATION_ERROR, FORBIDDEN.
 */
export async function handleCreateMealPlanTemplate(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const template = await createMealPlanTemplateForOrganization(
      env,
      auth,
      body as Parameters<typeof createMealPlanTemplateForOrganization>[2]
    );

    return json(template, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET and token must be valid.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, FORBIDDEN.
 */
export async function handleListMealPlanTemplates(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);
    const templates = await listMealPlanTemplatesForOrganization(env, auth);

    return json(
      {
        items: templates,
      },
      200
    );
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
 * Expected errors: UNAUTHORIZED, MEAL_PLAN_TEMPLATE_ID_REQUIRED, MEAL_PLAN_TEMPLATE_NOT_FOUND, FORBIDDEN.
 */
export async function handleGetMealPlanTemplate(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const templateId = getMealPlanTemplateIdFromPath(request);
  if (!templateId) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ID_REQUIRED",
      "Meal plan template id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const template = await getMealPlanTemplateForOrganization(
      env,
      auth,
      templateId
    );

    return json(template, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be PATCH, token must be valid, the URL must contain a template id and body must be valid.
 * Side effects: updates one meal plan template row in the authenticated org.
 * Expected errors: UNAUTHORIZED, MEAL_PLAN_TEMPLATE_ID_REQUIRED, INVALID_JSON, VALIDATION_ERROR, MEAL_PLAN_TEMPLATE_NOT_FOUND, FORBIDDEN.
 */
export async function handleUpdateMealPlanTemplate(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "PATCH") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const templateId = getMealPlanTemplateIdFromPath(request);
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
    const template = await updateMealPlanTemplateForOrganization(
      env,
      auth,
      templateId,
      body as Parameters<typeof updateMealPlanTemplateForOrganization>[3]
    );

    return json(template, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be DELETE, token must be valid and the URL must contain a template id.
 * Side effects: deletes one meal plan template row from the authenticated org.
 * Expected errors: UNAUTHORIZED, MEAL_PLAN_TEMPLATE_ID_REQUIRED, MEAL_PLAN_TEMPLATE_NOT_FOUND, FORBIDDEN.
 */
export async function handleDeleteMealPlanTemplate(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "DELETE") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const templateId = getMealPlanTemplateIdFromPath(request);
  if (!templateId) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ID_REQUIRED",
      "Meal plan template id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    await deleteMealPlanTemplateForOrganization(env, auth, templateId);

    return json(
      {
        ok: true,
      },
      200
    );
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
/**
 * Preconditions: request method must be GET, token must be valid and the URL must contain a template id before /full.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, MEAL_PLAN_TEMPLATE_ID_REQUIRED, MEAL_PLAN_TEMPLATE_NOT_FOUND, FORBIDDEN.
 */
export async function handleGetMealPlanTemplateFull(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const templateId = getMealPlanTemplateFullIdFromPath(request);
  if (!templateId) {
    return errorJson(
      "MEAL_PLAN_TEMPLATE_ID_REQUIRED",
      "Meal plan template id is required",
      400
    );
  }

  try {
    const auth = await requireAuth(request, env);
    const template = await getMealPlanTemplateFullForOrganization(
      env,
      auth,
      templateId
    );

    return json(template, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}