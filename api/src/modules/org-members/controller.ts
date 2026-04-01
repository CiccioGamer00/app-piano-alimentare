/**
 * Purpose: HTTP controller for organization members endpoints.
 * Direct dependencies: auth middleware, org-members service and shared HTTP helpers.
 * Inputs/Outputs: HTTP Request with bearer token and optional JSON body -> HTTP JSON Response.
 * Security: All endpoints require authentication and are scoped to auth.orgId through the service layer.
 * Notes: This controller exposes list/create operations for members of the active organization only.
 */

import type { Env } from "../../shared/db";
import { requireAuth } from "../../shared/auth/middleware";
import { errorJson, json } from "../../shared/http";
import { AuthServiceError } from "../auth/service";
import {
  createOrgMemberForOrganization,
  listOrgMembersForOrganization,
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

/**
 * Preconditions: request method must be GET and token must be valid.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, FORBIDDEN.
 */
export async function handleListOrgMembers(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);
    const members = await listOrgMembersForOrganization(env, auth);

    return json(
      {
        items: members,
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
 * Preconditions: request method must be POST, token must be valid and body must contain valid member data.
 * Side effects: may create a user and creates one membership in the active organization.
 * Expected errors: UNAUTHORIZED, FORBIDDEN, INVALID_JSON, VALIDATION_ERROR, MEMBER_ALREADY_EXISTS_IN_ORG.
 */
export async function handleCreateOrgMember(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const member = await createOrgMemberForOrganization(
      env,
      auth,
      body as Parameters<typeof createOrgMemberForOrganization>[2]
    );

    return json(member, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
