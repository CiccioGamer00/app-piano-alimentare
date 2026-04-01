/**
 * Purpose: Reads and validates Bearer auth tokens from incoming requests.
 * Direct dependencies: shared token verification, db Env type and request auth context type.
 * Inputs/Outputs: HTTP Request + Env -> authenticated request context.
 * Security: Rejects missing or invalid tokens and exposes only validated auth claims.
 * Notes: This is the base guard for future protected routes.
 */

import type { Env } from "../db";
import { verifyAccessToken } from "./token";
import type { RequestAuthContext } from "./request-context";
import { AuthServiceError } from "../../modules/auth/service";

/**
 * Preconditions: request should contain Authorization: Bearer <token>.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED for missing or invalid tokens.
 */
export async function requireAuth(
  request: Request,
  env: Env
): Promise<RequestAuthContext> {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader) {
    throw new AuthServiceError(
      "UNAUTHORIZED",
      "Missing Authorization header",
      401
    );
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AuthServiceError(
      "UNAUTHORIZED",
      "Authorization header must use Bearer token",
      401
    );
  }

  const payload = await verifyAccessToken(env, token);

  if (!payload) {
    throw new AuthServiceError(
      "UNAUTHORIZED",
      "Invalid or expired access token",
      401
    );
  }

  return {
    userId: payload.sub,
    email: payload.email,
    orgId: payload.org_id,
    role: payload.role,
  };
}
