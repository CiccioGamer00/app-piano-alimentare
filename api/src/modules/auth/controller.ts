/**
 * Purpose: HTTP controller for auth register, login and protected auth endpoints.
 * Direct dependencies: auth service, auth middleware, RBAC helper and shared HTTP helpers.
 * Inputs/Outputs: HTTP Request with JSON body or bearer token -> HTTP JSON Response.
 * Security: Public endpoints handle credentials; protected endpoints require valid bearer token and may require specific roles.
 * Notes: Accepts POST only for register/login and GET only for protected read endpoints.
 */

import { errorJson, json } from "../../shared/http";
import type { Env } from "../../shared/db";
import { requireAuth } from "../../shared/auth/middleware";
import { hasRequiredRole } from "../../shared/auth/rbac";
import { AuthServiceError, login, register } from "./service";

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
 * Preconditions: request method must be POST and body must be valid register JSON.
 * Side effects: may create users, orgs and memberships through the service.
 * Expected errors: INVALID_JSON and AuthServiceError codes coming from the service.
 */
export async function handleRegister(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const body = await readJsonBody(request);
    const result = await register(env, body as Parameters<typeof register>[1]);

    return json(result, 201);
    } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    console.error("AUTH_REGISTER_UNEXPECTED_ERROR", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be POST and body must be valid login JSON.
 * Side effects: may create an access token through the service.
 * Expected errors: INVALID_JSON and AuthServiceError codes coming from the service.
 */
export async function handleLogin(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const body = await readJsonBody(request);
    const result = await login(env, body as Parameters<typeof login>[1]);

    return json(result, 200);
      } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET and Authorization header must contain a valid Bearer token.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED for missing/invalid token.
 */
export async function handleMe(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);

    return json(
      {
        user: {
          id: auth.userId,
          email: auth.email,
        },
        activeOrg: {
          id: auth.orgId,
        },
        membership: {
          role: auth.role,
        },
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
 * Preconditions: request method must be GET and Authorization header must contain a valid Bearer token.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED for missing/invalid token.
 */
export async function handleAuthContext(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);

    return json(
      {
        auth,
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
 * Preconditions: request method must be GET and Authorization header must contain a valid Bearer token.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED for missing/invalid token, FORBIDDEN for insufficient role.
 */
export async function handleAdminCheck(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);

    if (!hasRequiredRole(auth.role, "admin")) {
      return errorJson("FORBIDDEN", "Insufficient role", 403);
    }

    return json(
      {
        ok: true,
        message: "You have admin-level access",
        user: {
          id: auth.userId,
          email: auth.email,
        },
        activeOrg: {
          id: auth.orgId,
        },
        membership: {
          role: auth.role,
        },
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
