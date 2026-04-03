/**
 * Purpose: API entrypoint and centralized router.
 * Direct dependencies: feature controllers.
 * Inputs/Outputs: HTTP Request -> HTTP Response.
 * Security: Public router for now. Protected modules enforce auth, org_id and RBAC in their own layers.
 * Notes: Keep routing centralized; business logic must stay in modules.
 */

import { handleHealth } from "./modules/health/controller";
import { handleDbCheck } from "./modules/db/controller";
import {
  handleAdminCheck,
  handleAuthContext,
  handleLogin,
  handleMe,
  handleRegister,
} from "./modules/auth/controller";
import { errorJson } from "./shared/http";
import type { Env } from "./shared/db";
import {
  handleCreatePatient,
  handleDeletePatient,
  handleGetPatient,
  handleListPatients,
  handleUpdatePatient,
} from "./modules/patients/controller";
import {
  handleCreateOrgMember,
  handleListOrgMembers,
} from "./modules/org-members/controller";
import {
  handleCreateMealPlanTemplate,
  handleDeleteMealPlanTemplate,
  handleGetMealPlanTemplate,
  handleListMealPlanTemplates,
  handleUpdateMealPlanTemplate,
} from "./modules/meal-plan-templates/controller";
import {
  handleCreateMealPlanTemplateDay,
  handleCreateMealPlanTemplateItem,
  handleCreateMealPlanTemplateMeal,
  handleDeleteMealPlanTemplateDay,
  handleDeleteMealPlanTemplateItem,
  handleDeleteMealPlanTemplateMeal,
  handleListMealPlanTemplateDays,
  handleListMealPlanTemplateItems,
  handleListMealPlanTemplateMeals,
  handleUpdateMealPlanTemplateDay,
  handleUpdateMealPlanTemplateItem,
  handleUpdateMealPlanTemplateMeal,
} from "./modules/meal-plan-templates/structure-controller";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/v1/health" || url.pathname === "/health") {
      return handleHealth();
    }

    if (url.pathname === "/v1/db-check") {
      return await handleDbCheck(env);
    }

    if (url.pathname === "/v1/auth/register") {
      return await handleRegister(request, env);
    }

    if (url.pathname === "/v1/auth/login") {
      return await handleLogin(request, env);
    }

    if (url.pathname === "/v1/auth/me") {
      return await handleMe(request, env);
    }

    if (url.pathname === "/v1/auth/admin-check") {
      return await handleAdminCheck(request, env);
    }

    if (url.pathname === "/v1/auth/context") {
      return await handleAuthContext(request, env);
    }

    if (url.pathname === "/v1/patients") {
      if (request.method === "POST") {
        return await handleCreatePatient(request, env);
      }

      if (request.method === "GET") {
        return await handleListPatients(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (url.pathname.startsWith("/v1/patients/")) {
      if (request.method === "GET") {
        return await handleGetPatient(request, env);
      }

      if (request.method === "PATCH") {
        return await handleUpdatePatient(request, env);
      }

      if (request.method === "DELETE") {
        return await handleDeletePatient(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (url.pathname === "/v1/org-members") {
      if (request.method === "POST") {
        return await handleCreateOrgMember(request, env);
      }

      if (request.method === "GET") {
        return await handleListOrgMembers(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (url.pathname === "/v1/meal-plan-templates") {
      if (request.method === "POST") {
        return await handleCreateMealPlanTemplate(request, env);
      }

      if (request.method === "GET") {
        return await handleListMealPlanTemplates(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (
      url.pathname.match(
        /^\/v1\/meal-plan-templates\/[^/]+\/days$/
      )
    ) {
      if (request.method === "POST") {
        return await handleCreateMealPlanTemplateDay(request, env);
      }

      if (request.method === "GET") {
        return await handleListMealPlanTemplateDays(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (
      url.pathname.match(
        /^\/v1\/meal-plan-templates\/[^/]+\/days\/[^/]+$/
      )
    ) {
      if (request.method === "PATCH") {
        return await handleUpdateMealPlanTemplateDay(request, env);
      }

      if (request.method === "DELETE") {
        return await handleDeleteMealPlanTemplateDay(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (
      url.pathname.match(
        /^\/v1\/meal-plan-templates\/[^/]+\/days\/[^/]+\/meals$/
      )
    ) {
      if (request.method === "POST") {
        return await handleCreateMealPlanTemplateMeal(request, env);
      }

      if (request.method === "GET") {
        return await handleListMealPlanTemplateMeals(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (
      url.pathname.match(
        /^\/v1\/meal-plan-templates\/[^/]+\/days\/[^/]+\/meals\/[^/]+$/
      )
    ) {
      if (request.method === "PATCH") {
        return await handleUpdateMealPlanTemplateMeal(request, env);
      }

      if (request.method === "DELETE") {
        return await handleDeleteMealPlanTemplateMeal(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (
      url.pathname.match(
        /^\/v1\/meal-plan-templates\/[^/]+\/days\/[^/]+\/meals\/[^/]+\/items$/
      )
    ) {
      if (request.method === "POST") {
        return await handleCreateMealPlanTemplateItem(request, env);
      }

      if (request.method === "GET") {
        return await handleListMealPlanTemplateItems(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (
      url.pathname.match(
        /^\/v1\/meal-plan-templates\/[^/]+\/days\/[^/]+\/meals\/[^/]+\/items\/[^/]+$/
      )
    ) {
      if (request.method === "PATCH") {
        return await handleUpdateMealPlanTemplateItem(request, env);
      }

      if (request.method === "DELETE") {
        return await handleDeleteMealPlanTemplateItem(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    if (url.pathname.startsWith("/v1/meal-plan-templates/")) {
      if (request.method === "GET") {
        return await handleGetMealPlanTemplate(request, env);
      }

      if (request.method === "PATCH") {
        return await handleUpdateMealPlanTemplate(request, env);
      }

      if (request.method === "DELETE") {
        return await handleDeleteMealPlanTemplate(request, env);
      }

      return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    return errorJson("NOT_FOUND", "Route not found", 404);
  },
};